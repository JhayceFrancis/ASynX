const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const originalSocketConnection = `  app.locals.io.on('connection', (socket: import("socket.io").Socket) => {
    console.log('[SOCKET] Client connected:', socket.id);`;

const updatedSocketConnection = `  const processedHashes = new Set();
  app.locals.io.on('connection', (socket: import("socket.io").Socket) => {
    console.log('[SOCKET] Client connected:', socket.id);
    
    const token = socket.handshake.auth.token;
    if (appSettings.remoteSync?.enabled && appSettings.remoteSync?.apiKey && token !== appSettings.remoteSync.apiKey) {
      console.log('[SOCKET] Rejecting unauthorized connection');
      socket.disconnect(true);
      return;
    }

    socket.on('scrobble:dispatch', (payload, callback) => {
      const hash = \`\${payload.title}-\${payload.season}-\${payload.episode}-\${payload.timestamp}\`;
      if (processedHashes.has(hash)) {
         if (callback) callback({ success: true, message: 'Duplicate dropped' });
         return;
      }
      processedHashes.add(hash);
      console.log('[Hub Gateway] Ingested Scrobble:', payload.title, payload.episode);
      
      const newBookmark = { 
        id: Date.now().toString(), 
        createdAt: new Date().toISOString(), 
        url: '', description: '', image: '', tags: [], 
        title: payload.title,
        status: payload.action === 'completed' ? 'completed' : 'watching'
      };
      bookmarks.push(newBookmark);
      persistDb();
      
      app.locals.io.emit('scrobble:broadcast', newBookmark);
      
      if (callback) callback({ success: true });
    });

    socket.on('scrobble:flush', (unsyncedRecords, callback) => {
      let count = 0;
      for (const payload of unsyncedRecords) {
        const hash = \`\${payload.Title}-\${payload.Season}-\${payload.Episode}-\${payload.Timestamp}\`;
        if (processedHashes.has(hash)) continue;
        processedHashes.add(hash);
        
        const newBookmark = { 
          id: Date.now().toString() + count, 
          createdAt: new Date().toISOString(), 
          url: '', description: '', image: '', tags: [], 
          title: payload.Title,
          status: payload.Action === 'completed' ? 'completed' : 'watching'
        };
        bookmarks.push(newBookmark);
        count++;
      }
      if (count > 0) persistDb();
      
      console.log('[Hub Gateway] Flushed', count, 'unsynced records.');
      if (callback) callback({ success: true, count });
    });`;

content = content.replace(originalSocketConnection, updatedSocketConnection);
fs.writeFileSync('server.ts', content);
