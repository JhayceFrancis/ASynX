const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const ingestRoute = `
// Endpoint for Browser Plugin (Stateless REST Edge)
app.post("/api/ingest", (req, res) => {
  const authHeader = req.headers.authorization;
  if (appSettings.remoteSync?.enabled && appSettings.remoteSync?.apiKey) {
    if (!authHeader || authHeader !== \`Bearer \${appSettings.remoteSync.apiKey}\`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  const payload = req.body;
  if (!payload || !payload.title) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const newBookmark = { 
    id: Date.now().toString(), 
    createdAt: new Date().toISOString(), 
    url: '', description: '', image: '', tags: [], 
    title: payload.title,
    status: payload.action === 'completed' ? 'completed' : 'watching',
    ...payload
  };
  
  bookmarks.push(newBookmark);
  persistDb();
  
  if (app.locals.io) {
    app.locals.io.emit('scrobble:broadcast', newBookmark);
  }
  
  res.json({ success: true, ingested: true });
});
`;

content = content.replace('app.get("/api/bookmarks", (req, res) => res.json(bookmarks));', ingestRoute + '\napp.get("/api/bookmarks", (req, res) => res.json(bookmarks));');

fs.writeFileSync('server.ts', content);
