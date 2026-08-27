import re

with open('server.ts', 'r') as f:
    content = f.read()

# We need to insert validation for Plex, Jellyfin, Emby right after AniList validation
plex_validation = """
  // Validate Plex Credentials
  if (incomingSettings?.plex?.serverUrl && incomingSettings?.plex?.token) {
     if (incomingSettings.plex.serverUrl !== oldSettings.plex?.serverUrl || 
         incomingSettings.plex.token !== oldSettings.plex?.token ||
         !oldSettings.plex?.connected) {
         try {
            SystemLogger.info('Handshake', 'Validating Plex Media Server connection...');
            let url = incomingSettings.plex.serverUrl;
            if (!url.startsWith('http')) url = `http://${url}`;
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000);
            const plexRes = await fetch(`${url}/identity?X-Plex-Token=${incomingSettings.plex.token}`, { signal: controller.signal });
            clearTimeout(id);
            if (!plexRes.ok) {
               SystemLogger.error('Handshake', 'Plex server rejected credentials.');
               return res.status(401).json({ success: false, error: "Invalid Plex server URL or token." });
            }
            incomingSettings.plex.connected = true;
            SystemLogger.success('Handshake', 'Plex server validated successfully.');
         } catch (e) {
            SystemLogger.error('Handshake', 'Plex server unreachable.');
            return res.status(500).json({ success: false, error: "Failed to connect to Plex server." });
         }
     }
  } else if (incomingSettings?.plex?.connected) {
     incomingSettings.plex.connected = false;
  }

  // Validate Jellyfin Credentials
  if (incomingSettings?.jellyfin?.serverUrl && incomingSettings?.jellyfin?.apiKey) {
     if (incomingSettings.jellyfin.serverUrl !== oldSettings.jellyfin?.serverUrl || 
         incomingSettings.jellyfin.apiKey !== oldSettings.jellyfin?.apiKey ||
         !oldSettings.jellyfin?.connected) {
         try {
            SystemLogger.info('Handshake', 'Validating Jellyfin Media Server connection...');
            let url = incomingSettings.jellyfin.serverUrl;
            if (!url.startsWith('http')) url = `http://${url}`;
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000);
            const jfRes = await fetch(`${url}/system/info/public`, { signal: controller.signal });
            clearTimeout(id);
            if (!jfRes.ok) {
               SystemLogger.error('Handshake', 'Jellyfin server rejected connection.');
               return res.status(401).json({ success: false, error: "Invalid Jellyfin server URL or API Key." });
            }
            incomingSettings.jellyfin.connected = true;
            SystemLogger.success('Handshake', 'Jellyfin server validated successfully.');
         } catch (e) {
            SystemLogger.error('Handshake', 'Jellyfin server unreachable.');
            return res.status(500).json({ success: false, error: "Failed to connect to Jellyfin server." });
         }
     }
  } else if (incomingSettings?.jellyfin?.connected) {
     incomingSettings.jellyfin.connected = false;
  }

  // Validate Emby Credentials
  if (incomingSettings?.emby?.serverUrl && incomingSettings?.emby?.apiKey) {
     if (incomingSettings.emby.serverUrl !== oldSettings.emby?.serverUrl || 
         incomingSettings.emby.apiKey !== oldSettings.emby?.apiKey ||
         !oldSettings.emby?.connected) {
         try {
            SystemLogger.info('Handshake', 'Validating Emby Media Server connection...');
            let url = incomingSettings.emby.serverUrl;
            if (!url.startsWith('http')) url = `http://${url}`;
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000);
            const embyRes = await fetch(`${url}/system/info/public`, { signal: controller.signal });
            clearTimeout(id);
            if (!embyRes.ok) {
               SystemLogger.error('Handshake', 'Emby server rejected connection.');
               return res.status(401).json({ success: false, error: "Invalid Emby server URL or API Key." });
            }
            incomingSettings.emby.connected = true;
            SystemLogger.success('Handshake', 'Emby server validated successfully.');
         } catch (e) {
            SystemLogger.error('Handshake', 'Emby server unreachable.');
            return res.status(500).json({ success: false, error: "Failed to connect to Emby server." });
         }
     }
  } else if (incomingSettings?.emby?.connected) {
     incomingSettings.emby.connected = false;
  }
"""

content = content.replace("  // Prototype Pollution Prevention", plex_validation + "\n  // Prototype Pollution Prevention")

with open('server.ts', 'w') as f:
    f.write(content)
