const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

function injectOutboundTrigger(webhookName, searchPattern, varName) {
  const injection = `
    // Fire outbound sync if item was found
    if (matchedItem && ${varName} > 0) {
      triggerOutboundSync(matchedItem, ${varName}).then(({ successCount, platformsSynced }) => {
        if (successCount > 0) {
          syncLogs.unshift({
            id: \`slog-\${Date.now()}-\${Math.random().toString(36).substring(7)}\`,
            timestamp: new Date().toISOString(),
            source: "${webhookName}",
            itemTitle: matchedItem.title,
            action: "Outbound Multi-Sync (Webhook)",
            platformsAffected: platformsSynced as PlatformType[],
            status: "success",
            details: \`Synchronised episode \${${varName}} to \${platformsSynced.join(', ')}.\`
          });
          persistDb();
        }
      });
    }
  `;
  
  if (code.includes(searchPattern) && !code.includes('source: "' + webhookName + '"') && !code.includes('action: "Outbound Multi-Sync (Webhook)"')) {
    code = code.replace(searchPattern, searchPattern + injection);
  }
}

injectOutboundTrigger("emby", 'webhookLogs.unshift(webhookLog);', "episode");
injectOutboundTrigger("jellyfin", 'webhookLogs.unshift(webhookLog);', "episode");
injectOutboundTrigger("tautulli", 'webhookLogs.unshift(webhookLog);', "episode");

const plexSearch = 'if (platformsAffected.length > 0) {\\n      persistDb();\\n    }';
const plexSearchAlt = '    if (platformsAffected.length > 0) {\\n      persistDb();\\n    }';

const plexInject = `
    // Fire outbound sync
    if (matchedItem && episode > 0) {
      triggerOutboundSync(matchedItem, episode).then(({ successCount, platformsSynced }) => {
         if (successCount > 0) {
             syncLogs.unshift({
                id: \`slog-\${Date.now()}-\${Math.random().toString(36).substring(7)}\`,
                timestamp: new Date().toISOString(),
                source: "plex",
                itemTitle: matchedItem.title,
                action: "Outbound Multi-Sync (Webhook)",
                platformsAffected: platformsSynced as PlatformType[],
                status: "success",
                details: \`Synchronised episode \${episode} to \${platformsSynced.join(', ')}.\`
              });
              persistDb();
         }
      });
    }
`;

if (code.includes('app.post("/api/webhooks/plex"')) {
   // let's do a simple replace on the end of the plex route
   let plexPart = code.split('app.post("/api/webhooks/plex"')[1];
   let target = 'persistDb();\\n    }';
   if (plexPart.includes(target) && !plexPart.includes('Outbound Multi-Sync (Webhook)')) {
       let replaced = plexPart.replace(target, target + plexInject);
       code = code.split('app.post("/api/webhooks/plex"')[0] + 'app.post("/api/webhooks/plex"' + replaced;
   }
}

// Karakeep
if (code.includes('app.post("/api/webhooks/karakeep"')) {
   let part = code.split('app.post("/api/webhooks/karakeep"')[1];
   let target = 'persistDb();\\n  res.json({ success: true';
   const kkInject = `
  if (matchedItem && episode > 0) {
    triggerOutboundSync(matchedItem, episode).then(({ successCount, platformsSynced }) => {
      if (successCount > 0) {
          syncLogs.unshift({
            id: \`slog-\${Date.now()}-\${Math.random().toString(36).substring(7)}\`,
            timestamp: new Date().toISOString(),
            source: "karakeep",
            itemTitle: matchedItem.title,
            action: "Outbound Multi-Sync (Webhook)",
            platformsAffected: platformsSynced as PlatformType[],
            status: "success",
            details: \`Synchronised episode \${episode} to \${platformsSynced.join(', ')}.\`
          });
          persistDb();
      }
    });
  }
`;
   if (part.includes(target) && !part.includes('Outbound Multi-Sync (Webhook)')) {
       let replaced = part.replace(target, kkInject + target);
       code = code.split('app.post("/api/webhooks/karakeep"')[0] + 'app.post("/api/webhooks/karakeep"' + replaced;
   }
}

fs.writeFileSync('server.ts', code);
console.log("Webhooks updated");
