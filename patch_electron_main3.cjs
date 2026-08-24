const fs = require('fs');
let content = fs.readFileSync('electron-main.js', 'utf8');

const oldCheck = `    // Pre-boot write-accessibility check
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
    }`;

const newCheck = `    // Rigorous synchronous pre-boot write-accessibility check for database mounting
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.accessSync(dataDir, fs.constants.W_OK);
      log.info(\`Database directory is write-accessible: \${dataDir}\`);
    } catch (dirErr) {
      log.error('Database directory write permission denied:', dirErr);
      dialog.showErrorBox(
        'Critical Permission Error',
        \`ASynX cannot write to the required data directory to mount the database.\\nPath: \${dataDir}\\n\\nPlease check your folder permissions to prevent silent failures.\`
      );
      app.exit(1);
      return;
    }`;

content = content.replace(oldCheck, newCheck);
fs.writeFileSync('electron-main.js', content);
