import { app, BrowserWindow, net, nativeImage, Tray, Menu } from 'electron';
import path, { dirname } from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

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

  // Tray Setup
  const icon = nativeImage.createEmpty(); // Replace with actual icon if available
  
  if (!tray) {
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show ASynX Studio', click: function () { mainWindow.show(); } },
      { label: 'Quit', click: function () { isQuitting = true; app.quit(); } }
    ]);
    tray.setToolTip('ASynX Background Sync Daemon');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => mainWindow.show());
  }


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
    const freePort = await getFreePort();
    process.env.PORT = freePort.toString();
    console.log(`Starting Express server on dynamically allocated port: ${freePort}`);
    
    // Set a custom data directory for Electron so it doesn't pollute the program files
    process.env.DATA_DIR = app.getPath('userData');

    // Start the Express server directly within the Electron main process
    require(path.join(__dirname, 'dist', 'server.cjs'));
    console.log("Express server started successfully.");
    
    createWindow(freePort);
  } catch (error) {
    console.error("Failed to start Express server:", error);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(process.env.PORT);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && isQuitting) app.quit();
});
