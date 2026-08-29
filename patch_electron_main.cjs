const fs = require('fs');
let content = fs.readFileSync('electron-main.js', 'utf8');

// Replace imports
content = content.replace("const ScrobbleManager = require('./main/scrobble-manager.js');", 
`const AnimeRelationsUpdater = require('./main/database-updater.cjs');
const ScrobbleManager = require('./main/scrobble-manager.cjs');`);

content = content.replace("let scrobbleManager;", 
`let scrobbleManager;
let dbUpdater;
let relationsDb = {};`);

// Inject async and dbUpdater init
content = content.replace("app.whenReady().then(() => {", 
`app.whenReady().then(async () => {
  dbUpdater = new AnimeRelationsUpdater();
  await dbUpdater.init();
  relationsDb = await dbUpdater.loadCache();`);

// Update ScrobbleManager init
content = content.replace("scrobbleManager = new ScrobbleManager(`http://localhost:${msg.port}`);",
"scrobbleManager = new ScrobbleManager(`http://localhost:${msg.port}`, relationsDb);");

fs.writeFileSync('electron-main.js', content);
