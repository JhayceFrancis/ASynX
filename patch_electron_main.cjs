const fs = require('fs');
let content = fs.readFileSync('electron-main.js', 'utf8');

const crashHandler = `
// --- Global Crash Logging (UK English Standardisation) ---
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
// ---------------------------------------------------------
`;

if (!content.includes('logCrashAndTerminate')) {
  content = content.replace(
    "const require = createRequire(import.meta.url);",
    "const require = createRequire(import.meta.url);\n\n" + crashHandler
  );
  
  content = content.replace(
    "process.env.DATA_DIR = app.getPath('userData');",
    "// Ensure the database is saved to the userData directory in production to avoid read-only .asar restrictions\n    process.env.DATA_DIR = app.isPackaged ? app.getPath('userData') : process.cwd();"
  );
  
  fs.writeFileSync('electron-main.js', content);
}
