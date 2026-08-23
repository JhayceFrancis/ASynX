const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const startStr = `  jellyfin: {
    serverUrl: process.env.JELLYFIN_SERVER_URL || "http://192.168.1.101:8096",
    apiKey: process.env.JELLYFIN_API_KEY || "",
    connected: false,
    serverName: "HomeMediaServer-Jellyfin",
    webhookUrl: \`\${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/jellyfin\`,
    autoScrobbleThreshold: 80
  },`;

const endStr = `
    tautulli: {
      connected: appSettings.tautulli.connected,
      status: appSettings.tautulli.connected ? "operational" : "disconnected",
      latencyMs: Math.floor(Math.random() * 10) + 5,
    }
  };

  res.json({
    status: 'ok',`;

const searchPattern = new RegExp(
  startStr.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + endStr.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&')
);

// We'll replace it with the exact correct contents
const correctReplacement = `  jellyfin: {
    serverUrl: process.env.JELLYFIN_SERVER_URL || "http://192.168.1.101:8096",
    apiKey: process.env.JELLYFIN_API_KEY || "",
    connected: false,
    serverName: "HomeMediaServer-Jellyfin",
    webhookUrl: \`\${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/jellyfin\`,
    autoScrobbleThreshold: 80
  },
  emby: {
    serverUrl: process.env.EMBY_SERVER_URL || "http://192.168.1.102:8096",
    apiKey: process.env.EMBY_API_KEY || "",
    connected: false,
    serverName: "HomeMediaServer-Emby",
    webhookUrl: \`\${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/emby\`,
    autoScrobbleThreshold: 80
  },
  karakeep: {
    apiUrl: process.env.KARAKEEP_API_URL || "https://api.karakeep.com",
    apiKey: process.env.KARAKEEP_API_KEY || "",
    webhookUrl: \`\${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/karakeep\`,
    connected: false
  },
  tautulli: {
    webhookUrl: \`\${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/tautulli\`,
    secretKey: process.env.TAUTULLI_SECRET || "",
    connected: false
  },
  remoteSync: {
    enabled: false,
    serverUrl: "",
    apiKey: "",
    lastSync: "never"
  },
  daemonSettings: {
    runOnStartup: true,
    enableLocalMediaDetection: true,
    autoScrobbleLocal: false
  },
  maintenanceMode: false,
  automatedBackups: {
    enabled: false,
    provider: 'github_repo',
    frequency: 'daily',
    token: "",
    targetId: ""
  },
  keyboardShortcuts: {
    enabled: true
  },
  syncRules: {
    autoSyncIntervalMinutes: 15,
    syncScheduleMode: "interval",
    syncSpecificTime: "03:00",
    conflictPolicy: "ask_user",
    defaultSourceOfTruth: "simkl",
    autoResolveWithAI: false,
    syncDramasFromSimklToMAL: false
  }
};

let appSettings: AppSettings = {
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
  keyboardShortcuts: dbState.appSettings?.keyboardShortcuts || defaultSettings.keyboardShortcuts,
  syncRules: dbState.appSettings?.syncRules || defaultSettings.syncRules
};

let libraryItems: LibraryItem[] = dbState.libraryItems || [];
let syncLogs: SyncLog[] = dbState.syncLogs || [];
let webhookLogs: WebhookLog[] = dbState.webhookLogs || [];
let extensionState: BrowserExtensionState = dbState.extensionState || {
  isActive: false,
  version: "1.0.0",
  lastPing: new Date().toISOString(),
  currentUrl: "",
  detectedMedia: null,
  activeBrowser: "chrome"
};

function persistDb() {
  saveDb({
    appSettings,
    libraryItems,
    syncLogs,
    webhookLogs,
    extensionState
  });
}

const app = express();
app.use(cors());
app.use(express.json());

let healthStatusState: HealthCheckStatus = {
  plex: {
    name: "Plex Media Server Integration",
    endpoint: appSettings.plex.serverUrl || "http://192.168.1.100:32400",
    status: appSettings.plex.connected ? "online" : "offline",
    latencyMs: 15,
    lastChecked: new Date().toISOString(),
    details: appSettings.plex.connected ? "Plex Media Server 'HomeMediaServer-Plex' reachable. Webhook handler active." : "Connection timeout at target URL."
  },
  jellyfin: {
    name: "Jellyfin Media Server Integration",
    endpoint: appSettings.jellyfin.serverUrl || "http://192.168.1.101:8096",
    status: appSettings.jellyfin.connected ? "online" : "offline",
    latencyMs: 18,
    lastChecked: new Date().toISOString(),
    details: appSettings.jellyfin.connected ? \`Jellyfin Server '\${appSettings.jellyfin.serverName}' reachable. Webhook handler active.\` : "Connection timeout at target URL."
  },
  emby: {
    name: "Emby Media Server Integration",
    endpoint: appSettings.emby.serverUrl || "http://192.168.1.102:8096",
    status: appSettings.emby.connected ? "online" : "offline",
    latencyMs: 20,
    lastChecked: new Date().toISOString(),
    details: appSettings.emby.connected ? \`Emby Server '\${appSettings.emby.serverName}' reachable. Webhook handler active.\` : "Connection timeout at target URL."
  },
  karakeep: {
    name: "KaraKeep Integration",
    endpoint: appSettings.karakeep.apiUrl || "https://api.karakeep.com",
    status: appSettings.karakeep.connected ? "online" : "offline",
    latencyMs: 25,
    lastChecked: new Date().toISOString(),
    details: appSettings.karakeep.connected ? "KaraKeep API reachable. Webhooks enabled." : "Connection failed."
  },
  tautulli: {
    name: "Tautulli Analytics & Webhook Service",
    endpoint: appSettings.tautulli.webhookUrl || "http://192.168.1.100:8181",
    status: appSettings.tautulli.connected ? "online" : "offline",
    latencyMs: 34,
    lastChecked: new Date().toISOString(),
    details: appSettings.tautulli.connected ? "Tautulli notification listener verified. Secret key authenticated." : "Target Tautulli instance unreachable."
  },
  lastOverallPing: new Date().toISOString()
};

app.get("/api/daemon/health", (req, res) => {
  const integrations = {
    plex: {
      connected: appSettings.plex.connected,
      status: appSettings.plex.connected ? "operational" : "disconnected",
      latencyMs: Math.floor(Math.random() * 10) + 5,
    },
    jellyfin: {
      connected: appSettings.jellyfin.connected,
      status: appSettings.jellyfin.connected ? "operational" : "disconnected",
      latencyMs: Math.floor(Math.random() * 20) + 5,
    },
    emby: {
      connected: appSettings.emby.connected,
      status: appSettings.emby.connected ? "operational" : "disconnected",
      latencyMs: Math.floor(Math.random() * 20) + 5,
    },
    karakeep: {
      connected: appSettings.karakeep.connected,
      status: appSettings.karakeep.connected ? "operational" : "disconnected",
      latencyMs: Math.floor(Math.random() * 30) + 10,
    },
    tautulli: {
      connected: appSettings.tautulli.connected,
      status: appSettings.tautulli.connected ? "operational" : "disconnected",
      latencyMs: Math.floor(Math.random() * 10) + 5,
    }
  };

  res.json({
    status: 'ok',`;

if (code.match(searchPattern)) {
  code = code.replace(searchPattern, correctReplacement);
  fs.writeFileSync('server.ts', code);
  console.log("Restored successfully!");
} else {
  console.log("Search pattern not found!");
}
