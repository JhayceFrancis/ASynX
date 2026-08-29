const fs = require('fs');
let content = fs.readFileSync('main/scrobble-manager.cjs', 'utf8');

// Replace the top imports
content = content.replace("const { ipcMain } = require('electron');", 
`const { ipcMain } = require('electron');
const { io } = require('socket.io-client');
const BookmarkManager = require('./bookmark-manager.cjs');`);

// Update constructor
content = content.replace("this.lastState = null;", 
`this.lastState = null;
    this.bookmarkManager = new BookmarkManager();
    this.hubSocket = null;
    this.hubUrl = null;
    this.hubApiKey = null;`);

// Add updateHubSettings and update dispatch logic
const newMethods = `
  updateHubSettings(remoteSync) {
    if (!remoteSync) return;
    if (this.hubUrl !== remoteSync.serverUrl || this.hubApiKey !== remoteSync.apiKey) {
      this.hubUrl = remoteSync.serverUrl;
      this.hubApiKey = remoteSync.apiKey;
      this.connectHub();
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
        console.log(\`[ScrobbleManager] Flushing \${unsynced.length} unsynced records to Hub\`);
        this.hubSocket.emit('scrobble:flush', unsynced, async (response) => {
           if (response && response.success) {
             for (const record of unsynced) {
               await this.bookmarkManager.updateSyncStatus(record.Timestamp, true);
             }
           }
        });
      }
    } catch (e) {
      console.error('[ScrobbleManager] Flush error:', e.message);
    }
  }

  async dispatchToSyncBackend(payload) {
    const { app } = require('electron');
    const path = require('path');
    const fsPromises = require('fs/promises');
    
    const datasetPath = path.join(app.getPath('userData'), 'local_bookmarks.csv');
    const timestamp = new Date().toISOString();
    
    const title = payload.meta.title || '';
    const absoluteEpisode = payload.meta.episode !== null ? payload.meta.episode : '';
    const season = payload.meta.season !== null ? payload.meta.season : '';
    const episode = payload.meta.episode !== null ? payload.meta.episode : ''; 
    const action = payload.action || 'playing';
    
    // Add Synced_To_Hub as false initially
    const bookmarkRecord = \`\${timestamp},"\${title}",\${absoluteEpisode},\${season},\${episode},"\${action}",false\\n\`;

    try {
      try {
        await fsPromises.access(datasetPath);
      } catch {
        const headers = "Timestamp,Title,Absolute_Episode,Season,Episode,Action,Synced_To_Hub\\n";
        await fsPromises.writeFile(datasetPath, headers, 'utf-8');
      }

      await fsPromises.appendFile(datasetPath, bookmarkRecord, 'utf-8');
      console.log('[Bookmark Saved Locally]:', bookmarkRecord.trim());

      // Attempt immediate dispatch over WebSocket if connected
      if (this.hubSocket && this.hubSocket.connected) {
         this.hubSocket.emit('scrobble:dispatch', {
           timestamp, title, absoluteEpisode, season, episode, action
         }, async (response) => {
            if (response && response.success) {
               await this.bookmarkManager.updateSyncStatus(timestamp, true);
               console.log('[Bookmark Synced to Hub]:', timestamp);
            }
         });
      }
    } catch (err) {
      console.error('[Bookmark Write Failed]:', err.message);
    }
  }
`;

content = content.replace(/async dispatchToSyncBackend\([\s\S]*?\n  }/, newMethods);
fs.writeFileSync('main/scrobble-manager.cjs', content);
