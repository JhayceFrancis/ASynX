import re

with open('server.ts', 'r') as f:
    content = f.read()

# Fix 1: Plex
content = content.replace("await fetch(`${url}/identity?X-Plex-Token=${incomingSettings.plex.token}`", 
                          "await fetch(createSafeUrl(`${url}/identity?X-Plex-Token=${incomingSettings.plex.token}`)")

# Fix 2: Jellyfin
content = content.replace("await fetch(`${url}/system/info/public`", 
                          "await fetch(createSafeUrl(`${url}/system/info/public`)")

# Fix 3: Emby
# Note: Emby uses same string as Jellyfin, so the above replace might do both.

# Fix 4: Karakeep
content = content.replace("await fetch(`${url}/api/v1/status`", 
                          "await fetch(createSafeUrl(`${url}/api/v1/status`)")

# Fix 5: Health Check
content = content.replace("await fetch(url.startsWith('http') ? url : `http://${url}`", 
                          "await fetch(createSafeUrl(url.startsWith('http') ? url : `http://${url}`)")

# Fix 6: Remote Sync Receive
content = content.replace("await fetch(`${appSettings.remoteSync.serverUrl}/api/remote-sync/receive`", 
                          "await fetch(createSafeUrl(`${appSettings.remoteSync.serverUrl}/api/remote-sync/receive`)")

# Fix 7: Remote Sync Export
content = content.replace("await fetch(`${appSettings.remoteSync.serverUrl}/api/remote-sync/export`", 
                          "await fetch(createSafeUrl(`${appSettings.remoteSync.serverUrl}/api/remote-sync/export`)")

# Fix 8: Test Webhook (line 639 ish, check for pingUrl)
content = content.replace("await fetch(pingUrl, { ...fetchOpts", 
                          "await fetch(createSafeUrl(pingUrl), { ...fetchOpts")

with open('server.ts', 'w') as f:
    f.write(content)
