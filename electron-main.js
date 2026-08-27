const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let serverProcess;

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

app.whenReady().then(() => {
  const serverPath = path.join(__dirname, 'dist', 'server.cjs');
  serverProcess = fork(serverPath, [], {
    env: { ...process.env, NODE_ENV: 'production', PORT: 0 } // port 0 means OS assigned
  });

  serverProcess.on('message', (msg) => {
    if (msg && msg.type === 'server-started' && msg.port) {
      createWindow(msg.port);
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
