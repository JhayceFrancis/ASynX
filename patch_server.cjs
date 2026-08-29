const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldPlexSettings = `    serverName: "HomeMediaServer-Plex",
    webhookUrl: \`\${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/plex\`,
    autoScrobbleThreshold: 80
  },`;

const newPlexSettings = `    serverName: "HomeMediaServer-Plex",
    webhookUrl: \`\${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/plex\`,
    autoScrobbleThreshold: 80,
    watchlistRssUrl: process.env.PLEX_RSS_URL || ""
  },`;
code = code.replace(oldPlexSettings, newPlexSettings);

const oldValidation = `  // Validate Plex Credentials
  if (incomingSettings?.plex?.serverUrl && incomingSettings?.plex?.token) {
     if (incomingSettings.plex.serverUrl !== oldSettings.plex?.serverUrl || 
         incomingSettings.plex.token !== oldSettings.plex?.token ||
         !oldSettings.plex?.connected) {`;

const newValidation = `  // Validate Plex Credentials
  if (incomingSettings?.plex?.serverUrl && incomingSettings?.plex?.token) {
     if (incomingSettings.plex.serverUrl !== oldSettings.plex?.serverUrl || 
         incomingSettings.plex.token !== oldSettings.plex?.token ||
         !oldSettings.plex?.connected) {`;

// Actually let's add validation for watchlistRssUrl if they provided it.
const validationPlexAuth = `            const plexRes = await fetch(createSafeUrl(\`\${url}/identity?X-Plex-Token=\${incomingSettings.plex.token}\`), { signal: controller.signal });
            clearTimeout(id);
            if (!plexRes.ok) {
               SystemLogger.error('Handshake', 'Plex server rejected credentials.');
               return res.status(401).json({ success: false, error: "Invalid Plex server URL or token." });
            }
            incomingSettings.plex.connected = true;
            SystemLogger.success('Handshake', 'Plex server validated successfully.');`;

const validationPlexWithRSS = `            const plexRes = await fetch(createSafeUrl(\`\${url}/identity?X-Plex-Token=\${incomingSettings.plex.token}\`), { signal: controller.signal });
            clearTimeout(id);
            if (!plexRes.ok) {
               SystemLogger.error('Handshake', 'Plex server rejected credentials.');
               return res.status(401).json({ success: false, error: "Invalid Plex server URL or token." });
            }

            if (incomingSettings.plex.watchlistRssUrl && incomingSettings.plex.watchlistRssUrl !== oldSettings.plex?.watchlistRssUrl) {
               SystemLogger.info('Handshake', 'Validating Plex Watchlist RSS URL...');
               const rssController = new AbortController();
               const rssId = setTimeout(() => rssController.abort(), 3000);
               const rssRes = await fetch(createSafeUrl(incomingSettings.plex.watchlistRssUrl, ['rss.plex.tv']), { signal: rssController.signal }).catch(() => ({ok: false}));
               clearTimeout(rssId);
               if (!rssRes.ok) {
                  SystemLogger.error('Handshake', 'Plex RSS Watchlist validation failed.');
                  return res.status(401).json({ success: false, error: "Invalid Plex Watchlist RSS URL." });
               }
               SystemLogger.success('Handshake', 'Plex Watchlist RSS validated successfully.');
            }

            incomingSettings.plex.connected = true;
            SystemLogger.success('Handshake', 'Plex server validated successfully.');`;

code = code.replace(validationPlexAuth, validationPlexWithRSS);

fs.writeFileSync('server.ts', code);
console.log('Patched Plex Settings Validation');
