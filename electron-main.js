import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const require = createRequire(import.meta.url);
const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const AnimeRelationsUpdater = require('./main/database-updater.cjs');
const BookmarkManager = require('./main/bookmark-manager.cjs');
const startLocalApi = require('./main/local-api.cjs');
const ScrobbleManager = require('./main/scrobble-manager.cjs');
let scrobbleManager;
let bookmarkManager;
let dbUpdater;
let relationsDb = {};


// Hardware acceleration fix
app.disableHardwareAcceleration();

let mainWindow;
let serverProcess;
let tray;

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0a0a0a',
      symbolColor: '#ffffff',
      height: 40
    },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.loadURL(`http://localhost:${port}`);
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
    bookmarkManager = new BookmarkManager();
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

  dbUpdater = new AnimeRelationsUpdater();
  await dbUpdater.init();
  relationsDb = await dbUpdater.loadCache();
  const iconPath = path.join(__dirname, 'dist', 'icon.png');
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show ASynX', click: () => { if (mainWindow) mainWindow.show(); } },
    { label: 'Quit', click: () => { app.quit(); } }
  ]);
  tray.setToolTip('ASynX');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });

  const serverPath = path.join(__dirname, 'dist', 'server.cjs');
  const userDataPath = app.getPath('userData');
  
  serverProcess = fork(serverPath, [], {
    env: { 
      ...process.env, 
      NODE_ENV: 'production', 
      PORT: 0,
      DATA_DIR: userDataPath
    } 
  });
  
  serverProcess.on('message', (msg) => {
    
    if (msg && msg.type === 'server-started' && msg.port) {
      if (!scrobbleManager) {
        scrobbleManager = new ScrobbleManager(`http://localhost:${msg.port}`, relationsDb);
      }

      createWindow(msg.port);
    }

    if (msg && msg.type === 'settings-updated' && scrobbleManager) {
      const daemonSettings = msg.settings.daemonSettings || {};
      const newRules = {
        ignorePaths: daemonSettings.scrobbleRules?.['MPC-BE']?.ignorePaths || [],
        completionThreshold: daemonSettings.scrobbleRules?.['MPC-BE']?.completionThreshold || 0.8
      };
      
      // Update rules directly on the manager's ruleEngine
      if (scrobbleManager.ruleEngine) {
        scrobbleManager.ruleEngine.ignorePaths = newRules.ignorePaths;
        scrobbleManager.ruleEngine.completionThreshold = newRules.completionThreshold;
      }
      
      // Update enabled state if it changed
      const isEnabled = !msg.settings.maintenanceMode; // Global pause logic
      
      if (scrobbleManager.isEnabled !== isEnabled) {
        scrobbleManager.isEnabled = isEnabled;
        if (!isEnabled && scrobbleManager.activeService) {
           scrobbleManager.activeService.stop();
        } else if (isEnabled && scrobbleManager.activeService) {
           scrobbleManager.activeService.start(3000);
        }
      }

      if (msg.settings.remoteSync) {
        scrobbleManager.updateHubSettings(msg.settings.remoteSync);
      }
    }

  });
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      // If we somehow close the window but the app is still alive
      // we'd need to know the port. But usually this just happens on mac.
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
