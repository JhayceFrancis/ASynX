const path = require('path');
const anitomy = require('anitomy-js');
const AnimeMapper = require('./anime-mapper.cjs');
const AnimeTitleMatcher = require('./title-matcher.cjs');

class ScrobbleRuleEngine {
  constructor(relationsDb) {
    this.ignorePaths = [];
    this.completionThreshold = 0.8;
    this.animeMapper = new AnimeMapper(relationsDb);
    this.titleMatcher = new AnimeTitleMatcher();
  }

  async processUpdate(playerData) {
    if (!playerData || !playerData.filepath) {
      return { status: 'rejected', reason: 'No filepath provided' };
    }

    // Check ignore paths
    for (const ignorePath of this.ignorePaths) {
      if (playerData.filepath.toLowerCase().includes(ignorePath.toLowerCase())) {
        return { status: 'rejected', reason: `Matched ignored path (${ignorePath})` };
      }
    }

    // Parse filename with anitomy
    const rawFilename = path.basename(playerData.filepath);
    let parsedMeta = {
      title: rawFilename,
      episode: null,
      season: null,
      releaseGroup: null,
      malId: null
    };

    try {
      const parsed = anitomy.parseSync(rawFilename);
      let title = parsed.anime_title || rawFilename;
      let episode = parsed.episode_number ? parseInt(parsed.episode_number, 10) : null;
      let season = parsed.anime_season ? parseInt(parsed.anime_season, 10) : null;
      let malId = null;

      // Pipeline Step 2: Resolve parsed title to MAL ID
      if (parsed.anime_title) {
        malId = await this.titleMatcher.getMalId(parsed.anime_title);
      }

      // Pipeline Step 3: Map Absolute Episode to SxxExx if needed
      if (malId) {
         if (episode !== null && season === null) {
            const mapped = this.animeMapper.convertToSeasonEpisode(malId.toString(), episode);
            if (mapped) {
              season = mapped.season;
              episode = mapped.episode;
            } else {
              season = 1;
            }
         } else if (season === null) {
            season = 1;
         }
      } else {
         // Fallback if MAL ID not found
         if (season === null) season = 1;
      }

      parsedMeta = {
        title: title,
        episode: episode,
        season: season,
        malId: malId,
        releaseGroup: parsed.release_group || null
      };
    } catch (e) {
      // Fallback
    }

    const { position, duration, state } = playerData;
    let action = 'playing';

    if (duration > 0 && position / duration >= this.completionThreshold) {
      action = 'completed';
    } else if (state === 'paused') {
      action = 'paused';
    } else if (state === 'stopped') {
      action = 'stopped';
    }

    return {
      status: 'accepted',
      payload: {
        filepath: playerData.filepath,
        action,
        position,
        duration,
        meta: parsedMeta
      }
    };
  }
}

module.exports = ScrobbleRuleEngine;
