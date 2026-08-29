const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Ingest route
content = content.replace(
`  const newBookmark = { 
    id: Date.now().toString(), 
    createdAt: new Date().toISOString(), 
    url: '', description: '', image: '', tags: [], 
    title: payload.title,
    status: payload.action === 'completed' ? 'completed' : 'watching',
    ...payload
  };`,
`  const newBookmark = { 
    id: Date.now().toString(), 
    createdAt: payload.timestamp || new Date().toISOString(), 
    url: '', description: '', image: '', tags: [], 
    title: payload.title,
    status: payload.action === 'completed' ? 'completed' : 'watching',
    ...payload
  };`);

// socket dispatch route
content = content.replace(
`      const newBookmark = { 
        id: Date.now().toString(), 
        createdAt: new Date().toISOString(), 
        url: '', description: '', image: '', tags: [], 
        title: payload.title,
        status: payload.action === 'completed' ? 'completed' : 'watching'
      };`,
`      const newBookmark = { 
        id: Date.now().toString(), 
        createdAt: payload.timestamp || new Date().toISOString(), 
        url: '', description: '', image: '', tags: [], 
        title: payload.title,
        status: payload.action === 'completed' ? 'completed' : 'watching'
      };`);

// socket flush route
content = content.replace(
`        const newBookmark = { 
          id: Date.now().toString() + count, 
          createdAt: new Date().toISOString(), 
          url: '', description: '', image: '', tags: [], 
          title: payload.Title,
          status: payload.Action === 'completed' ? 'completed' : 'watching'
        };`,
`        const newBookmark = { 
          id: Date.now().toString() + count, 
          createdAt: payload.Timestamp || new Date().toISOString(), 
          url: '', description: '', image: '', tags: [], 
          title: payload.Title,
          status: payload.Action === 'completed' ? 'completed' : 'watching'
        };`);

fs.writeFileSync('server.ts', content);
