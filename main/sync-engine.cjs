/**
 * ASynX Multi-Platform Synchronisation & ID Resolution Engine
 * Supports: Simkl, AniList, MyAnimeList (MAL), Trakt, and AniDB ID Crosswalking
 */

class SyncEngine {
  /**
   * @param {Object} relationsDb - Local offline anime relations cache from database-updater.cjs
   * @param {Object} config - Client credentials and user OAuth tokens
   */
  constructor(relationsDb = {}, config = {}) {
    this.relationsDb = relationsDb;
    this.config = {
      simklClientId: config.simklClientId || process.env.SIMKL_CLIENT_ID || '',
      malClientId: config.malClientId || process.env.MAL_CLIENT_ID || '',
      traktClientId: config.traktClientId || process.env.TRAKT_CLIENT_ID || '',
      tokens: {
        simkl: config.tokens?.simkl || null,
        anilist: config.tokens?.anilist || null,
        mal: config.tokens?.mal || null,
        trakt: config.tokens?.trakt || null,
      }
    };

    // Standardised Status Mapping Matrix across all platforms
    this.STATUS_MAP = {
      watching: {
        simkl: 'watching',
        anilist: 'CURRENT',
        mal: 'watching',
      },
      completed: {
        simkl: 'completed',
        anilist: 'COMPLETED',
        mal: 'completed',
      },
      paused: {
        simkl: 'hold',
        anilist: 'PAUSED',
        mal: 'on_hold',
      },
      dropped: {
        simkl: 'dropped',
        anilist: 'DROPPED',
        mal: 'dropped',
      },
      planned: {
        simkl: 'plantowatch',
        anilist: 'PLANNING',
        mal: 'plan_to_watch',
      }
    };
  }

  /**
   * Update user OAuth tokens dynamically when settings change in the UI
   */
  updateTokens(newTokens = {}) {
    this.config.tokens = { ...this.config.tokens, ...newTokens };
  }

  /**
   * STEP 1: Universal ID Crosswalk
   * Resolves a single known ID (anidb, mal, anilist, trakt, imdb, tvdb) into all platform IDs.
   * Uses local relationsDb first, then falls back to Simkl's /search/id Rosetta Stone API.
   *
   * @param {Object} externalId - e.g. { mal: 51415 } or { anidb: 15410 } or { trakt: 12345 }
   * @returns {Promise<Object>} Unified ID map: { simkl, mal, anilist, anidb, trakt, imdb, tvdb, type }
   */
  async resolveCrossPlatformIds(externalId) {
    const unifiedIds = {
      simkl: externalId.simkl || null,
      mal: externalId.mal || null,
      anilist: externalId.anilist || null,
      anidb: externalId.anidb || null,
      trakt: externalId.trakt || null,
      imdb: externalId.imdb || null,
      tvdb: externalId.tvdb || null,
      type: externalId.type || 'anime'
    };

    // 1A. Check local offline relations cache first (Zero-Latency)
    if (this.relationsDb && Object.keys(this.relationsDb).length > 0) {
      const localMatch = this._findInLocalDb(unifiedIds);
      if (localMatch) {
        Object.assign(unifiedIds, localMatch);
      }
    }

    // 1B. Fallback to Simkl's /search/id endpoint if key target IDs are still missing
    if (!unifiedIds.simkl || !unifiedIds.mal || !unifiedIds.anilist) {
      const queryParams = new URLSearchParams({
        client_id: this.config.simklClientId
      });

      if (unifiedIds.mal) queryParams.set('mal', unifiedIds.mal);
      else if (unifiedIds.anidb) queryParams.set('anidb', unifiedIds.anidb);
      else if (unifiedIds.anilist) queryParams.set('anilist', unifiedIds.anilist);
      else if (unifiedIds.trakt) queryParams.set('trakt', unifiedIds.trakt);
      else if (unifiedIds.imdb) queryParams.set('imdb', unifiedIds.imdb);
      else if (unifiedIds.tvdb) queryParams.set('tvdb', unifiedIds.tvdb);

      try {
        const response = await fetch(`https://api.simkl.com/search/id?${queryParams.toString()}`, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const item = data[0];
            unifiedIds.simkl = item.ids?.simkl || unifiedIds.simkl;
            unifiedIds.type = item.type || unifiedIds.type;

            // Fetch full external ID tree from Simkl summary if needed
            if (unifiedIds.simkl) {
              const fullIds = await this._fetchSimklExternalIds(unifiedIds.simkl, unifiedIds.type);
              Object.assign(unifiedIds, fullIds);
            }
          }
        }
      } catch (err) {
        console.warn(`[SyncEngine] Simkl ID lookup fallback failed:`, err.message);
      }
    }

