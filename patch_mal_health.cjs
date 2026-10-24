const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const searchHealth = "await checkService('https://api.myanimelist.net/v2/users/@me', { headers: { 'Authorization': `Bearer ${appSettings.mal.accessToken}` }})";
const replaceHealth = "await checkService(createSafeUrl('https://api.myanimelist.net/v2/users/@me', 'api.myanimelist.net'), { headers: { 'Authorization': `Bearer ${appSettings.mal.accessToken}` }})";

code = code.replace(searchHealth, replaceHealth);
fs.writeFileSync('server.ts', code);
console.log(code.includes(replaceHealth) ? "Patched healthcheck!" : "Failed to patch healthcheck");
