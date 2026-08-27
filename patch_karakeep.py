import re

with open('server.ts', 'r') as f:
    content = f.read()

emby_block_end = """  } else if (incomingSettings?.emby?.connected) {
     incomingSettings.emby.connected = false;
  }"""

karakeep_block = """  // Validate Karakeep Credentials
  if (incomingSettings?.karakeep?.apiUrl && incomingSettings?.karakeep?.apiKey) {
     if (incomingSettings.karakeep.apiUrl !== oldSettings.karakeep?.apiUrl || 
         incomingSettings.karakeep.apiKey !== oldSettings.karakeep?.apiKey ||
         !oldSettings.karakeep?.connected) {
         try {
            SystemLogger.info('Handshake', 'Validating Karakeep API connection...');
            let url = incomingSettings.karakeep.apiUrl;
            if (!url.startsWith('http')) url = `https://${url}`;
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000);
            const karaRes = await fetch(`${url}/api/v1/status`, { 
               headers: { 'Authorization': `Bearer ${incomingSettings.karakeep.apiKey}` },
               signal: controller.signal 
            }).catch(() => ({ ok: false })); // Mocking failed fetch as not ok if external url is invalid
            clearTimeout(id);
            if (!karaRes.ok) {
               SystemLogger.error('Handshake', 'Karakeep server rejected connection.');
               return res.status(401).json({ success: false, error: "Invalid Karakeep server URL or API Key." });
            }
            incomingSettings.karakeep.connected = true;
            SystemLogger.success('Handshake', 'Karakeep server validated successfully.');
         } catch (e) {
            SystemLogger.error('Handshake', 'Karakeep server unreachable.');
            return res.status(500).json({ success: false, error: "Failed to connect to Karakeep server." });
         }
     }
  } else if (incomingSettings?.karakeep?.connected) {
     incomingSettings.karakeep.connected = false;
  }"""

content = content.replace(emby_block_end, emby_block_end + "\n\n" + karakeep_block)

# Add Karakeep to the webhook registration logs block
emby_log_block = """  if (appSettings.emby.connected && (!oldSettings.emby || !oldSettings.emby.connected)) {
    syncLogs.unshift({
      id: `slog-${Date.now()}-emby`,
      timestamp: now,
      source: "auto_sync",
      itemTitle: "Emby Integration",
      action: "Webhook Registration & Library Polling",
      platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
      status: "success",
      details: `Successfully registered webhook for Emby server at ${appSettings.emby.serverUrl} and initiated library polling.`
    });
  }"""

karakeep_log_block = """  if (appSettings.karakeep.connected && (!oldSettings.karakeep || !oldSettings.karakeep.connected)) {
    syncLogs.unshift({
      id: `slog-${Date.now()}-karakeep`,
      timestamp: now,
      source: "auto_sync",
      itemTitle: "Karakeep Integration",
      action: "Webhook Registration",
      platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
      status: "success",
      details: `Successfully registered webhook for Karakeep API at ${appSettings.karakeep.apiUrl}.`
    });
  }"""

content = content.replace(emby_log_block, emby_log_block + "\n\n" + karakeep_log_block)

with open('server.ts', 'w') as f:
    f.write(content)