    return unifiedIds;
  }

  /**
   * Queries Simkl's item endpoint to extract all linked third-party IDs (MAL, AniList, AniDB, Trakt)
   */
  async _fetchSimklExternalIds(simklId, mediaType = 'anime') {
    const endpoint = mediaType === 'movie' ? 'movies' : (mediaType === 'tv' ? 'tv' : 'anime');
    try {
      const res = await fetch(
        `https://api.simkl.com/${endpoint}/${simklId}?extended=full&client_id=${this.config.simklClientId}`
      );
      if (!res.ok) return {};
      const data = await res.json();
      return {
        mal: data.ids?.mal ? Number(data.ids.mal) : null,
        anilist: data.ids?.anilist ? Number(data.ids.anilist) : null,
        anidb: data.ids?.anidb ? Number(data.ids.anidb) : null,
        trakt: data.ids?.trakt ? Number(data.ids.trakt) : null,
        imdb: data.ids?.imdb || null,
        tvdb: data.ids?.tvdb ? Number(data.ids.tvdb) : null,
      };
    } catch {
      return {};
    }
  }

  /**
   * Helper to lookup IDs in the local offline database
   */
  _findInLocalDb(ids) {
    // Adapts to standard anime-lists / anime-relations dictionary structure
    if (ids.mal && this.relationsDb[ids.mal]) {
      return this.relationsDb[ids.mal];
    }
    return null;
  }

  /**
   * STEP 2: Score & Status Normalisation
   * Converts any rating into a standard 1-10 integer for MAL/Simkl/Trakt and 1-100 for AniList
   */
  normalisePayload(rawPayload) {
    const canonicalStatus = (rawPayload.status || 'watching').toLowerCase();
    const rawScore = Number(rawPayload.score) || 0; // Expected on a 0-100 or 0-10 scale
    const score10 = rawScore > 10 ? Math.round(rawScore / 10) : Math.round(rawScore);
    const score100 = rawScore <= 10 ? rawScore * 10 : Math.round(rawScore);

    return {
      title: rawPayload.title || 'Unknown Title',
      episode: Number(rawPayload.episode) || 1,
      season: Number(rawPayload.season) || 1,
      status: this.STATUS_MAP[canonicalStatus] ? canonicalStatus : 'watching',
      score10,
      score100,
      watchedAt: rawPayload.watchedAt || new Date().toISOString()
    };
  }

  /**
   * STEP 3: Multi-Target Fan-Out Synchronisation Dispatcher
   * Pushes the watch state to all enabled and authenticated trackers concurrently.
   *
   * @param {Object} externalId - Known ID(s), e.g., { mal: 51415 } or { anidb: 15410 }
   * @param {Object} statePayload - { title, episode, season, status, score }
   */
  async synchroniseMediaState(externalId, statePayload) {
    const ids = await this.resolveCrossPlatformIds(externalId);
    const normalised = this.normalisePayload(statePayload);

    const tasks = [];

    if (this.config.tokens.simkl) {
      tasks.push(
        this._syncToSimkl(ids, normalised).then((res) => ({ platform: 'Simkl', ...res }))
      );
    }

    if (this.config.tokens.anilist && ids.anilist) {
      tasks.push(
        this._syncToAniList(ids.anilist, normalised).then((res) => ({ platform: 'AniList', ...res }))
      );
    }

    if (this.config.tokens.mal && ids.mal) {
      tasks.push(
        this._syncToMal(ids.mal, normalised).then((res) => ({ platform: 'MAL', ...res }))
      );
    }

    if (this.config.tokens.trakt && (ids.trakt || ids.imdb || ids.tvdb)) {
      tasks.push(
        this._syncToTrakt(ids, normalised).then((res) => ({ platform: 'Trakt', ...res }))
      );
    }

    const results = await Promise.allSettled(tasks);

    return {
      resolvedIds: ids,
      normalisedState: normalised,
      syncReport: results.map((r) =>
        r.status === 'fulfilled'
          ? r.value
          : { platform: 'Unknown', success: false, error: r.reason?.message }
      )
    };
  }

  /**
   * Target 1: Simkl Synchronisation
   */
  async _syncToSimkl(ids, state) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.tokens.simkl}`,
      'simkl-api-key': this.config.simklClientId
    };

    const showIds = {};
    if (ids.simkl) showIds.simkl = ids.simkl;
    if (ids.mal) showIds.mal = ids.mal;
    if (ids.anidb) showIds.anidb = ids.anidb;
    if (ids.anilist) showIds.anilist = ids.anilist;

    // 1. Update Watchlist Status
    const statusBody = {
      shows: [{
        title: state.title,
        ids: showIds,
        to: this.STATUS_MAP[state.status].simkl
      }]
    };

    await fetch('https://api.simkl.com/sync/add-to-list', {
      method: 'POST',
      headers,
      body: JSON.stringify(statusBody)
    });

    // 2. Mark specific episode watched in history
    const historyBody = {
      shows: [{
        title: state.title,
        ids: showIds,
        seasons: [{
          number: state.season,
          episodes: [{ number: state.episode, watched_at: state.watchedAt }]
        }]
      }]
    };

    const histRes = await fetch('https://api.simkl.com/sync/history', {
      method: 'POST',
      headers,
      body: JSON.stringify(historyBody)
    });

    if (!histRes.ok) {
      throw new Error(`Simkl HTTP ${histRes.status}`);
    }

    return { success: true };
  }

  /**
   * Target 2: AniList GraphQL Synchronisation
   */
  async _syncToAniList(anilistId, state) {
    const query = `
      mutation ($mediaId: Int, $status: MediaListStatus, $progress: Int, $scoreRaw: Int) {
        SaveMediaListEntry (mediaId: $mediaId, status: $status, progress: $progress, scoreRaw: $scoreRaw) {
          id
          status
          progress
        }
      }
    `;

    const variables = {
      mediaId: Number(anilistId),
      status: this.STATUS_MAP[state.status].anilist,
      progress: state.episode,
      ...(state.score100 > 0 ? { scoreRaw: state.score100 } : {})
    };

    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.config.tokens.anilist}`
      },
      body: JSON.stringify({ query, variables })
    });

    if (!res.ok) {
      throw new Error(`AniList HTTP ${res.status}`);
    }

    return { success: true };
  }

  /**
   * Target 3: MyAnimeList (MAL) REST v2 Synchronisation
   */
  async _syncToMal(malId, state) {
    const formBody = new URLSearchParams({
      status: this.STATUS_MAP[state.status].mal,
      num_watched_episodes: String(state.episode)
    });

    if (state.score10 > 0) {
      formBody.set('score', String(state.score10));
    }

    const res = await fetch(`https://api.myanimelist.net/v2/anime/${malId}/my_list_status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${this.config.tokens.mal}`
      },
      body: formBody.toString()
    });

    if (!res.ok) {
      throw new Error(`MAL HTTP ${res.status}`);
    }

    return { success: true };
  }

  /**
   * Target 4: Trakt.tv Synchronisation
   */
  async _syncToTrakt(ids, state) {
    const showIds = {};
    if (ids.trakt) showIds.trakt = ids.trakt;
    if (ids.imdb) showIds.imdb = ids.imdb;
    if (ids.tvdb) showIds.tvdb = ids.tvdb;

    const body = {
      shows: [{
        ids: showIds,
        seasons: [{
          number: state.season,
          episodes: [{
            number: state.episode,
            watched_at: state.watchedAt
          }]
        }]
      }]
    };

    const res = await fetch('https://api.trakt.tv/sync/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.tokens.trakt}`,
        'trakt-api-version': '2',
        'trakt-api-key': this.config.traktClientId
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Trakt HTTP ${res.status}`);
    }

    return { success: true };
  }
}

module.exports = SyncEngine;
