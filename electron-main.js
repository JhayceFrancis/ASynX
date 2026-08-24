import { app, BrowserWindow, net, nativeImage, Tray, Menu, ipcMain, dialog } from 'electron';
import log from 'electron-log';
import path, { dirname } from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);


// --- Global Crash Logging via electron-log (UK English Standardisation) ---
log.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'asynx-crash.log');
log.errorHandler.startCatching();

process.on('uncaughtException', (error) => {
  log.error('UncaughtException:', error);
  app.exit(1);
});
process.on('unhandledRejection', (reason) => {
  log.error('UnhandledRejection:', reason);
  app.exit(1);
});
// ---------------------------------------------------------


// Suppress DEP0180 (fs.Stats constructor deprecation) caused by Electron's internal asar handling in Node 22+
const originalEmitWarning = process.emitWarning;
process.emitWarning = function (warning, type, code, ...args) {
  const isDep0180 = code === 'DEP0180' || (warning && warning.code === 'DEP0180');
  if (isDep0180) return;
  return originalEmitWarning.call(process, warning, type, code, ...args);
};

let mainWindow;

// Optional: Auto launch setup
app.setLoginItemSettings({
  openAtLogin: true, // You could fetch this from daemonSettings
  path: app.getPath('exe'),
});

let tray = null;
let isQuitting = false;


// Force production mode so the server uses static files from /dist
process.env.NODE_ENV = 'production';

// Dynamically find a free port
function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

async function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#000000', // Match deep midnight black
      symbolColor: '#6366f1', // Match indigo-500
      height: 40,
    },
    backgroundColor: '#000000', // Prevent white flash on load
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.removeMenu();

  mainWindow.on('close', function (event) {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // --- Tray Setup & Dynamic Animation (324 Frames) ---

  const frameDir = path.join(__dirname, 'ASynX-split').replace('app.asar', 'app.asar.unpacked');

  // Set your default resting icon (using the first frame)
  const idleIcon = nativeImage.createFromPath(path.join(frameDir, 'ASynX_000.png'));

  // Automatically read, filter, and numerically sort all 324 PNG frames from ASynX_000 to ASynX_323
  const syncFrames = fs.readdirSync(frameDir)
    .filter(file => file.startsWith('ASynX_') && file.endsWith('.png'))
    .sort((a, b) => {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    })
    .map(file => nativeImage.createFromPath(path.join(frameDir, file)));

  let animationInterval = null;
  let currentFrame = 0;

  if (!tray) {
    tray = new Tray(idleIcon);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show ASynX Studio', click: function () { mainWindow.show(); } },
      { type: 'separator' },
      { label: 'Quit ASynX', click: function () { isQuitting = true; app.quit(); } }
    ]);
    tray.setToolTip('ASynX: Up to date');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => mainWindow.show());
  }

  // Function to start the high-density flipbook animation
  function startTrayAnimation() {
    if (animationInterval || syncFrames.length === 0) return;
    
    animationInterval = setInterval(() => {
      tray.setImage(syncFrames[currentFrame]);
      currentFrame = (currentFrame + 1) % syncFrames.length;
    }, 10); // 10ms interval ensures a silky-smooth loop across all 324 frames
  }

  // Function to stop and return to resting state
  function stopTrayAnimation() {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
    tray.setImage(idleIcon);
    currentFrame = 0;
  }

  // --- IPC Listeners for the React Frontend ---

  ipcMain.on('sync-started', () => {
    if (tray) tray.setToolTip('ASynX: Syncing...');
    startTrayAnimation();
  });

  ipcMain.on('sync-stopped', () => {
    if (tray) tray.setToolTip('ASynX: Up to date');
    stopTrayAnimation();
  });


  // Wait for the local Express server to start before loading
  const loadApp = () => {
    const req = http.get(`http://127.0.0.1:${port}`, (res) => {
      if (res.statusCode === 200 || res.statusCode === 304 || res.statusCode === 404) {
        mainWindow.loadURL(`http://127.0.0.1:${port}`);
      } else {
        setTimeout(loadApp, 250);
      }
    });
    req.on('error', () => {
      setTimeout(loadApp, 250); // Retry every 250ms
    });
  };

  loadApp();
}

app.whenReady().then(async () => {
  try {
    // Ensure the database is saved to the userData directory in production to avoid read-only .asar restrictions
    const dataDir = app.isPackaged ? app.getPath('userData') : process.cwd();
    process.env.DATA_DIR = dataDir;

    // Rigorous synchronous pre-boot write-accessibility check for database mounting
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.accessSync(dataDir, fs.constants.W_OK);
      log.info(`Database directory is write-accessible: ${dataDir}`);
    } catch (dirErr) {
      log.error('Database directory write permission denied:', dirErr);
      dialog.showErrorBox(
        'Critical Permission Error',
        `ASynX cannot write to the required data directory to mount the database.\nPath: ${dataDir}\n\nPlease check your folder permissions to prevent silent failures.`
      );
      app.exit(1);
      return;
    }

    const freePort = await getFreePort();
    process.env.PORT = freePort.toString();
    log.info(`Starting Express server on dynamically allocated port: ${freePort}`);

    // Start the Express server directly within the Electron main process
    require(path.join(__dirname, 'dist', 'server.cjs'));
    log.info("Express server started successfully.");
    
    createWindow(freePort);
  } catch (error) {
    log.error("Failed to start Express server:", error);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(process.env.PORT);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && isQuitting) app.quit();
});
