const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `
if (!appSettings.remoteSync.apiKey) {
  appSettings.remoteSync.apiKey = crypto.randomBytes(32).toString('hex');
  const hostUrl = process.env.APP_URL || "http://<YOUR_DOCKER_IP>:3000";
  console.log('\\n===============================================================');
  console.log(' 🚀 ASynX Remote Sync Backend Initialized');
  console.log('===============================================================');
  console.log(' [!] A new API Key has been auto-generated for Remote Sync.');
  console.log('');
  console.log(\` 🔗 Server URL: \${hostUrl}\`);
  console.log(\` 🔑 API Key:    \${appSettings.remoteSync.apiKey}\`);
  console.log('');
  console.log(' Use this Server URL and API Key in your Windows or Browser');
  console.log(' Client settings to pair them with this Docker backend.');
  console.log('===============================================================\\n');
}

let libraryItems: LibraryItem[] = dbState.libraryItems || [];
`;

const insert = `
if (!appSettings.remoteSync.apiKey) {
  appSettings.remoteSync.apiKey = crypto.randomBytes(32).toString('hex');
  const hostUrl = process.env.APP_URL || "http://<YOUR_DOCKER_IP>:3000";
  console.log('\\n===============================================================');
  console.log(' 🚀 ASynX Remote Sync Backend Initialized');
  console.log('===============================================================');
  console.log(' [!] A new API Key has been auto-generated for Remote Sync.');
  console.log('');
  console.log(\` 🔗 Server URL: \${hostUrl}\`);
  console.log(\` 🔑 API Key:    \${appSettings.remoteSync.apiKey}\`);
  console.log('');
  console.log(' Use this Server URL and API Key in your Windows or Browser');
  console.log(' Client settings to pair them with this Docker backend.');
  console.log('===============================================================\\n');
  
  // Persist it so it doesn't rotate on every boot
  // We'll call persistDb after it's defined, or we can just inline saveDb if needed, 
  // actually wait, persistDb is defined further down. 
}
let libraryItems: LibraryItem[] = dbState.libraryItems || [];
`;

content = content.replace(target, insert);
fs.writeFileSync('server.ts', content);
