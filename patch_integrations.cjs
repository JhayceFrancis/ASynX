const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `// Settings API Endpoints
app.get("/api/settings", (req, res) => {
  res.json(appSettings);
});`;

const replacement = `// Settings API Endpoints
app.get("/api/settings", (req, res) => {
  res.json(appSettings);
});

// Integration API Endpoints
app.get("/api/integrations/:platform", (req, res) => {
  const { platform } = req.params;
  if (appSettings[platform as keyof AppSettings]) {
    res.json(appSettings[platform as keyof AppSettings]);
  } else {
    res.status(404).json({ error: "Integration not found" });
  }
});

app.post("/api/integrations/:platform", (req, res) => {
  const { platform } = req.params;
  if (appSettings[platform as keyof AppSettings]) {
    (appSettings as any)[platform] = { ...(appSettings as any)[platform], ...req.body };
    persistDb();
    res.json({ success: true, data: (appSettings as any)[platform] });
  } else {
    res.status(404).json({ error: "Integration not found" });
  }
});`;

fs.writeFileSync('server.ts', code.replace(target, replacement));
