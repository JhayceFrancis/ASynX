import re

with open('server.ts', 'r') as f:
    content = f.read()

replacement = """export let appSettings: AppSettings = {
  ...defaultSettings,
  ...dbState.appSettings,
  theme: dbState.appSettings?.theme || defaultSettings.theme,
  simkl: dbState.appSettings?.simkl || defaultSettings.simkl,
  mal: dbState.appSettings?.mal || defaultSettings.mal,
  anilist: dbState.appSettings?.anilist || defaultSettings.anilist,
  plex: dbState.appSettings?.plex || defaultSettings.plex,
  jellyfin: dbState.appSettings?.jellyfin || defaultSettings.jellyfin,
  emby: dbState.appSettings?.emby || defaultSettings.emby,
  karakeep: dbState.appSettings?.karakeep || defaultSettings.karakeep,
  tautulli: dbState.appSettings?.tautulli || defaultSettings.tautulli,
  remoteSync: dbState.appSettings?.remoteSync || defaultSettings.remoteSync,
  daemonSettings: dbState.appSettings?.daemonSettings || defaultSettings.daemonSettings,
  automatedBackups: dbState.appSettings?.automatedBackups || defaultSettings.automatedBackups,
  syncRules: dbState.appSettings?.syncRules || defaultSettings.syncRules
};

// Force disconnected state if credentials are missing
if (!appSettings.simkl.accessToken || !appSettings.simkl.clientId) appSettings.simkl.connected = false;
if (!appSettings.mal.accessToken || !appSettings.mal.clientId) appSettings.mal.connected = false;
if (!appSettings.anilist.accessToken) appSettings.anilist.connected = false;
if (!appSettings.plex.serverUrl || !appSettings.plex.token) appSettings.plex.connected = false;
if (!appSettings.jellyfin.serverUrl || !appSettings.jellyfin.apiKey) appSettings.jellyfin.connected = false;
if (!appSettings.emby.serverUrl || !appSettings.emby.apiKey) appSettings.emby.connected = false;
"""

content = re.sub(r'export let appSettings: AppSettings = \{.*?\n\};', replacement, content, flags=re.DOTALL)

with open('server.ts', 'w') as f:
    f.write(content)
