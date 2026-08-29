const fs = require('fs');
let content = fs.readFileSync('main/scrobble-manager.cjs', 'utf8');

// Replace the dispatch function
const dispatchLogic = `async dispatchToSyncBackend(payload) {
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
    
    const bookmarkRecord = \`\${timestamp},"\${title}",\${absoluteEpisode},\${season},\${episode},"\${action}"\\n\`;

    try {
      try {
        await fsPromises.access(datasetPath);
      } catch {
        const headers = "Timestamp,Title,Absolute_Episode,Season,Episode,Action\\n";
        await fsPromises.writeFile(datasetPath, headers, 'utf-8');
      }

      await fsPromises.appendFile(datasetPath, bookmarkRecord, 'utf-8');
      console.log('[Bookmark Saved]:', bookmarkRecord.trim());
    } catch (err) {
      console.error('[Bookmark Write Failed]:', err.message);
    }
  }`;

content = content.replace(/async dispatchToSyncBackend\([\s\S]*?\n  }/, dispatchLogic);
fs.writeFileSync('main/scrobble-manager.cjs', content);
