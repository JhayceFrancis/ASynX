const fs = require('fs');
let content = fs.readFileSync('electron-main.js', 'utf8');

if (!content.includes('icon: path.join(__dirname, ')) {
  content = content.replace('mainWindow = new BrowserWindow({', 'mainWindow = new BrowserWindow({\n    icon: path.join(__dirname, \'build\', \'icon.png\'),');
}

fs.writeFileSync('electron-main.js', content);
