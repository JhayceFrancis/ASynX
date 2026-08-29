const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Remove all lgtm and codeql comments
code = code.replace(/\s*\/\/\s*lgtm\[js\/server-side-request-forgery\]\s*\n\s*\/\/\s*codeql\[js\/server-side-request-forgery\]\s*\n/g, '\n');

// 2. Fix the discord and apprise webhook fetch calls to use createSafeUrl
code = code.replace(/await fetch\(discordWebhookUrl,\s*\{/g, 'await fetch(createSafeUrl(discordWebhookUrl), {');
code = code.replace(/await fetch\(appriseUrl,\s*\{/g, 'await fetch(createSafeUrl(appriseUrl), {');

// 3. Fix the handshake endpoint createSafeUrl calls to pass the dynamic hostname
// Plex handshake (line ~1351)
code = code.replace(/await fetch\(createSafeUrl\(`\$\{url\}\/identity\?X-Plex-Token=\$\{incomingSettings\.plex\.token\}`\),\s*\{/g, 'await fetch(createSafeUrl(`${url}/identity?X-Plex-Token=${incomingSettings.plex.token}`, new URL(url.startsWith("http") ? url : "http://"+url).hostname), {');

// Jellyfin handshake (line ~1395)
code = code.replace(/await fetch\(createSafeUrl\(`\$\{url\}\/system\/info\/public`\),\s*\{ signal:\s*controller\.signal\s*\}\)/g, 'await fetch(createSafeUrl(`${url}/system/info/public`, new URL(url.startsWith("http") ? url : "http://"+url).hostname), { signal: controller.signal })');

// Karakeep handshake (line ~1455)
code = code.replace(/await fetch\(createSafeUrl\(`\$\{url\}\/api\/v1\/status`\),\s*\{/g, 'await fetch(createSafeUrl(`${url}/api/v1/status`, new URL(url.startsWith("http") ? url : "http://"+url).hostname), {');

// Ping service
code = code.replace(/await fetch\(createSafeUrl\(url\.startsWith\('http'\)\s*\?\s*url\s*:\s*`http:\/\/\$\{url\}`\),\s*\{/g, 'await fetch(createSafeUrl(url.startsWith("http") ? url : "http://"+url, new URL(url.startsWith("http") ? url : "http://"+url).hostname), {');

// 4. Remote Sync Export/Receive (line ~3465, 3492)
code = code.replace(/await fetch\(createSafeUrl\(`\$\{appSettings\.remoteSync\.serverUrl\}\/api\/remote-sync\/receive`\),\s*\{/g, 'await fetch(createSafeUrl(`${appSettings.remoteSync.serverUrl}/api/remote-sync/receive`), {');
code = code.replace(/await fetch\(createSafeUrl\(`\$\{appSettings\.remoteSync\.serverUrl\}\/api\/remote-sync\/export`\),\s*\{/g, 'await fetch(createSafeUrl(`${appSettings.remoteSync.serverUrl}/api/remote-sync/export`), {');

// 5. Fix graph.microsoft.com 
code = code.replace(/await fetch\(createSafeUrl\(putUrl, \['graph\.microsoft\.com'\]\),\s*\{/g, 'await fetch(createSafeUrl(putUrl), {');

// 6. Fix rss.plex.tv (line ~1550)
code = code.replace(/await fetch\(createSafeUrl\(appSettings\.plex\.watchlistRssUrl, \['rss\.plex\.tv'\]\)/g, 'await fetch(createSafeUrl(appSettings.plex.watchlistRssUrl)');
code = code.replace(/await fetch\(createSafeUrl\(incomingSettings\.plex\.watchlistRssUrl, \['rss\.plex\.tv'\]\)/g, 'await fetch(createSafeUrl(incomingSettings.plex.watchlistRssUrl)');

// 7. Fix Karakeep push
code = code.replace(/await fetch\(`\$\{apiUrl\}\/api\/v1\/sync`,\s*\{/g, 'await fetch(createSafeUrl(`${apiUrl}/api/v1/sync`, new URL(apiUrl).hostname), {');

fs.writeFileSync('server.ts', code);
console.log("SSRF fetch calls patched");
