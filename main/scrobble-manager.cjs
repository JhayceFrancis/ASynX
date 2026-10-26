const SyncEngine = require('./sync-engine.cjs');
const PlayerDetector = require('./player-detector.cjs');
const MpcBeScrobbler = require('./mpc-be-service.cjs');
const VlcScrobbler = require('./vlc-service.cjs');
const MpvScrobbler = require('./mpv-service.cjs');
const ScrobbleRuleEngine = require('./rule-engine.cjs');
const { ipcMain } = require('electron');
const { io } = require('socket.io-client');
const BookmarkManager = require('./bookmark-manager.cjs');

class ScrobbleManager {
  constructor(syncApiEndpoint, relationsDb = {}) {
    this.syncApiEndpoint = syncApiEndpoint;
    this.relationsDb = relationsDb;
    this.isEnabled = true;

    this.activePlayerType = null;
    this.activeService = null;
    this.processCheckInterval = null;

    this.ruleEngine = new ScrobbleRuleEngine(this.relationsDb);
    this.syncEngine = new SyncEngine(this.relationsDb);

    this.lastProcessedFile = null;
    this.lastState = null;
    this.bookmarkManager = new BookmarkManager();
    this.hubSocket = null;
    this.hubUrl = null;
    this.hubApiKey = null;

    this.init();
  }

  init() {
    this.processCheckInterval = setInterval(() => this.detectAndSwitchPlayer(), 10000);
    this.detectAndSwitchPlayer();

    ipcMain.handle('scrobble:toggle', (event, enabledState) => {
      this.isEnabled = enabledState;
      if (!this.isEnabled && this.activeService) {
        this.activeService.stop();
      } else if (this.isEnabled && this.activeService) {
        this.activeService.start(3000);
      }
      return { success: true, enabled: this.isEnabled };
    });

    ipcMain.handle('scrobble:update-rules', (event, newRules) => {
      if (newRules.ignorePaths) this.ruleEngine.ignorePaths = newRules.ignorePaths;
      if (newRules.completionThreshold) this.ruleEngine.completionThreshold = newRules.completionThreshold;
      return { success: true };
    });
  }

  async detectAndSwitchPlayer() {
    if (!this.isEnabled) return;

    const detectedPlayer = await PlayerDetector.getActivePlayer();

    if (detectedPlayer === this.activePlayerType) return;

    console.log(`[Scrobbler] Player switched: ${this.activePlayerType || 'None'} -> ${detectedPlayer || 'None'}`);

    if (this.activeService) {
      this.activeService.stop();
      this.activeService.removeAllListeners('playerUpdate');
      this.activeService = null;
    }

    this.activePlayerType = detectedPlayer;

    switch (detectedPlayer) {
      case 'mpc-be':
        this.activeService = new MpcBeScrobbler(13579);
        break;
      case 'vlc':
        this.activeService = new VlcScrobbler('your-vlc-password', 8080);
        break;
      case 'mpv':
        this.activeService = new MpvScrobbler('\\\\.\\pipe\\mpvsocket');
        break;
      default:
        return;
    }

    this.activeService.on('playerUpdate', (data) => this.handlePlayerUpdate(data));
    this.activeService.start(3000);
  }

  async handlePlayerUpdate(playerData) {
    if (!this.isEnabled) return;

    const evaluation = await this.ruleEngine.processUpdate(playerData);
    if (evaluation.status !== 'accepted') {
      return;
    }

    const { payload } = evaluation;

    const hasStateChanged = this.lastState !== payload.action;
    const hasFileChanged = this.lastProcessedFile !== payload.filepath;

    if (hasStateChanged || hasFileChanged || payload.action === 'completed') {
      this.lastState = payload.action;
      this.lastProcessedFile = payload.filepath;

      await this.dispatchToSyncBackend(payload);
    }
  }

  updateHubSettings(remoteSync) {
    if (!remoteSync) return;

    if (this.hubUrl !== remoteSync.serverUrl || this.hubApiKey !== remoteSync.apiKey) {
      this.hubUrl = remoteSync.serverUrl;
      this.hubApiKey = remoteSync.apiKey;
      this.connectHub();
    }

    if (this.syncEngine) {
      if (remoteSync.simklClientId) this.syncEngine.config.simklClientId = remoteSync.simklClientId;
      if (remoteSync.malClientId) this.syncEngine.config.malClientId = remoteSync.malClientId;
      if (remoteSync.traktClientId) this.syncEngine.config.traktClientId = remoteSync.traktClientId;

      this.syncEngine.updateTokens({
        simkl: remoteSync.simklToken || (remoteSync.tokens && remoteSync.tokens.simkl) || null,
        anilist: remoteSync.anilistToken || (remoteSync.tokens && remoteSync.tokens.anilist) || null,
        mal: remoteSync.malToken || (remoteSync.tokens && remoteSync.tokens.mal) || null,
        trakt: remoteSync.traktToken || (remoteSync.tokens && remoteSync.tokens.trakt) || null
      });
    }
  }

