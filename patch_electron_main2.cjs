const fs = require('fs');
let content = fs.readFileSync('electron-main.js', 'utf8');

const imports = `const BookmarkManager = require('./main/bookmark-manager.cjs');
const startLocalApi = require('./main/local-api.cjs');
`;
content = content.replace("const ScrobbleManager = require('./main/scrobble-manager.cjs');", 
imports + "const ScrobbleManager = require('./main/scrobble-manager.cjs');");

const vars = `let bookmarkManager;`;
content = content.replace("let dbUpdater;", 
vars + "\nlet dbUpdater;");

const ipc = `  bookmarkManager = new BookmarkManager();
  startLocalApi(bookmarkManager);

  require('electron').ipcMain.handle('bookmarks:fetch', async () => {
    const datasetName = (await bookmarkManager.getDatasetConfig()).datasetName;
    const records = await bookmarkManager.getBookmarks();
    return { datasetName, records };
  });

  require('electron').ipcMain.handle('bookmarks:rename', async (event, newName) => {
    await bookmarkManager.renameDataset(newName);
    return { success: true, datasetName: newName };
  });
`;
content = content.replace("dbUpdater = new AnimeRelationsUpdater();", ipc + "\n  dbUpdater = new AnimeRelationsUpdater();");

fs.writeFileSync('electron-main.js', content);
