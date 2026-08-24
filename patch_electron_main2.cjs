const fs = require('fs');
let content = fs.readFileSync('electron-main.js', 'utf8');

// Add electron-log and dialog imports
content = content.replace(
  "import { app, BrowserWindow, net, nativeImage, Tray, Menu, ipcMain } from 'electron';",
  "import { app, BrowserWindow, net, nativeImage, Tray, Menu, ipcMain, dialog } from 'electron';\nimport log from 'electron-log';"
);

// Replace custom crash logging with electron-log
const customCrashLogOld = `// --- Global Crash Logging (UK English Standardisation) ---
const logFilePath = path.join(app.getPath('userData'), 'asynx-crash.log');

function logCrashAndTerminate(type, error) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.stack || error.message : String(error);
  const logMessage = "[" + timestamp + "] " + type + ": " + errorMessage + "\\n";
  
  try {
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
  } catch (logError) {
    console.error('Failed to write to crash log:', logError);
  }
  
  console.error("Fatal " + type + " occurred. Check crash log at: " + logFilePath);
  app.exit(1); // Safely terminate the application
}

process.on('uncaughtException', (error) => logCrashAndTerminate('UncaughtException', error));
process.on('unhandledRejection', (reason) => logCrashAndTerminate('UnhandledRejection', reason));
// ---------------------------------------------------------`;

const electronCrashLogNew = `// --- Global Crash Logging via electron-log (UK English Standardisation) ---
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
// ---------------------------------------------------------`;

content = content.replace(customCrashLogOld, electronCrashLogNew);

// Insert pre-boot write check in app.whenReady()
const whenReadyOld = `  try {
    const freePort = await getFreePort();
    process.env.PORT = freePort.toString();
    console.log(\`Starting Express server on dynamically allocated port: \${freePort}\`);
    
    // Set a custom data directory for Electron so it doesn't pollute the program files
    // Ensure the database is saved to the userData directory in production to avoid read-only .asar restrictions
    process.env.DATA_DIR = app.isPackaged ? app.getPath('userData') : process.cwd();

    // Start the Express server directly within the Electron main process
    require(path.join(__dirname, 'dist', 'server.cjs'));`;

const whenReadyNew = `  try {
    // Ensure the database is saved to the userData directory in production to avoid read-only .asar restrictions
    const dataDir = app.isPackaged ? app.getPath('userData') : process.cwd();
    process.env.DATA_DIR = dataDir;

    // Pre-boot write-accessibility check
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.accessSync(dataDir, fs.constants.W_OK);
      log.info(\`Database directory is write-accessible: \${dataDir}\`);
    } catch (dirErr) {
      log.error('Database directory write permission denied:', dirErr);
      dialog.showErrorBox(
        'Initialisation Error',
        \`ASynX cannot write to the required data directory.\\nPath: \${dataDir}\\n\\nPlease check your folder permissions and try again.\`
      );
      app.exit(1);
      return;
    }

    const freePort = await getFreePort();
    process.env.PORT = freePort.toString();
    log.info(\`Starting Express server on dynamically allocated port: \${freePort}\`);

    // Start the Express server directly within the Electron main process
    require(path.join(__dirname, 'dist', 'server.cjs'));`;

content = content.replace(whenReadyOld, whenReadyNew);

// Replace remaining console.log/error with log.info/error for consistency if needed, but not strictly required.
content = content.replace('console.log("Express server started successfully.");', 'log.info("Express server started successfully.");');
content = content.replace('console.error("Failed to start Express server:", error);', 'log.error("Failed to start Express server:", error);');

fs.writeFileSync('electron-main.js', content);