  connectHub() {
    if (this.hubSocket) {
      this.hubSocket.disconnect();
    }
    if (!this.hubUrl) return;

    console.log('[ScrobbleManager] Connecting to Docker Hub:', this.hubUrl);
    this.hubSocket = io(this.hubUrl, {
      auth: { token: this.hubApiKey },
      reconnection: true
    });

    this.hubSocket.on('connect', () => {
      console.log('[ScrobbleManager] Connected to Hub via WebSocket');
      this.flushUnsynced();
    });

    this.hubSocket.on('connect_error', (err) => {
      console.log('[ScrobbleManager] Hub connect error:', err.message);
    });
  }

  async flushUnsynced() {
    if (!this.hubSocket || !this.hubSocket.connected) return;
    try {
      const unsynced = await this.bookmarkManager.getUnsyncedBookmarks();
      if (unsynced.length > 0) {
        console.log(`[ScrobbleManager] Flushing ${unsynced.length} unsynced records to Hub`);
        this.hubSocket.emit('scrobble:flush', unsynced, async (response) => {
          if (response && response.success) {
            for (const record of unsynced) {
              await this.bookmarkManager.updateSyncStatus(record.Timestamp, true);
            }
          }
        });
      }
    } catch {
      console.error('[ScrobbleManager] Flush error');
    }
  }

  async dispatchToSyncBackend(payload) {
    const { app } = require('electron');
    const path = require('path');
    const fsPromises = require('fs/promises');

    const datasetPath = path.join(app.getPath('userData'), 'local_bookmarks.csv');
    const timestamp = new Date().toISOString();

    const meta = payload.meta || {};
    const title = meta.title || '';
    const absoluteEpisode = meta.episode !== null && meta.episode !== undefined ? meta.episode : '';
    const season = meta.season !== null && meta.season !== undefined ? meta.season : '';
    const episode = meta.episode !== null && meta.episode !== undefined ? meta.episode : '';
    const action = payload.action || 'playing';

    const bookmarkRecord = `${timestamp},"${title}",${absoluteEpisode},${season},${episode},"${action}",false\n`;

    try {
      try {
        await fsPromises.access(datasetPath);
      } catch {
        const headers = 'Timestamp,Title,Absolute_Episode,Season,Episode,Action,Synced_To_Hub\n';
        await fsPromises.writeFile(datasetPath, headers, 'utf-8');
      }

      await fsPromises.appendFile(datasetPath, bookmarkRecord, 'utf-8');
      console.log('[Bookmark Saved Locally]:', bookmarkRecord.trim());

      if (this.hubSocket && this.hubSocket.connected) {
        this.hubSocket.emit(
          'scrobble:dispatch',
          { timestamp, title, absoluteEpisode, season, episode, action },
          async (response) => {
            if (response && response.success) {
              await this.bookmarkManager.updateSyncStatus(timestamp, true);
              console.log('[Bookmark Synced to Hub]:', timestamp);
            }
          }
        );
      }

      if (action === 'completed' && this.syncEngine) {
        await this.dispatchToExternalTrackers(meta, timestamp);
      }
    } catch (err) {
      console.error('[Bookmark Write Failed]:', err.message);
    }
  }

  async dispatchToExternalTrackers(meta, timestamp) {
    try {
      const idsObj = meta.ids || {};
      const externalIds = {
        mal: meta.malId || meta.mal || idsObj.mal || null,
        anilist: meta.anilistId || meta.anilist || idsObj.anilist || null,
        anidb: meta.anidbId || meta.anidb || idsObj.anidb || null,
        simkl: meta.simklId || meta.simkl || idsObj.simkl || null,
        trakt: meta.traktId || meta.trakt || idsObj.trakt || null,
        imdb: meta.imdbId || meta.imdb || idsObj.imdb || null,
        tvdb: meta.tvdbId || meta.tvdb || idsObj.tvdb || null,
        type: meta.type || 'anime'
      };

      const statePayload = {
        title: meta.title || 'Unknown Title',
        episode: Number(meta.episode) || 1,
        season: Number(meta.season) || 1,
        status: meta.isFinalEpisode ? 'completed' : 'watching',
        score: meta.score || 0,
        watchedAt: timestamp
      };

      const result = await this.syncEngine.synchroniseMediaState(externalIds, statePayload);
      console.log(`[ScrobbleManager] External Tracker Sync (${statePayload.title} Ep ${statePayload.episode}):`, result.syncReport);
      return result;
    } catch (err) {
      console.error('[ScrobbleManager] External tracker sync failed:', err.message);
    }
  }
}

module.exports = ScrobbleManager;
