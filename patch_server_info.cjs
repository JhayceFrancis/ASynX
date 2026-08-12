const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const exportBlock = `app.post("/api/remote-sync/export", (req, res) => {
  const { apiKey } = req.body;
  if (!appSettings.remoteSync || apiKey !== appSettings.remoteSync.apiKey) {
    return res.status(401).json({ error: "Unauthorized. Invalid remote API Key." });
  }

  return res.json({
    appSettings,
    libraryItems,
    syncLogs,
    webhookLogs,
    extensionState
  });
});`;

const infoBlock = `
app.post("/api/remote-sync/info", (req, res) => {
  const { apiKey } = req.body;
  if (!appSettings.remoteSync || apiKey !== appSettings.remoteSync.apiKey) {
    return res.status(401).json({ error: "Unauthorized. Invalid remote API Key." });
  }

  return res.json({
    success: true,
    version: "1.0.0",
    message: "Connected to ASynx Remote Server successfully!"
  });
});`;

content = content.replace(exportBlock, exportBlock + infoBlock);

// Replace host binding logic
const oldListen = `app.listen(PORT, "0.0.0.0", () => {
    console.log(\`AniSync Matrix Server running on http://localhost:\${PORT}\`);
  });`;

const newListen = `const HOST = process.env.HOST || "0.0.0.0";
  app.listen(PORT, HOST, () => {
    console.log(\`AniSync Matrix Server running on http://\${HOST}:\${PORT}\`);
  });`;

content = content.replace(oldListen, newListen);

// Let's enforce environment API key for the server
const envKeyCheck = `// Initial library seed data logic usually follows...
if (process.env.REMOTE_SYNC_API_KEY) {
  if (!appSettings.remoteSync) {
    appSettings.remoteSync = { enabled: true, serverUrl: "", apiKey: "" };
  }
  appSettings.remoteSync.apiKey = process.env.REMOTE_SYNC_API_KEY;
  appSettings.remoteSync.enabled = true;
}`;

// inject after loading the db
const oldLoad = `appSettings = dbData.appSettings || defaultSettings;
libraryItems = dbData.libraryItems || defaultLibraryItems;
syncLogs = dbData.syncLogs || [];
webhookLogs = dbData.webhookLogs || [];
extensionState = dbData.extensionState || defaultExtensionState;`;

content = content.replace(oldLoad, oldLoad + "\n" + envKeyCheck);

fs.writeFileSync('server.ts', content);
