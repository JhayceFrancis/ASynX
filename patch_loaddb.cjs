const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `export let bookmarks = dbState.bookmarks_database || [];

// Settings Initialization`;

const replacement = `export let bookmarks = dbState.bookmarks_database || [];

// Ensure Webhook URLs are hydrated properly on load
const baseAppUrl = process.env.APP_URL || 'http://localhost:3000';
if (appSettings.karakeep) {
  appSettings.karakeep.webhookUrl = appSettings.karakeep.apiKey 
    ? \`\${baseAppUrl}/api/webhooks/karakeep?authKey=\${appSettings.karakeep.apiKey}\`
    : \`\${baseAppUrl}/api/webhooks/karakeep\`;
}

// Settings Initialization`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
