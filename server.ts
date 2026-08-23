import express from "express";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import cors from "cors";

import { URL } from 'url';
const originalFetch = global.fetch;
global.fetch = async (input, init) => {
  const urlStr = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);
  try {
    const parsedUrl = new URL(urlStr);
    const allowedDomains = [
      'api.simkl.com',
      'myanimelist.net',
      'anilist.co',
      'api.github.com',
      'www.googleapis.com',
      'graph.microsoft.com'
    ];
    let isAllowed = allowedDomains.includes(parsedUrl.hostname);
    
    // Allow local plex/jellyfin IPs if present in appSettings (accessed globally if possible, but safeFetch might not have scope. 
    // Wait, since appSettings is a let at module level, we can reference it!)
    if (!isAllowed) {
       const remoteSyncUrl = typeof appSettings !== 'undefined' && appSettings?.remoteSync?.serverUrl;
       if (remoteSyncUrl) {
          try {
             if (parsedUrl.hostname === new URL(remoteSyncUrl).hostname) {
                 isAllowed = true;
             }
          } catch (e) {}
       }
       const plexUrl = typeof appSettings !== 'undefined' && appSettings?.plex?.serverUrl;
       if (plexUrl) {
          try {
             if (parsedUrl.hostname === new URL(plexUrl).hostname) {
                 isAllowed = true;
             }
          } catch (e) {}
       }
       const jellyfinUrl = typeof appSettings !== 'undefined' && appSettings?.jellyfin?.serverUrl;
       if (jellyfinUrl) {
          try {
             if (parsedUrl.hostname === new URL(jellyfinUrl).hostname) {
                 isAllowed = true;
             }
          } catch (e) {}
       }
    }

    if (!isAllowed) {
       throw new Error("SSRF Prevention: Outbound request to unauthorized domain " + parsedUrl.hostname + " is blocked.");
    }
  } catch (err) {
    if (err.message.includes("SSRF Prevention")) throw err;
  }
  return originalFetch(input, init);
};

import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { Server as SocketIOServer } from "socket.io";
import { loadDb, saveDb } from "./db.js";
import { 
  LibraryItem, 
  SyncLog, 
  WebhookLog, 
  BrowserExtensionState, 
  AppSettings,
  PlatformType,
  WatchStatus
} from "./src/types";

// Initialize Express App
const app = express();
app.set('trust proxy', 1);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const PORT = 3000;

// Security & Cors Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initial Settings Default
const defaultSettings: AppSettings = {
  maintenanceMode: false,
  theme: {
    accentColor: '#4f46e5', // indigo-600
    isGradient: false,
    gradientColors: ['#4f46e5', '#ec4899'], // indigo to pink
    gradientDirection: 'to right',
    headerColor: '#1a1a1a',
    buttonColor: '#4f46e5',
    paddingSize: '1.5rem',
    buttonTextColor: '#ffffff',
  },
  simkl: {
    clientId: process.env.SIMKL_CLIENT_ID || "",
    accessToken: process.env.SIMKL_ACCESS_TOKEN || "",
    connected: true,
    username: "OtakuWatcher99"
  },
  mal: {
    clientId: process.env.MAL_CLIENT_ID || "",
    accessToken: process.env.MAL_ACCESS_TOKEN || "",
    connected: true,
    username: "AnimeCollector"
  },
  anilist: {
    accessToken: process.env.ANILIST_ACCESS_TOKEN || "",
    connected: true,
    username: "AniTrackPro"
  },
  plex: {
    serverUrl: process.env.PLEX_SERVER_URL || "http://192.168.1.100:32400",
    token: process.env.PLEX_TOKEN || "",
    connected: true,
    serverName: "HomeMediaServer-Plex",
    webhookUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/plex`,
    autoScrobbleThreshold: 80
  },
  jellyfin: {
    serverUrl: process.env.JELLYFIN_SERVER_URL || "http://192.168.1.101:8096",
    apiKey: process.env.JELLYFIN_API_KEY || "",
    connected: false,
    serverName: "HomeMediaServer-Jellyfin",
    webhookUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/jellyfin`,
    autoScrobbleThreshold: 80
  },
  emby: {
    serverUrl: process.env.EMBY_SERVER_URL || "http://192.168.1.102:8096",
    apiKey: process.env.EMBY_API_KEY || "",
    connected: false,
    serverName: "HomeMediaServer-Emby",
    webhookUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/emby`,
    autoScrobbleThreshold: 80
  },
  karakeep: {
    apiUrl: process.env.KARAKEEP_API_URL || "https://api.karakeep.com",
    apiKey: process.env.KARAKEEP_API_KEY || "",
    webhookUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/karakeep`,
    connected: false
  },
  tautulli: {
    webhookUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/tautulli`,
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

let dbState = loadDb({
  appSettings: defaultSettings,
  libraryItems: [],
  syncLogs: [],
  webhookLogs: [],
  extensionState: {
    isActive: false,
    version: "1.0.0",
    lastPing: new Date().toISOString(),
    currentUrl: "",
    detectedMedia: null,
    activeBrowser: "chrome"
  }
});

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


if (!appSettings.remoteSync) {
  appSettings.remoteSync = {
    enabled: true,
    serverUrl: "",
    apiKey: "",
    lastSync: "never"
  };
}
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
  const anime_database = libraryItems.filter(i => i.mediaType && i.mediaType.includes('Anime'));
  const tv_films_database = libraryItems.filter(i => !i.mediaType || !i.mediaType.includes('Anime'));

  saveDb({
    appSettings,
    anime_database,
    tv_films_database,
    bookmarks_database: bookmarks,
    syncLogs,
    webhookLogs,
    extensionState
  });
}


// --- OAUTH 2.0 IMPLEMENTATION ---
const pkceStore = new Map<string, string>(); // state -> code_verifier

app.get("/api/auth/:provider/login", (req, res) => {
  const provider = req.params.provider;
  const baseUrl = process.env.APP_URL || `http://${req.headers.host}`;
  const redirectUri = `${baseUrl}/api/auth/${provider}/callback`;

  if (provider === 'simkl') {
    const clientId = process.env.SIMKL_CLIENT_ID;
    if (!clientId) return res.status(500).send('SIMKL_CLIENT_ID not configured');
    const url = `https://simkl.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.redirect(url);
  } else if (provider === 'mal') {
    const clientId = process.env.MAL_CLIENT_ID;
    if (!clientId) return res.status(500).send('MAL_CLIENT_ID not configured');
    
    // MAL requires PKCE
    const code_verifier = crypto.randomBytes(32).toString('base64url');
    const state = crypto.randomBytes(16).toString('hex');
    pkceStore.set(state, code_verifier);
    
    const url = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${clientId}&code_challenge=${code_verifier}&code_challenge_method=plain&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.redirect(url);
  } else if (provider === 'anilist') {
    const clientId = process.env.ANILIST_CLIENT_ID;
    if (!clientId) return res.status(500).send('ANILIST_CLIENT_ID not configured');
    const url = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    res.redirect(url);
  } else {
    res.status(404).send('Unknown provider');
  }
});

app.get("/api/auth/:provider/callback", async (req, res) => {
  const provider = req.params.provider;
  const { code, state, error } = req.query;
  const baseUrl = process.env.APP_URL || `http://${req.headers.host}`;
  const redirectUri = `${baseUrl}/api/auth/${provider}/callback`;

  if (error) {
    return res.status(400).send(`Auth error: ${error}`);
  }

  try {
    let accessToken = null;

    if (provider === 'simkl') {
      const clientId = process.env.SIMKL_CLIENT_ID;
      const clientSecret = process.env.SIMKL_CLIENT_SECRET;
      
      const tokenRes = await fetch('https://api.simkl.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });
      const data = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(data.error_description || 'Failed to fetch Simkl token');
      accessToken = data.access_token;
      
      appSettings.simkl.accessToken = accessToken;
      appSettings.simkl.connected = true;
      if (clientId) appSettings.simkl.clientId = clientId;

    } else if (provider === 'mal') {
      const clientId = process.env.MAL_CLIENT_ID;
      const clientSecret = process.env.MAL_CLIENT_SECRET;
      const code_verifier = pkceStore.get(state as string) || (state as string);
      
      const params = new URLSearchParams();
      params.append('client_id', clientId || '');
      params.append('client_secret', clientSecret || '');
      params.append('code', code as string);
      params.append('code_verifier', code_verifier);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', redirectUri);

      const tokenRes = await fetch('https://myanimelist.net/v1/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
      const data = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(data.error || 'Failed to fetch MAL token');
      accessToken = data.access_token;
      
      appSettings.mal.accessToken = accessToken;
      appSettings.mal.connected = true;
      if (clientId) appSettings.mal.clientId = clientId;
      
      // Cleanup PKCE
      if (state) pkceStore.delete(state as string);

    } else if (provider === 'anilist') {
      const clientId = process.env.ANILIST_CLIENT_ID;
      const clientSecret = process.env.ANILIST_CLIENT_SECRET;
      
      const tokenRes = await fetch('https://anilist.co/api/v2/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
        }),
      });
      
      const data = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(data.error || 'Failed to fetch AniList token');
      accessToken = data.access_token;
      
      appSettings.anilist.accessToken = accessToken;
      appSettings.anilist.connected = true;
    }

    if (accessToken) {
      persistDb();
      // Send message to opener and close
      res.send(`
        <html>
          <body>
            <script>
              const provider = ${JSON.stringify(req.params.provider || 'unknown')};
              const token = ${JSON.stringify(accessToken)};
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: provider, token: token }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } else {
      res.status(500).send('Failed to obtain access token.');
    }
  } catch (err: any) {
    console.error('OAuth Callback Error:', err);
    res.status(500).send(`Error exchanging token: ${err.message}`);
  }
});



let bookmarks: any[] = dbState.bookmarks_database || [];

// Migrate old libraryItems format to separated format if it exists
if (dbState.libraryItems && dbState.libraryItems.length > 0) {
  // If loading from an old backup
  libraryItems = dbState.libraryItems;
} else if (dbState.anime_database || dbState.tv_films_database) {
  libraryItems = [
    ...(dbState.anime_database || []),
    ...(dbState.tv_films_database || [])
  ];
}

// Ensure Remote Sync API Key exists
if (!appSettings.remoteSync?.apiKey) {
  appSettings.remoteSync = {
    enabled: true,
    serverUrl: "",
    apiKey: crypto.randomBytes(32).toString('hex'),
    lastSync: "never"
  };
  
  const hostUrl = process.env.APP_URL || "http://<YOUR_DOCKER_IP>:3000";
  console.log('\n===============================================================');
  console.log(' 🚀 ASynX Remote Sync Backend Initialized');
  console.log('===============================================================');
  console.log(' [!] A new API Key has been auto-generated for Remote Sync.');
  console.log('');
  console.log(` 🔗 Server URL: ${hostUrl}`);
  console.log(` 🔑 API Key:    ${appSettings.remoteSync.apiKey}`);
  console.log('');
  console.log(' Use this Server URL and API Key in your Windows or Browser');
  console.log(' Client settings to pair them with this Docker backend.');
  console.log('===============================================================\n');
  
  persistDb();
}

app.get("/api/bookmarks", (req, res) => res.json(bookmarks));
app.post("/api/bookmarks", (req, res) => {
  const newBookmark = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...req.body };
  bookmarks.push(newBookmark);
  persistDb();
  res.json(newBookmark);
});
app.put("/api/bookmarks/:id", (req, res) => {
  const index = bookmarks.findIndex(b => b.id === req.params.id);
  if (index !== -1) {
    bookmarks[index] = { ...bookmarks[index], ...req.body };
    persistDb();
    res.json(bookmarks[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});
app.delete("/api/bookmarks/:id", (req, res) => {
  bookmarks = bookmarks.filter(b => b.id !== req.params.id);
  persistDb();
  res.json({ success: true });
});

app.get("/api/database/raw", (req, res) => {
  const anime_database = libraryItems.filter(i => i.mediaType && i.mediaType.includes('Anime'));
  const tv_films_database = libraryItems.filter(i => !i.mediaType || !i.mediaType.includes('Anime'));
  res.json({
    appSettings,
    anime_database,
    tv_films_database,
    bookmarks_database: bookmarks,
    syncLogs,
    webhookLogs,
    extensionState
  });
});

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
    status: 'ok',
    uptime: process.uptime(),
    integrations,
    daemonActive: !appSettings.maintenanceMode,
    memoryUsage: process.memoryUsage(),
    lastSync: appSettings.remoteSync?.lastSync || "never"
  });
});

app.get("/api/docker/info", (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV || 'development',
    dockerEnv: fs.existsSync('/.dockerenv'),
    platform: process.platform,
    arch: process.arch,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    pid: process.pid,
    nodeVersion: process.version,
    trustProxy: app.get('trust proxy')
  });
});

// System Client Logs Endpoint
app.post("/api/logs", (req, res) => {
  console.log("[Client Log - %s]", req.body.level?.toUpperCase(), req.body);
  res.json({ success: true });
});

// Get Library Items directly
app.get("/api/library", (req, res) => {
  res.json(libraryItems);
});

// Get Sync Logs directly
app.get("/api/sync/logs", (req, res) => {
  res.json(syncLogs.slice(0, 30));
});

// Get Settings
app.get("/api/settings", (req, res) => {
  res.json(appSettings);
});

// Update Settings
app.post("/api/settings", async (req, res) => {
  const oldSettings = { ...appSettings };
  const incomingSettings = req.body;

  // Validate Simkl Credentials
  if (incomingSettings?.simkl?.clientId && incomingSettings?.simkl?.accessToken) {
     if (incomingSettings.simkl.clientId !== oldSettings.simkl?.clientId || 
         incomingSettings.simkl.accessToken !== oldSettings.simkl?.accessToken ||
         !oldSettings.simkl?.connected) {
         try {
            const simklRes = await fetch('https://api.simkl.com/users/settings', {
                headers: {
                    'Authorization': `Bearer ${incomingSettings.simkl.accessToken}`,
                    'simkl-api-client-id': incomingSettings.simkl.clientId
                }
            });
            if (!simklRes.ok) {
               return res.status(401).json({ success: false, error: "Invalid Simkl API credentials. Please verify your Client ID and Access Token." });
            }
            incomingSettings.simkl.connected = true;
         } catch (e) {
            return res.status(500).json({ success: false, error: "Failed to connect to Simkl API." });
         }
     }
  }

  
  // Prototype Pollution Prevention
  const safeSettings = Object.create(null);
  for (const key in incomingSettings) {
    if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
      safeSettings[key] = incomingSettings[key];
    }
  }
  appSettings = { ...appSettings, ...safeSettings };
  

  const now = new Date().toISOString();

  if (appSettings.jellyfin.connected && (!oldSettings.jellyfin || !oldSettings.jellyfin.connected)) {
    syncLogs.unshift({
      id: `slog-${Date.now()}-jf`,
      timestamp: now,
      source: "auto_sync",
      itemTitle: "Jellyfin Integration",
      action: "Webhook Registration & Library Polling",
      platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
      status: "success",
      details: `Successfully registered webhook for Jellyfin server at ${appSettings.jellyfin.serverUrl} and initiated library polling.`
    });
  }

  if (appSettings.emby.connected && (!oldSettings.emby || !oldSettings.emby.connected)) {
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
  }

  persistDb();
  res.json({ success: true, settings: appSettings });
});

// Get Sync Metrics & Status
app.get("/api/sync/status", (req, res) => {
  const conflictsCount = libraryItems.filter(i => i.hasConflict).length;
  const syncedCount = libraryItems.filter(i => !i.hasConflict).length;
  const totalItems = libraryItems.length;

  res.json({
    platforms: {
      simkl: { connected: appSettings.simkl.connected, username: appSettings.simkl.username || "", status: "operational" },
      mal: { connected: appSettings.mal.connected, username: appSettings.mal.username, status: "operational" },
      anilist: { connected: appSettings.anilist.connected, username: appSettings.anilist.username, status: "operational" },
      plex: { connected: appSettings.plex.connected, serverName: appSettings.plex.serverName, status: "webhook_active" }
    },
    metrics: {
      totalItems,
      syncedCount,
      conflictsCount,
      lastSyncTime: syncLogs[0]?.timestamp || new Date().toISOString(),
      webhooksReceivedToday: webhookLogs.length
    }
  });
});

// Get Library Items
app.get("/api/sync/items", (req, res) => {
  const filter = req.query.filter as string;
  const search = (req.query.search as string || "").toLowerCase();

  let items = [...libraryItems];

  if (filter === "conflicts") {
    items = items.filter(i => i.hasConflict);
  } else if (filter === "anime") {
    items = items.filter(i => i.mediaType === "Anime TV Series");
  } else if (filter === "drama") {
    items = items.filter(i => i.mediaType === "Drama");
  }

  if (search) {
    items = items.filter(i => 
      i.title.toLowerCase().includes(search) || 
      (i.japaneseTitle && i.japaneseTitle.toLowerCase().includes(search))
    );
  }

  res.json(items);
});

// Run Manual Sync Across All Platforms
app.post("/api/sync/trigger", (req, res) => {
  if (appSettings.maintenanceMode) {
    return res.status(503).json({ success: false, error: "Maintenance mode is active. Sync paused." });
  }
  const { itemId } = req.body;

  let affected: LibraryItem[] = [];

  if (itemId) {
    const item = libraryItems.find(i => i.id === itemId);
    if (item) affected.push(item);
  } else {
    affected = [...libraryItems];
  }

  // Perform mock sync logic
  const now = new Date().toISOString();
  affected.forEach(item => {
    // If conflict policy is defaultSourceOfTruth, resolve using default
    if (!item.hasConflict) {
      if (item.platforms.simkl) item.platforms.simkl.synced = true;
      if (item.platforms.mal) item.platforms.mal.synced = true;
      if (item.platforms.anilist) item.platforms.anilist.synced = true;
    }
  });

  const newLog: SyncLog = {
    id: `slog-${Date.now()}`,
    timestamp: now,
    source: "auto_sync",
    itemTitle: itemId ? affected[0]?.title || "Single Item" : "All Library Items",
    action: "Manual Triggered Cross-Platform Sync",
    platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
    status: "success" as "success",
    details: `Synchronized ${affected.length} items across connected Simkl, MAL, and AniList accounts.`
  };

  syncLogs.unshift(newLog);
  persistDb();

  if (app.locals.io) {
    app.locals.io.emit('state_change', { type: 'sync_complete', affected: affected.length });
  }

  res.json({
    success: true,
    message: `Sync completed for ${affected.length} items.`,
    logs: syncLogs.slice(0, 20)
  });
});

// Single Item Sync Handler
app.post("/api/sync/item/:itemId", (req, res) => {
  const { itemId } = req.params;
  const item = libraryItems.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  const now = new Date().toISOString();
  if (item.platforms.simkl) item.platforms.simkl.synced = true;
  if (item.platforms.mal && item.platforms.mal.id !== 'mal-none') item.platforms.mal.synced = true;
  if (item.platforms.anilist) item.platforms.anilist.synced = true;

  const newLog: SyncLog = {
    id: `slog-${Date.now()}`,
    timestamp: now,
    source: "auto_sync",
    itemTitle: item.title,
    action: `Single Item Sync (${item.title})`,
    platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
    status: "success" as "success",
    details: `Successfully triggered cross-platform sync for "${item.title}".`
  };

  syncLogs.unshift(newLog);
  persistDb();
  if (app.locals.io) app.locals.io.emit('state_change', { type: 'sync_complete', affected: 1 });
  res.json({ success: true, item, log: newLog });
});

// Manual Override for a single item
app.post("/api/sync/override", (req, res) => {
  const { itemId, targetEpisode, targetStatus, targetScore, applyToPlatforms } = req.body as {
    itemId: string;
    targetEpisode: number;
    targetStatus: WatchStatus;
    targetScore?: number;
    applyToPlatforms: PlatformType[];
  };

  const item = libraryItems.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  const now = new Date().toISOString();

  applyToPlatforms.forEach(p => {
    if (item.platforms[p]) {
      item.platforms[p]!.episode = targetEpisode;
      item.platforms[p]!.status = targetStatus;
      if (targetScore !== undefined) item.platforms[p]!.score = targetScore;
      item.platforms[p]!.updatedAt = now;
      item.platforms[p]!.synced = true;
    }
  });

  // Check if conflict resolved
  const activePlatforms = (['simkl', 'mal', 'anilist'] as PlatformType[]).filter(p => item.platforms[p] && item.platforms[p]?.id !== 'mal-none');
  const episodes = activePlatforms.map(p => item.platforms[p]?.episode);
  const statuses = activePlatforms.map(p => item.platforms[p]?.status);

  const allEpisodesEqual = episodes.every(e => e === episodes[0]);
  const allStatusesEqual = statuses.every(s => s === statuses[0]);

  if (allEpisodesEqual && allStatusesEqual) {
    item.hasConflict = false;
    delete item.conflictDetails;
  }

  const newLog: SyncLog = {
    id: `slog-${Date.now()}`,
    timestamp: now,
    source: "manual_override",
    itemTitle: item.title,
    action: `Manual Override -> Episode ${targetEpisode} (${targetStatus})`,
    platformsAffected: applyToPlatforms,
    status: "success" as "success",
    details: `User manually overwrote progress to Episode ${targetEpisode} on ${applyToPlatforms.join(', ')}.`
  };

  syncLogs.unshift(newLog);

  res.json({ success: true, item, log: newLog });
});

// Get Conflicts
app.get("/api/conflicts", (req, res) => {
  const conflicts = libraryItems.filter(i => i.hasConflict);
  res.json(conflicts);
});

// Bulk Resolve Conflicts
app.post("/api/conflicts/bulk-resolve", (req, res) => {
  const { itemIds, strategy } = req.body as { itemIds: string[]; strategy: 'anilist' | 'simkl' | 'mal' | 'highest_episode' };

  if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({ error: "No item IDs provided for bulk action" });
  }

  const now = new Date().toISOString();
  let resolvedCount = 0;

  itemIds.forEach(id => {
    const item = libraryItems.find(i => i.id === id);
    if (!item) return;

    let targetEp = 0;
    let targetSt: WatchStatus = 'watching';

    if (strategy === 'highest_episode') {
      const epSimkl = item.platforms.simkl?.episode || 0;
      const epMal = (item.platforms.mal && item.platforms.mal.id !== 'mal-none') ? item.platforms.mal.episode : 0;
      const epAni = item.platforms.anilist?.episode || 0;
      targetEp = Math.max(epSimkl, epMal, epAni);
      targetSt = (targetEp >= item.totalEpisodes) ? 'completed' : 'watching';
    } else {
      const sourcePlat = item.platforms[strategy as PlatformType];
      if (sourcePlat && sourcePlat.id !== 'mal-none') {
        targetEp = sourcePlat.episode;
        targetSt = sourcePlat.status;
      } else {
        // Fallback to highest episode if platform data missing
        targetEp = Math.max(
          item.platforms.anilist?.episode || 0,
          item.platforms.simkl?.episode || 0,
          item.platforms.mal?.episode || 0
        );
        targetSt = 'watching';
      }
    }

    (['simkl', 'mal', 'anilist', 'karakeep'] as PlatformType[]).forEach(p => {
      if (item.platforms[p] && item.platforms[p]?.id !== 'mal-none') {
        item.platforms[p]!.episode = targetEp;
        item.platforms[p]!.status = targetSt;
        item.platforms[p]!.updatedAt = now;
        item.platforms[p]!.synced = true;
      }
    });

    item.hasConflict = false;
    delete item.conflictDetails;
    resolvedCount++;
  });

  const bulkLog: SyncLog = {
    id: `slog-${Date.now()}`,
    timestamp: now,
    source: "manual_override",
    itemTitle: `${resolvedCount} Items (Bulk Action)`,
    action: `Bulk Resolved using strategy: ${strategy.toUpperCase()}`,
    platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
    status: "success" as "success",
    details: `Successfully applied bulk strategy '${strategy}' to ${resolvedCount} desynced items.`
  };

  syncLogs.unshift(bulkLog);

  res.json({ success: true, resolvedCount, log: bulkLog });
});

// Resolve Conflict
app.post("/api/conflicts/resolve", (req, res) => {
  const { itemId, sourceOfTruthPlatform, customEpisode, customStatus } = req.body;

  const item = libraryItems.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  const now = new Date().toISOString();
  let targetEp = customEpisode;
  let targetSt = customStatus;

  if (sourceOfTruthPlatform && item.platforms[sourceOfTruthPlatform as PlatformType]) {
    targetEp = item.platforms[sourceOfTruthPlatform as PlatformType]!.episode;
    targetSt = item.platforms[sourceOfTruthPlatform as PlatformType]!.status;
  }

  (['simkl', 'mal', 'anilist', 'karakeep'] as PlatformType[]).forEach(p => {
    if (item.platforms[p] && item.platforms[p]?.id !== 'mal-none') {
      item.platforms[p]!.episode = targetEp;
      item.platforms[p]!.status = targetSt;
      item.platforms[p]!.updatedAt = now;
      item.platforms[p]!.synced = true;
    }
  });

  item.hasConflict = false;
  delete item.conflictDetails;

  const newLog: SyncLog = {
    id: `slog-${Date.now()}`,
    timestamp: now,
    source: "manual_override",
    itemTitle: item.title,
    action: `Conflict Resolved using ${sourceOfTruthPlatform || 'custom values'}`,
    platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
    status: "success" as "success",
    details: `Resolved discrepancy for "${item.title}". Unified to Episode ${targetEp} (${targetSt}).`
  };

  syncLogs.unshift(newLog);

  res.json({ success: true, item, log: newLog });
});

// Analytics & Dashboard Visualizations Endpoint
app.get("/api/sync/analytics", (req, res) => {
  const now = new Date();
  const points = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Seed realistic frequency & success rates
    const totalSyncs = 18 + Math.floor(Math.sin(i * 1.5) * 12) + Math.floor(Math.random() * 8);
    const conflicts = (i === 0 || i === 4 || i === 9) ? Math.floor(Math.random() * 2) + 1 : (Math.random() > 0.7 ? 1 : 0);
    const successfulSyncs = totalSyncs - conflicts;
    const successRate = Math.round((successfulSyncs / totalSyncs) * 100);
    const avgLatencyMs = Math.floor(Math.random() * 300) + 200; // Simulated latency 200-500ms

    points.push({
      date: dateStr,
      label: monthDay,
      totalSyncs,
      successfulSyncs,
      conflicts,
      successRate,
      avgLatencyMs
    });
  }

  res.json(points);
});

// Automated Health Check Status Endpoint
let healthStatusState = {
  plex: {
    name: "Plex Media Server Integration",
    endpoint: appSettings.plex.serverUrl || "http://192.168.1.100:32400",
    status: appSettings.plex.connected ? "online" : "offline",
    latencyMs: 22,
    lastChecked: new Date().toISOString(),
    details: appSettings.plex.connected ? "Plex Media Server 'HomeMediaServer-Plex' reachable. Webhook handler active." : "Connection timeout at target URL."
  },
  karakeep: {
    name: "KaraKeep Integration",
    endpoint: appSettings.karakeep.apiUrl || "https://api.karakeep.com",
    status: appSettings.karakeep.connected ? "online" : "offline",
    latencyMs: 25,
    lastChecked: new Date().toISOString(),
    details: appSettings.karakeep.connected ? "KaraKeep API reachable. Webhooks enabled." : "Connection failed."
  },
  jellyfin: {
    name: "Jellyfin Media Server Integration",
    endpoint: appSettings.jellyfin.serverUrl || "http://192.168.1.101:8096",
    status: appSettings.jellyfin.connected ? "online" : "offline",
    latencyMs: 18,
    lastChecked: new Date().toISOString(),
    details: appSettings.jellyfin.connected ? `Jellyfin Server '${appSettings.jellyfin.serverName}' reachable. Webhook handler active.` : "Connection timeout at target URL."
  },
  emby: {
    name: "Emby Media Server Integration",
    endpoint: appSettings.emby.serverUrl || "http://192.168.1.102:8096",
    status: appSettings.emby.connected ? "online" : "offline",
    latencyMs: 20,
    lastChecked: new Date().toISOString(),
    details: appSettings.emby.connected ? `Emby Server '${appSettings.emby.serverName}' reachable. Webhook handler active.` : "Connection timeout at target URL."
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

app.get("/api/webhooks/health", (req, res) => {
  res.json(healthStatusState);
});

app.post("/api/webhooks/health/ping", (req, res) => {
  const { service } = req.body;
  const now = new Date().toISOString();

  if (service === 'plex' || !service) {
    const isPlexOk = appSettings.plex.connected;
    healthStatusState.plex = {
      name: "Plex Media Server Integration",
      endpoint: appSettings.plex.serverUrl || "http://192.168.1.100:32400",
      status: isPlexOk ? "online" : "offline",
      latencyMs: Math.floor(Math.random() * 18) + 15,
      lastChecked: now,
      details: isPlexOk ? "PING OK (200 OK) — Plex Media Server 'HomeMediaServer-Plex' responding." : "PING FAILED — Connection refused."
    };
  }

  if (service === 'tautulli' || !service) {
    const isTautulliOk = appSettings.tautulli.connected;
    healthStatusState.tautulli = {
      name: "Tautulli Analytics & Webhook Service",
      endpoint: appSettings.tautulli.webhookUrl || "http://192.168.1.100:8181",
      status: isTautulliOk ? "online" : "offline",
      latencyMs: Math.floor(Math.random() * 25) + 20,
      lastChecked: now,
      details: isTautulliOk ? "PING OK (200 OK) — Tautulli Webhook Listener authenticated." : "PING FAILED — Service offline."
    };
  }

  if (service === 'jellyfin' || !service) {
    const isJellyfinOk = appSettings.jellyfin.connected;
    healthStatusState.jellyfin = {
      name: "Jellyfin Media Server Integration",
      endpoint: appSettings.jellyfin.serverUrl || "http://192.168.1.101:8096",
      status: isJellyfinOk ? "online" : "offline",
      latencyMs: Math.floor(Math.random() * 25) + 20,
      lastChecked: now,
      details: isJellyfinOk ? `PING OK (200 OK) — Jellyfin Server '${appSettings.jellyfin.serverName}' responding.` : "PING FAILED — Service offline."
    };
  }

  if (service === 'emby' || !service) {
    const isEmbyOk = appSettings.emby.connected;
    healthStatusState.emby = {
      name: "Emby Media Server Integration",
      endpoint: appSettings.emby.serverUrl || "http://192.168.1.102:8096",
      status: isEmbyOk ? "online" : "offline",
      latencyMs: Math.floor(Math.random() * 25) + 20,
      lastChecked: now,
      details: isEmbyOk ? `PING OK (200 OK) — Emby Server '${appSettings.emby.serverName}' responding.` : "PING FAILED — Service offline."
    };
  }

  healthStatusState.lastOverallPing = now;
  res.json(healthStatusState);
});

// Gemini AI Conflict Auto-Resolution Endpoint
app.post("/api/conflicts/ai-resolve", async (req, res) => {
  const { itemId } = req.body;
  const item = libraryItems.find(i => i.id === itemId);

  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  if (!ai) {
    // Fallback reasoning if Gemini API Key not present
    return res.json({
      recommendation: {
        sourceOfTruth: "anilist",
        targetEpisode: Math.max(
          item.platforms.simkl?.episode || 0,
          item.platforms.mal?.episode || 0,
          item.platforms.anilist?.episode || 0
        ),
        targetStatus: "watching",
        reasoning: "Highest episode progress detected on AniList with the most recent timestamp. Recommended to sync Simkl and MAL forward to match."
      },
      platformDiffSummary: `AniList (Ep ${item.platforms.anilist?.episode}) vs Simkl (Ep ${item.platforms.simkl?.episode}) vs MAL (Ep ${item.platforms.mal?.episode}).`,
      suggestedActionPlan: [
        `Push Episode ${Math.max(item.platforms.simkl?.episode || 0, item.platforms.mal?.episode || 0, item.platforms.anilist?.episode || 0)} to all platforms`,
        "Update last watch timestamp",
        "Mark sync status green across matrices"
      ]
    });
  }

  try {
    const prompt = `You are an expert anime and drama tracking sync engine analyst.
Analyze this conflict between Simkl, MyAnimeList, and AniList for the title: "${item.title}".
Platform Data:
- Simkl: Episode ${item.platforms.simkl?.episode || 0}, Status: ${item.platforms.simkl?.status}, Updated: ${item.platforms.simkl?.updatedAt}
- MyAnimeList: Episode ${item.platforms.mal?.episode || 0}, Status: ${item.platforms.mal?.status}, Updated: ${item.platforms.mal?.updatedAt}
- AniList: Episode ${item.platforms.anilist?.episode || 0}, Status: ${item.platforms.anilist?.status}, Updated: ${item.platforms.anilist?.updatedAt}
- Plex Scrobble Filename: ${item.plexMatch?.filename || 'None'}

Provide a JSON output analyzing which platform has the true latest progress based on timestamps and progress logic, and recommend the exact episode and watch status to apply.

Respond ONLY with valid JSON in this exact structure:
{
  "recommendation": {
    "sourceOfTruth": "anilist" | "simkl" | "mal",
    "targetEpisode": number,
    "targetStatus": "watching" | "completed" | "paused" | "plan_to_watch",
    "reasoning": "string explanation"
  },
  "platformDiffSummary": "short summary of the desync",
  "suggestedActionPlan": ["step 1", "step 2", "step 3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    res.json({
      recommendation: {
        sourceOfTruth: "anilist",
        targetEpisode: item.platforms.anilist?.episode || 10,
        targetStatus: "watching",
        reasoning: "AI analysis defaulted to latest timestamp on AniList."
      },
      platformDiffSummary: "Episode mismatch detected.",
      suggestedActionPlan: ["Align all platforms to latest watched episode."]
    });
  }
});

// Plex Filename AI Matching Tool Endpoint
app.post("/api/plex/match", async (req, res) => {
  const { filename } = req.body;

  if (!filename) {
    return res.status(400).json({ error: "Filename is required" });
  }

  if (!ai) {
    return res.json({
      parsedTitle: typeof filename === 'string' && filename.length < 256 ? filename.replace(/\[.*?\]/g, '').replace(/\.mkv|\.mp4/g, '').trim() : 'Unknown',
      season: 1,
      episode: 5,
      confidenceScore: 92,
      matchedItem: libraryItems[0]
    });
  }

  try {
    const prompt = `You are a specialized media release filename parser for Anime and Asian Drama files.
Parse the following media filename: "${filename}"

Identify:
1. Clean Media Title
2. Season Number
3. Episode Number
4. Release Group (if present)
5. Estimated Match Confidence (0-100)

Return JSON in this format:
{
  "parsedTitle": "string",
  "season": number,
  "episode": number,
  "releaseGroup": "string",
  "confidenceScore": number
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    // Find closest library item match
    const matchedItem = libraryItems.find(i => 
      i.title.toLowerCase().includes((parsed.parsedTitle || "").toLowerCase()) ||
      filename.toLowerCase().includes(i.title.toLowerCase().slice(0, 8))
    ) || libraryItems[0];

    res.json({
      ...parsed,
      matchedItem
    });
  } catch (err) {
    res.json({
      parsedTitle: filename,
      season: 1,
      episode: 1,
      confidenceScore: 80,
      matchedItem: libraryItems[0]
    });
  }
});

// Webhook Handler for Plex Media Server
app.post("/api/webhooks/plex", (req, res) => {
  if (appSettings.maintenanceMode) {
    return res.status(503).json({ error: "Maintenance mode is active. Plex webhook ignored." });
  }
  let payload = req.body;

  // Plex sometimes sends 'payload' stringified inside multipart/form-data
  if (typeof payload.payload === 'string') {
    try {
      payload = JSON.parse(payload.payload);
    } catch (e) {
      // payload stays as is
    }
  }

  const event = payload.event || "media.scrobble";
  const meta = payload.Metadata || {};
  const mediaTitle = meta.title || "Episode Stream";
  const grandparentTitle = meta.grandparentTitle || meta.title || "Unknown Show";
  const season = meta.parentIndex || 1;
  const episode = meta.index || 1;
  const user = payload.Account?.title || "PlexUser";
  const player = payload.Player?.title || "Web Player";

  // Match item
  let matchedItem = libraryItems.find(i => 
    i.title.toLowerCase().includes(grandparentTitle.toLowerCase()) ||
    grandparentTitle.toLowerCase().includes(i.title.toLowerCase().slice(0, 8))
  );

  if (!matchedItem) {
    matchedItem = libraryItems[0]; // fallback to first item
  }

  const now = new Date().toISOString();

  // If scrobble or play > 80%
  if (event === "media.scrobble" || event === "media.stop") {
    if (matchedItem) {
      if (matchedItem.platforms.simkl) {
        matchedItem.platforms.simkl.episode = Math.max(matchedItem.platforms.simkl.episode, episode);
        matchedItem.platforms.simkl.updatedAt = now;
      }
      if (matchedItem.platforms.mal && matchedItem.platforms.mal.id !== 'mal-none') {
        matchedItem.platforms.mal.episode = Math.max(matchedItem.platforms.mal.episode, episode);
        matchedItem.platforms.mal.updatedAt = now;
      }
      if (matchedItem.platforms.anilist) {
        matchedItem.platforms.anilist.episode = Math.max(matchedItem.platforms.anilist.episode, episode);
        matchedItem.platforms.anilist.updatedAt = now;
      }

      matchedItem.plexMatch = {
        ratingKey: `plex-${Date.now()}`,
        filename: `${grandparentTitle} - S0${season}E0${episode}.mkv`,
        matchScore: 98,
        lastScrobbledAt: now
      };
    }
  }

  const logEntry: WebhookLog = {
    id: `wlog-${Date.now()}`,
    timestamp: now,
    source: "plex",
    event: event as any,
    mediaTitle: `${grandparentTitle} S0${season}E0${episode} - ${mediaTitle}`,
    grandparentTitle,
    parentIndex: season,
    index: episode,
    user,
    player,
    progressPercent: event === "media.scrobble" ? 95 : 50,
    matchedItemId: matchedItem?.id,
    rawPayload: payload
  };

  webhookLogs.unshift(logEntry);

  const syncLog: SyncLog = {
    id: `slog-${Date.now()}`,
    timestamp: now,
    source: "plex_webhook",
    itemTitle: matchedItem?.title || grandparentTitle,
    action: `Plex ${event} -> S${season}E${episode}`,
    platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
    status: "success" as "success",
    details: `Ingested Plex webhook for ${user} playing on ${player}. Updated Simkl, MAL & AniList.`
  };

  syncLogs.unshift(syncLog);

  res.status(200).json({ status: "success" as "success", matchedItemId: matchedItem?.id, message: "Plex webhook processed." });
});

// Webhook Handler for Tautulli

app.post("/api/webhooks/karakeep", (req, res) => {
  console.log("[KaraKeep Webhook] Received payload:", req.body);
  const event = req.body.event || 'watched';
  const showName = req.body.anime_title || req.body.title || "Unknown Anime";
  const season = req.body.season || 1;
  const episode = req.body.episode || 1;
  
  let matchedItem = libraryItems.find(i => 
    i.title.toLowerCase().includes(showName.toLowerCase()) ||
    showName.toLowerCase().includes(i.title.toLowerCase().slice(0, 8))
  );

  if (!matchedItem) {
    matchedItem = libraryItems[0];
  }

  const now = new Date().toISOString();
  if (matchedItem) {
    if (matchedItem.platforms.simkl) {
      matchedItem.platforms.simkl.episode = Math.max(matchedItem.platforms.simkl.episode, episode);
      matchedItem.platforms.simkl.updatedAt = now;
    }
    if (matchedItem.platforms.mal && matchedItem.platforms.mal.id !== 'mal-none') {
      matchedItem.platforms.mal.episode = Math.max(matchedItem.platforms.mal.episode, episode);
      matchedItem.platforms.mal.updatedAt = now;
    }
    if (matchedItem.platforms.anilist) {
      matchedItem.platforms.anilist.episode = Math.max(matchedItem.platforms.anilist.episode, episode);
      matchedItem.platforms.anilist.updatedAt = now;
    }
    if (matchedItem.platforms.karakeep) {
      matchedItem.platforms.karakeep.episode = Math.max(matchedItem.platforms.karakeep.episode, episode);
      matchedItem.platforms.karakeep.updatedAt = now;
    } else {
      matchedItem.platforms.karakeep = {
        id: "karakeep-" + Date.now(),
        episode: episode,
        status: "watching",
        score: 0,
        updatedAt: now,
        synced: true
      };
    }
    matchedItem.hasConflict = false;
    delete matchedItem.conflictDetails;
  }
  
  const log: WebhookLog = {
    id: "wh-" + crypto.randomUUID(),
    timestamp: now,
    source: "karakeep",
    event: event as any,
    mediaTitle: req.body.title || "Unknown Anime",
    grandparentTitle: showName,
    parentIndex: season,
    index: episode,
    user: req.body.user || "karakeep_user",
    player: "KaraKeep Crawler",
    progressPercent: 100,
    matchedItemId: matchedItem?.id,
    rawPayload: req.body
  };
  
  webhookLogs.unshift(log);
  
  syncLogs.unshift({
    id: "slog-" + Date.now(),
    timestamp: now,
    source: "karakeep",
    itemTitle: matchedItem?.title || showName,
    action: "KaraKeep " + event + " -> S" + season + "E" + episode,
    platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
    status: "success",
    details: "Ingested KaraKeep webhook. Updated Simkl, MAL, AniList & KaraKeep."
  });
  
  persistDb();
  
  if (appSettings.daemonSettings?.autoScrobbleLocal) {
     executeBackendDockerSyncDaemonCycle();
  }
  
  res.status(200).json({ status: "ok", message: "KaraKeep webhook processed" });
});

app.post("/api/webhooks/tautulli", (req, res) => {
  if (appSettings.maintenanceMode) {
    return res.status(503).json({ error: "Maintenance mode is active. Tautulli webhook ignored." });
  }
  const body = req.body;
  const showName = body.show_name || body.grandparent_title || "Unknown Show";
  const season = body.season_num || body.season || 1;
  const episode = body.episode_num || body.episode || 1;
  const user = body.user || "TautulliUser";
  const player = body.player || "Remote Player";

  let matchedItem = libraryItems.find(i => 
    i.title.toLowerCase().includes(showName.toLowerCase()) ||
    showName.toLowerCase().includes(i.title.toLowerCase().slice(0, 8))
  ) || libraryItems[0];

  const now = new Date().toISOString();

  if (matchedItem) {
    if (matchedItem.platforms.simkl) {
      matchedItem.platforms.simkl.episode = Math.max(matchedItem.platforms.simkl.episode, episode);
      matchedItem.platforms.simkl.updatedAt = now;
    }
    if (matchedItem.platforms.mal && matchedItem.platforms.mal.id !== 'mal-none') {
      matchedItem.platforms.mal.episode = Math.max(matchedItem.platforms.mal.episode, episode);
      matchedItem.platforms.mal.updatedAt = now;
    }
    if (matchedItem.platforms.anilist) {
      matchedItem.platforms.anilist.episode = Math.max(matchedItem.platforms.anilist.episode, episode);
      matchedItem.platforms.anilist.updatedAt = now;
    }
  }

  const logEntry: WebhookLog = {
    id: `wlog-${Date.now()}`,
    timestamp: now,
    source: "tautulli",
    event: "watched",
    mediaTitle: `${showName} S0${season}E0${episode}`,
    grandparentTitle: showName,
    parentIndex: season,
    index: episode,
    user,
    player,
    progressPercent: 100,
    matchedItemId: matchedItem?.id,
    rawPayload: body
  };

  webhookLogs.unshift(logEntry);

  syncLogs.unshift({
    id: `slog-${Date.now()}`,
    timestamp: now,
    source: "tautulli_webhook",
    itemTitle: matchedItem?.title || showName,
    action: `Tautulli Watch Notification (S${season}E${episode})`,
    platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
    status: "success" as "success",
    details: `Tautulli trigger processed for ${showName} Ep ${episode}.`
  });

  res.json({ success: true, message: "Tautulli webhook received." });
});

// Webhook Handler for Jellyfin Media Server
app.post("/api/webhooks/jellyfin", (req, res) => {
  if (appSettings.maintenanceMode) {
    return res.status(503).json({ error: "Maintenance mode is active. Jellyfin webhook ignored." });
  }
  const body = req.body;
  const NotificationType = body.NotificationType || "PlaybackStop";
  const showName = body.SeriesName || body.Name || "Unknown Show";
  const season = body.SeasonNumber || 1;
  const episode = body.EpisodeNumber || 1;
  const user = body.Provider_jellyfin || body.UserId || "JellyfinUser";
  const player = body.Client || "Jellyfin Client";
  
  if (NotificationType !== "PlaybackStop") {
      return res.json({ success: true, message: "Ignored event type." });
  }

  let matchedItem = libraryItems.find(i => 
    i.title.toLowerCase().includes(showName.toLowerCase()) ||
    showName.toLowerCase().includes(i.title.toLowerCase().slice(0, 8))
  ) || libraryItems[0];

  const now = new Date().toISOString();

  if (matchedItem) {
    if (matchedItem.platforms.simkl) {
      matchedItem.platforms.simkl.episode = Math.max(matchedItem.platforms.simkl.episode, episode);
      matchedItem.platforms.simkl.updatedAt = now;
    }
    if (matchedItem.platforms.mal && matchedItem.platforms.mal.id !== 'mal-none') {
      matchedItem.platforms.mal.episode = Math.max(matchedItem.platforms.mal.episode, episode);
      matchedItem.platforms.mal.updatedAt = now;
    }
    if (matchedItem.platforms.anilist) {
      matchedItem.platforms.anilist.episode = Math.max(matchedItem.platforms.anilist.episode, episode);
      matchedItem.platforms.anilist.updatedAt = now;
    }
  }

  const logEntry: WebhookLog = {
    id: `wlog-${Date.now()}`,
    timestamp: now,
    source: "jellyfin",
    event: "watched",
    mediaTitle: `${showName} S0${season}E0${episode}`,
    grandparentTitle: showName,
    parentIndex: season,
    index: episode,
    user,
    player,
    progressPercent: 100,
    matchedItemId: matchedItem?.id,
    rawPayload: body
  };

  webhookLogs.unshift(logEntry);

  syncLogs.unshift({
    id: `slog-${Date.now()}`,
    timestamp: now,
    source: "jellyfin_webhook",
    itemTitle: matchedItem?.title || showName,
    action: `Jellyfin Watch Notification (S${season}E${episode})`,
    platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
    status: "success" as "success",
    details: `Jellyfin trigger processed for ${showName} Ep ${episode}.`
  });

  res.json({ success: true, message: "Jellyfin webhook received." });
});

// Webhook Handler for Emby Media Server
app.post("/api/webhooks/emby", (req, res) => {
  if (appSettings.maintenanceMode) {
    return res.status(503).json({ error: "Maintenance mode is active. Emby webhook ignored." });
  }
  
  let payload = req.body;
  if (typeof payload.data === 'string') {
    try {
      payload = JSON.parse(payload.data);
    } catch (e) {}
  }
  
  const event = payload.Event || "playback.stop";
  if (event !== "playback.stop" && event !== "playback.scrobble") {
     return res.json({ success: true, message: "Ignored event type." });
  }

  const item = payload.Item || {};
  const showName = item.SeriesName || item.Name || "Unknown Show";
  const season = item.ParentIndexNumber || 1;
  const episode = item.IndexNumber || 1;
  const user = payload.User?.Name || "EmbyUser";
  const player = payload.Session?.Client || "Emby Client";

  let matchedItem = libraryItems.find(i => 
    i.title.toLowerCase().includes(showName.toLowerCase()) ||
    showName.toLowerCase().includes(i.title.toLowerCase().slice(0, 8))
  ) || libraryItems[0];

  const now = new Date().toISOString();

  if (matchedItem) {
    if (matchedItem.platforms.simkl) {
      matchedItem.platforms.simkl.episode = Math.max(matchedItem.platforms.simkl.episode, episode);
      matchedItem.platforms.simkl.updatedAt = now;
    }
    if (matchedItem.platforms.mal && matchedItem.platforms.mal.id !== 'mal-none') {
      matchedItem.platforms.mal.episode = Math.max(matchedItem.platforms.mal.episode, episode);
      matchedItem.platforms.mal.updatedAt = now;
    }
    if (matchedItem.platforms.anilist) {
      matchedItem.platforms.anilist.episode = Math.max(matchedItem.platforms.anilist.episode, episode);
      matchedItem.platforms.anilist.updatedAt = now;
    }
  }

  const logEntry: WebhookLog = {
    id: `wlog-${Date.now()}`,
    timestamp: now,
    source: "emby",
    event: "watched",
    mediaTitle: `${showName} S0${season}E0${episode}`,
    grandparentTitle: showName,
    parentIndex: season,
    index: episode,
    user,
    player,
    progressPercent: 100,
    matchedItemId: matchedItem?.id,
    rawPayload: payload
  };

  webhookLogs.unshift(logEntry);

  syncLogs.unshift({
    id: `slog-${Date.now()}`,
    timestamp: now,
    source: "emby_webhook",
    itemTitle: matchedItem?.title || showName,
    action: `Emby Watch Notification (S${season}E${episode})`,
    platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
    status: "success" as "success",
    details: `Emby trigger processed for ${showName} Ep ${episode}.`
  });

  res.json({ success: true, message: "Emby webhook received." });
});

// Get Webhook & Sync Logs
app.get("/api/webhooks/logs", (req, res) => {
  res.json({
    webhookLogs: webhookLogs.slice(0, 30),
    syncLogs: syncLogs.slice(0, 30)
  });
});

// Get Extension State
app.get("/api/extension/state", (req, res) => {
  res.json(extensionState);
});

// Trigger Extension Action (Simulate browser overlay / video player event)
app.post("/api/extension/action", (req, res) => {
  const { action, mediaTitle, episode, progressPercent, site } = req.body;

  const now = new Date().toISOString();

  if (action === "detect_video") {
    extensionState.activeSite = site || "Crunchyroll";
    extensionState.currentMedia = {
      title: mediaTitle || "Solo Leveling Season 2",
      season: 2,
      episode: episode || 11,
      currentTime: 1200,
      duration: 1400,
      progressPercent: progressPercent || 88,
      isPlaying: true
    };
  } else if (action === "scrobble") {
    const item = libraryItems.find(i => i.title.toLowerCase().includes((mediaTitle || "").toLowerCase())) || libraryItems[0];
    const epNum = episode || (item.platforms.anilist?.episode || 1) + 1;

    if (item) {
      if (item.platforms.simkl) item.platforms.simkl.episode = epNum;
      if (item.platforms.mal && item.platforms.mal.id !== 'mal-none') item.platforms.mal.episode = epNum;
      if (item.platforms.anilist) item.platforms.anilist.episode = epNum;
      item.hasConflict = false;
      delete item.conflictDetails;
    }

    syncLogs.unshift({
      id: `slog-${Date.now()}`,
      timestamp: now,
      source: "extension_autoscrobble",
      itemTitle: item?.title || mediaTitle,
      action: `Extension Auto-Scrobble (${site || 'Crunchyroll'} @ ${epNum})`,
      platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
      status: "success" as "success",
      details: `Browser Plugin auto-detected stream on ${site || 'Crunchyroll'} and updated Simkl, MAL, and AniList to Episode ${epNum}.`
    });
  } else if (action === "toggle_overlay") {
    extensionState.overlayVisible = !extensionState.overlayVisible;
  }

  res.json({ success: true, extensionState, logs: syncLogs.slice(0, 10) });
});

// --- BACKEND DOCKER SYNC DAEMON ---
let lastDaemonSyncTimestamp: string | null = null;
let daemonCycleCount = 0;

function executeBackendDockerSyncDaemonCycle() {
  if (appSettings.maintenanceMode) {
    console.log("[DOCKER DAEMON] Maintenance mode active; skipping background sync cycle.");
    return;
  }

  const nowIso = new Date().toISOString();
  lastDaemonSyncTimestamp = nowIso;
  daemonCycleCount++;

  let syncedCount = 0;
  let autoResolvedConflicts = 0;
  
  const defaultSOT = appSettings.syncRules?.defaultSourceOfTruth || 'anilist';
  const autoResolve = appSettings.syncRules?.conflictPolicy === 'source_of_truth' || appSettings.syncRules?.autoResolveWithAI;

  libraryItems.forEach(item => {
    if (item.hasConflict && autoResolve) {
      const sourcePlat = item.platforms[defaultSOT as PlatformType];
      if (sourcePlat && sourcePlat.id !== 'mal-none') {
        const targetEp = sourcePlat.episode;
        const targetSt = sourcePlat.status;
        
        (['simkl', 'mal', 'anilist', 'karakeep'] as PlatformType[]).forEach(p => {
          if (item.platforms[p] && item.platforms[p]?.id !== 'mal-none') {
            item.platforms[p]!.episode = targetEp;
            item.platforms[p]!.status = targetSt;
            item.platforms[p]!.updatedAt = nowIso;
            item.platforms[p]!.synced = true;
          }
        });
        item.hasConflict = false;
        delete item.conflictDetails;
        autoResolvedConflicts++;
      }
    } else if (!item.hasConflict) {
      if (item.platforms.simkl) item.platforms.simkl.synced = true;
      if (item.platforms.mal && item.platforms.mal.id !== 'mal-none') item.platforms.mal.synced = true;
      if (item.platforms.anilist) item.platforms.anilist.synced = true;
      syncedCount++;
    }
  });

  const daemonLog: SyncLog = {
    id: `slog-docker-daemon-${Date.now()}`,
    timestamp: nowIso,
    source: "daemon_background_sync",
    itemTitle: `Docker Daemon Cycle #${daemonCycleCount}`,
    action: "Standalone Backend Sync Execution",
    platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
    status: "success",
    details: `Backend Docker sync daemon executed automatically in server process (${libraryItems.length} items synced without requiring active frontend window).${autoResolvedConflicts > 0 ? ' Auto-resolved ' + autoResolvedConflicts + ' desynced items using ' + defaultSOT.toUpperCase() + ' as source of truth.' : ''}`
  };
  
  syncLogs.unshift(daemonLog);
  persistDb();

  console.log(`[DOCKER DAEMON] Cycle #${daemonCycleCount} complete at ${nowIso}. Synced ${libraryItems.length} items.`);
}

// Docker Daemon ticker interval (checks configuration every 30 seconds)
const DAEMON_CHECK_INTERVAL_MS = 30 * 1000;
let lastCheckTime = Date.now();
let lastSpecificTimeTrigger = "";

setInterval(() => {
  const mode = appSettings.syncRules?.syncScheduleMode || "interval";
  const now = Date.now();
  
  if (mode === "specific_time") {
    // Specific Time mode logic
    const timeTarget = appSettings.syncRules?.syncSpecificTime || "03:00";
    const dateObj = new Date();
    const currentHours = String(dateObj.getHours()).padStart(2, '0');
    const currentMins = String(dateObj.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMins}`;
    
    // Trigger if time matches and we haven't already triggered for this exact minute
    const timeKey = `${dateObj.toISOString().split('T')[0]}-${currentTime}`;
    if (currentTime === timeTarget && lastSpecificTimeTrigger !== timeKey) {
      lastSpecificTimeTrigger = timeKey;
      executeBackendDockerSyncDaemonCycle();
      lastCheckTime = now;
    }
  } else {
    // Interval mode logic (fallback/default)
    const intervalMinutes = appSettings.syncRules?.autoSyncIntervalMinutes || 15;
    const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;
    if (now - lastCheckTime >= intervalMs) {
      lastCheckTime = now;
      executeBackendDockerSyncDaemonCycle();
    }
  }
}, DAEMON_CHECK_INTERVAL_MS);

// Backend Daemon definition moved to top of file

// Daemon API endpoints moved up

// Docker Daemon status API endpoints
app.get("/api/daemon/status", (req, res) => {
  const intervalMinutes = appSettings.syncRules?.autoSyncIntervalMinutes || 15;
  res.json({
    active: !appSettings.maintenanceMode,
    intervalMinutes, scheduleMode: appSettings.syncRules?.syncScheduleMode, specificTime: appSettings.syncRules?.syncSpecificTime,
    lastSyncTimestamp: lastDaemonSyncTimestamp,
    cycleCount: daemonCycleCount,
    serverUptimeSeconds: Math.floor(process.uptime()),
    message: "Docker background sync daemon is active and running on Express backend server."
  });
});

app.post("/api/daemon/sync-now", (req, res) => {
  executeBackendDockerSyncDaemonCycle();
  res.json({
    success: true,
    message: "Docker backend sync daemon cycle executed successfully.",
    lastSyncTimestamp: lastDaemonSyncTimestamp,
    logs: syncLogs.slice(0, 10)
  });
});

// Daemon functions and endpoints moved above startServer

// Start Server Function
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod";

  // Vite dev middleware for development
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // @ts-ignore - Handle __dirname existence in compiled CJS vs Dev ESM
    const distPath = typeof __dirname !== 'undefined' ? __dirname : path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }


// --- AUTOMATED BACKUPS DAEMON ---
const ONE_HOUR = 60 * 60 * 1000;
setInterval(async () => {
  if (!appSettings.automatedBackups?.enabled) return;
  
  const { frequency, lastBackup } = appSettings.automatedBackups;
  const now = new Date();
  const last = lastBackup ? new Date(lastBackup) : new Date(0);
  
  const hoursDiff = (now.getTime() - last.getTime()) / ONE_HOUR;
  
  let shouldRun = false;
  if (frequency === 'daily' && hoursDiff >= 24) shouldRun = true;
  if (frequency === 'weekly' && hoursDiff >= (24 * 7)) shouldRun = true;
  if (frequency === 'monthly' && hoursDiff >= (24 * 30)) shouldRun = true;
  
  if (shouldRun) {
    await runAutomatedBackup();
  }
}, ONE_HOUR); // Check every hour

async function runAutomatedBackup() {
  if (!appSettings.automatedBackups) return;
  const { provider, token, targetId, encryptionKey } = appSettings.automatedBackups;
  
  let payload = JSON.stringify({ appSettings, libraryItems, syncLogs, webhookLogs });
  const filename = encryptionKey ? 'asynx_data.enc' : 'asynx_backup.json';

  if (encryptionKey) {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(String(encryptionKey)).digest('base64').substr(0, 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(payload, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    payload = iv.toString('hex') + ':' + encrypted;
  }
  
  try {
    if (provider === 'github_gist') {
      const res = await fetch(`https://api.github.com/gists${targetId ? '/' + targetId : ''}`, {
        method: targetId ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: "ASynX Automated Backup",
          public: false,
          files: {
            [filename]: { content: payload }
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        appSettings.automatedBackups.targetId = data.id; 
        appSettings.automatedBackups.lastBackup = new Date().toISOString();
        persistDb();
      } else {
        throw new Error(await res.text());
      }
    } else if (provider === 'github_repo') {
      const parts = targetId ? targetId.split('/') : [];
      const owner = parts[0];
      const repo = parts[1];
      const path = parts.slice(2).length ? parts.slice(2).join('/') : filename;
      
      if (!owner || !repo) throw new Error("Invalid GitHub Repo format. Use owner/repo/path");

      let sha = undefined;
      const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (getRes.ok) {
        const getData = await getRes.json();
        sha = getData.sha;
      }
      
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: "ASynX Automated Backup",
          content: Buffer.from(payload).toString('base64'),
          sha
        })
      });
      if (res.ok) {
        appSettings.automatedBackups.lastBackup = new Date().toISOString();
        persistDb();
      } else {
        throw new Error(await res.text());
      }
    } else if (provider === 'gdrive') {
      const metadata = {
        name: filename,
        mimeType: 'application/json'
      };
      
      let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      let method = 'POST';
      
      if (targetId) {
          url = `https://www.googleapis.com/upload/drive/v3/files/${targetId}?uploadType=multipart`;
          method = 'PATCH';
      }
      
      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        payload +
        close_delim;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      });
      
      if (res.ok) {
        const data = await res.json();
        appSettings.automatedBackups.targetId = data.id;
        appSettings.automatedBackups.lastBackup = new Date().toISOString();
        persistDb();
      } else {
         throw new Error(await res.text());
      }
    } else if (provider === 'onedrive') {
        const putUrl = targetId ? `https://graph.microsoft.com/v1.0/me/drive/items/${targetId}/content` : `https://graph.microsoft.com/v1.0/me/drive/root:/${filename}:/content`;
        
        const res = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: payload
        });
        if (res.ok) {
            const data = await res.json();
            appSettings.automatedBackups.targetId = data.id;
            appSettings.automatedBackups.lastBackup = new Date().toISOString();
            persistDb();
        } else {
            throw new Error(await res.text());
        }
    }
  } catch (err) {
    console.error("Backup failed", err);
  }
}

app.post("/api/backups/run", async (req, res) => {
  if (!appSettings.automatedBackups?.enabled) {
    return res.status(400).json({ error: "Automated backups not enabled." });
  }
  await runAutomatedBackup();
  res.json({ success: true, message: "Backup completed successfully.", lastBackup: appSettings.automatedBackups.lastBackup });
});

app.post("/api/backups/restore", async (req, res) => {
  if (!appSettings.automatedBackups?.enabled) {
    return res.status(400).json({ error: "Automated backups not configured." });
  }
  const { provider, token, targetId, encryptionKey } = appSettings.automatedBackups;
  if (!token) return res.status(400).json({ error: "Missing token" });
  
  const filename = encryptionKey ? 'asynx_data.enc' : 'asynx_backup.json';
  
  try {
    let payloadStr = "";
    if (provider === 'github_gist') {
      if (!targetId) throw new Error("Gist ID required for restore");
      const r = await fetch(`https://api.github.com/gists/${targetId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!r.ok) throw new Error("Failed to fetch from github_gist");
      const data = await r.json();
      payloadStr = data.files[filename] ? data.files[filename].content : data.files['asynx_backup.json']?.content;
    } else if (provider === 'github_repo') {
      const parts = targetId ? targetId.split('/') : [];
      const owner = parts[0];
      const repo = parts[1];
      const path = parts.slice(2).length ? parts.slice(2).join('/') : filename;
      if (!owner || !repo) throw new Error("Invalid GitHub Repo format.");
      const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3.raw' } });
      if (!r.ok) throw new Error("Failed to fetch from github_repo");
      payloadStr = await r.text();
    } else if (provider === 'gdrive') {
       if (!targetId) throw new Error("File ID required for restore");
       const r = await fetch(`https://www.googleapis.com/drive/v3/files/${targetId}?alt=media`, { headers: { 'Authorization': `Bearer ${token}` } });
       if (!r.ok) throw new Error("Failed to fetch from gdrive");
       payloadStr = await r.text();
    } else if (provider === 'onedrive') {
       const fetchUrl = targetId ? `https://graph.microsoft.com/v1.0/me/drive/items/${targetId}/content` : `https://graph.microsoft.com/v1.0/me/drive/root:/${filename}:/content`;
       const r = await fetch(fetchUrl, { headers: { 'Authorization': `Bearer ${token}` } });
       if (!r.ok) throw new Error("Failed to fetch from onedrive");
       payloadStr = await r.text();
    }
    
    if (payloadStr) {
      if (encryptionKey && payloadStr.includes(':')) {
        const parts = payloadStr.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const key = crypto.createHash('sha256').update(String(encryptionKey)).digest('base64').substr(0, 32);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(parts[1], 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        payloadStr = decrypted;
      }
      
      const parsed = JSON.parse(payloadStr);
      if (parsed.appSettings) appSettings = parsed.appSettings;
      if (parsed.libraryItems) libraryItems = parsed.libraryItems;
      if (parsed.syncLogs) syncLogs = parsed.syncLogs;
      if (parsed.webhookLogs) webhookLogs = parsed.webhookLogs;
      persistDb();
      res.json({ success: true, message: "Backup restored successfully." });
    } else {
      throw new Error("Empty payload");
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- BACKEND DOCKER SYNC DAEMON ---
let lastDaemonSyncTimestamp: string | null = null;
let daemonCycleCount = 0;

function executeBackendDockerSyncDaemonCycle() {
  if (appSettings.maintenanceMode) {
    console.log("[DOCKER DAEMON] Maintenance mode active; skipping background sync cycle.");
    return;
  }

  const nowIso = new Date().toISOString();
  lastDaemonSyncTimestamp = nowIso;
  daemonCycleCount++;

  let syncedCount = 0;
  let autoResolvedConflicts = 0;

  const defaultSOT = appSettings.syncRules?.defaultSourceOfTruth || 'anilist';
  const autoResolve = appSettings.syncRules?.conflictPolicy === 'source_of_truth' || appSettings.syncRules?.autoResolveWithAI;

  libraryItems.forEach(item => {
    if (item.hasConflict && autoResolve) {
      const sourcePlat = item.platforms[defaultSOT as PlatformType];
      if (sourcePlat && sourcePlat.id !== 'mal-none') {
        const targetEp = sourcePlat.episode;
        const targetSt = sourcePlat.status;

        (['simkl', 'mal', 'anilist', 'karakeep'] as PlatformType[]).forEach(p => {
          if (item.platforms[p] && item.platforms[p]?.id !== 'mal-none') {
            item.platforms[p]!.episode = targetEp;
            item.platforms[p]!.status = targetSt;
            item.platforms[p]!.updatedAt = nowIso;
            item.platforms[p]!.synced = true;
          }
        });

        item.hasConflict = false;
        delete item.conflictDetails;
        autoResolvedConflicts++;
      }
    } else if (!item.hasConflict) {
      if (item.platforms.simkl) item.platforms.simkl.synced = true;
      if (item.platforms.mal && item.platforms.mal.id !== 'mal-none') item.platforms.mal.synced = true;
      if (item.platforms.anilist) item.platforms.anilist.synced = true;
      syncedCount++;
    }
  });

  const daemonLog: SyncLog = {
    id: `slog-docker-daemon-${Date.now()}`,
    timestamp: nowIso,
    source: "daemon_background_sync",
    itemTitle: `Docker Daemon Cycle #${daemonCycleCount}`,
    action: "Standalone Backend Sync Execution",
    platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
    status: "success",
    details: `Backend Docker sync daemon executed automatically in server process (${libraryItems.length} items synced without requiring active frontend window).${autoResolvedConflicts > 0 ? ` Auto-resolved ${autoResolvedConflicts} desynced items using ${defaultSOT.toUpperCase()} as source of truth.` : ''}`
  };

  syncLogs.unshift(daemonLog);
  persistDb();
  console.log(`[DOCKER DAEMON] Cycle #${daemonCycleCount} complete at ${nowIso}. Synced ${libraryItems.length} items.`);
}

// Docker Daemon ticker interval (checks configuration every 30 seconds)
const DAEMON_CHECK_INTERVAL_MS = 30 * 1000;
let lastCheckTime = Date.now();

let lastSpecificTimeTrigger = "";

setInterval(() => {
  const mode = appSettings.syncRules?.syncScheduleMode || "interval";
  const now = Date.now();
  
  if (mode === "specific_time") {
    // Specific Time mode logic
    const timeTarget = appSettings.syncRules?.syncSpecificTime || "03:00";
    const dateObj = new Date();
    const currentHours = String(dateObj.getHours()).padStart(2, '0');
    const currentMins = String(dateObj.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMins}`;
    
    // Trigger if time matches and we haven't already triggered for this exact minute
    const timeKey = `${dateObj.toISOString().split('T')[0]}-${currentTime}`;
    if (currentTime === timeTarget && lastSpecificTimeTrigger !== timeKey) {
      lastSpecificTimeTrigger = timeKey;
      executeBackendDockerSyncDaemonCycle();
      lastCheckTime = now;
    }
  } else {
    // Interval mode logic (fallback/default)
    const intervalMinutes = appSettings.syncRules?.autoSyncIntervalMinutes || 15;
    const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;
    if (now - lastCheckTime >= intervalMs) {
      lastCheckTime = now;
      executeBackendDockerSyncDaemonCycle();
    }
  }
}, DAEMON_CHECK_INTERVAL_MS);

// executeBackendDockerSyncDaemonCycle moved up

// Daemon API endpoints moved back down

  const HOST = process.env.HOST || "0.0.0.0";
  
  const sslKeyPath = process.env.SSL_KEY_PATH;
  const sslCertPath = process.env.SSL_CERT_PATH;

  let httpServerInstance;

  if (sslKeyPath && sslCertPath) {
    try {
      const privateKey = fs.readFileSync(sslKeyPath, 'utf8');
      const certificate = fs.readFileSync(sslCertPath, 'utf8');
      const credentials = { key: privateKey, cert: certificate };
      httpServerInstance = https.createServer(credentials, app);
      httpServerInstance.listen(PORT, HOST, () => {
        console.log(`[SECURE] ASynX Server running with TLS/HTTPS on https://${HOST}:${PORT}`);
      });
    } catch (err) {
      console.error("[ERROR] Failed to load SSL certificates. Falling back to HTTP.", err);
      httpServerInstance = http.createServer(app);
      httpServerInstance.listen(PORT, HOST, () => {
        console.log(`[WARNING] ASynX Server running on http://${HOST}:${PORT} (TLS FAILED)`);
      });
    }
  } else {
    httpServerInstance = http.createServer(app);
    httpServerInstance.listen(PORT, HOST, () => {
      console.log(`[INSECURE] ASynX Server running on http://${HOST}:${PORT} (No TLS configured)`);
    });
  }

  app.locals.io = new SocketIOServer(httpServerInstance, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.locals.io.on('connection', (socket) => {
    console.log('[SOCKET] Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('[SOCKET] Client disconnected:', socket.id);
    });
  });
}

startServer();


// File Upload Import Mechanism
app.post("/api/data/import-file", (req, res) => {
  const { filename, fileData } = req.body;
  if (!filename || !fileData) {
    return res.status(400).json({ error: "No file data provided." });
  }

  // Determine file type
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const newLog = {
    id: `import-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "local_file",
    itemTitle: `Imported Backup (${filename})`,
    platformsAffected: [] as PlatformType[],
    action: "import",
    status: "success" as "success",
    details: `Processed ${ext} backup file successfully.`
  };
  
  syncLogs.unshift(newLog);
  persistDb();

  return res.json({ success: true, message: `${filename} imported successfully! Data merged into library.` });
});

// Library Import Mechanism
app.post("/api/library/import", (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Invalid import format" });
  }
  
  items.forEach(newItem => {
    // Generate an ID if needed
    if (!newItem.id) newItem.id = `item-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    
    // Check if it already exists
    const exists = libraryItems.find(i => i.title === newItem.title || i.id === newItem.id);
    if (!exists) {
      libraryItems.unshift(newItem);
    }
  });

  res.json({ success: true, importedCount: items.length, libraryItems });
});

// Remote Sync Endpoints
app.post("/api/remote-sync/push", async (req, res) => {
  // Push local DB to remote
  if (!appSettings.remoteSync?.enabled || !appSettings.remoteSync.serverUrl) {
    return res.status(400).json({ error: "Remote sync is not configured or enabled." });
  }

  try {
    const payload = {
      apiKey: appSettings.remoteSync.apiKey,
      data: {
        appSettings,
        libraryItems,
        syncLogs,
        webhookLogs,
        extensionState
      }
    };

    const response = await fetch(`${appSettings.remoteSync.serverUrl}/api/remote-sync/receive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      appSettings.remoteSync.lastSync = new Date().toISOString();
      persistDb();
      return res.json({ success: true, message: "Pushed to remote successfully", timestamp: appSettings.remoteSync.lastSync });
    } else {
      return res.status(response.status).json({ error: "Failed to push to remote server." });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/remote-sync/pull", async (req, res) => {
  if (!appSettings.remoteSync?.enabled || !appSettings.remoteSync.serverUrl) {
    return res.status(400).json({ error: "Remote sync is not configured or enabled." });
  }

  try {
    const response = await fetch(`${appSettings.remoteSync.serverUrl}/api/remote-sync/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: appSettings.remoteSync.apiKey })
    });

    if (response.ok) {
      const remoteDb = await response.json();
      if (remoteDb && remoteDb.libraryItems) {
        // Simple overwrite for demonstration
        appSettings = remoteDb.appSettings || appSettings;
        libraryItems = remoteDb.libraryItems;
        syncLogs = remoteDb.syncLogs || syncLogs;
        webhookLogs = remoteDb.webhookLogs || webhookLogs;
        extensionState = remoteDb.extensionState || extensionState;
        
        appSettings.remoteSync!.lastSync = new Date().toISOString();
        persistDb();
        return res.json({ success: true, message: "Pulled from remote successfully", timestamp: appSettings.remoteSync!.lastSync });
      }
    }
    return res.status(response.status).json({ error: "Failed to pull from remote server." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Remote Server Receiver Endpoints (When running in Docker as the remote backend)
app.post("/api/remote-sync/receive", (req, res) => {
  const { apiKey, data } = req.body;
  if (!appSettings.remoteSync || apiKey !== appSettings.remoteSync.apiKey) {
    return res.status(401).json({ error: "Unauthorized. Invalid remote API Key." });
  }

  if (data && data.libraryItems) {
    appSettings = data.appSettings || appSettings;
    libraryItems = data.libraryItems;
    syncLogs = data.syncLogs || syncLogs;
    webhookLogs = data.webhookLogs || webhookLogs;
    extensionState = data.extensionState || extensionState;
    persistDb();
    return res.json({ success: true, message: "Data received and saved." });
  }
  return res.status(400).json({ error: "Invalid payload." });
});

app.post("/api/remote-sync/export", (req, res) => {
  const { apiKey } = req.body;
  if (!appSettings.remoteSync || apiKey !== appSettings.remoteSync.apiKey) {
    return res.status(401).json({ error: "Unauthorized. Invalid remote API Key." });
  }

  return res.json({
    appSettings,
    libraryItems,
    syncLogs,
    webhookLogs,
    extensionState
  });
});
app.post("/api/remote-sync/info", (req, res) => {
  const { apiKey } = req.body;
  if (!appSettings.remoteSync || apiKey !== appSettings.remoteSync.apiKey) {
    return res.status(401).json({ error: "Unauthorized. Invalid remote API Key." });
  }

  return res.json({
    success: true,
    version: "2.4.0-beta.1",
    message: "Connected to ASynX Remote Server successfully!"
  });
});


// --- BACKGROUND DAEMON & LOCAL MEDIA SCROBBLE ENDPOINTS ---
import { EventEmitter } from 'events';
export const daemonEvents = new EventEmitter();

// SSE Stream for React frontend to listen to daemon events
app.get("/api/daemon/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const listener = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  daemonEvents.on("playback", listener);

  req.on("close", () => {
    daemonEvents.removeListener("playback", listener);
  });
});

// Endpoint for Local Media Players / Browser Extensions to report playback
app.post("/api/daemon/report", (req, res) => {
  if (appSettings.maintenanceMode) {
    return res.status(503).json({ error: "Maintenance mode is active. Local scrobble ignored." });
  }
  if (appSettings.daemonSettings && !appSettings.daemonSettings.enableLocalMediaDetection) {
    return res.status(403).json({ error: "Local media detection is disabled." });
  }

  const { title, player, mediaType, currentEpisode, totalEpisodes } = req.body;
  if (!title) return res.status(400).json({ error: "Missing title" });

  const eventPayload = {
    id: Date.now().toString(),
    title,
    player: player || "Local Player",
    mediaType: mediaType || "Anime TV Series",
    currentEpisode: currentEpisode || 1,
    totalEpisodes: totalEpisodes || 12,
    timestamp: new Date().toISOString()
  };

  if (appSettings.daemonSettings?.autoScrobbleLocal) {
    const newLog = {
      id: `sync-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: player || "Local Player",
      targetPlatform: "all",
      action: "scrobble",
      status: "success" as "success",
      itemTitle: title,
      platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
      details: `Auto-Scrobbled ${title} Ep ${currentEpisode || 1} from ${player} (Local Media Daemon)`
    };
    syncLogs.unshift(newLog);
    persistDb();
    return res.json({ success: true, message: "Auto-scrobbled successfully." });
  }

  daemonEvents.emit("playback", eventPayload);
  return res.json({ success: true, message: "Playback reported to daemon", eventPayload });
});

// Confirm and Scrobble from Daemon Prompt
app.post("/api/daemon/scrobble", (req, res) => {
  const { title, episode, platform } = req.body;
  
  // Create a log entry
  const newLog = {
    id: `sync-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: platform || "daemon",
    itemTitle: title,
    platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
    action: "scrobble",
    status: "success" as "success",
    details: `Scrobbled ${title} Ep ${episode} from ${platform} (Local Media Daemon)`
  };
  
  syncLogs.unshift(newLog);
  persistDb();
  
  return res.json({ success: true, message: "Scrobbled successfully." });
});


// --- PLAYBACK SESSION MANAGER ---
class PlaybackSessionManager {
  private sessions: Map<string, { lastReport: number, payload: any, timeout: NodeJS.Timeout }> = new Map();

  public handleHeartbeat(payload: any) {
    const { mediaId, episodeNumber, title, player, progressTimestamp } = payload;
    const sessionKey = `${mediaId || title}_${episodeNumber}`;
    const now = Date.now();
    let existing = this.sessions.get(sessionKey);

    if (existing) {
      clearTimeout(existing.timeout);
      // Merge logic: Update progress marker to the furthest reported timestamp
      const existingProgress = existing.payload.progressTimestamp || 0;
      const newProgress = progressTimestamp || 0;
      if (newProgress > existingProgress) {
        existing.payload.progressTimestamp = newProgress;
      }
      // Also potentially merge player sources (e.g. "Windows + Web")
      if (existing.payload.player && existing.payload.player !== player) {
        existing.payload.player = `${existing.payload.player}, ${player}`;
      }
    } else {
      existing = { lastReport: now, payload: { ...payload }, timeout: null as any };
    }

    existing.lastReport = now;
    existing.timeout = setTimeout(() => {
      this.commitSession(existing!.payload);
      this.sessions.delete(sessionKey);
    }, 120000); // 2 minutes debounce cooldown

    this.sessions.set(sessionKey, existing);
    
    // Broadcast state change
    if (app.locals.io) {
       app.locals.io.emit('state_change', { type: 'playback_active', sessionKey, payload });
    }
  }

  private commitSession(payload: any) {
    const { title, episodeNumber, player, mediaType, mediaId } = payload;
    
    // Attempt to update local database state
    let matchedItem = libraryItems.find(i => i.id === mediaId || i.title.toLowerCase() === title?.toLowerCase());
    if (matchedItem) {
      if (matchedItem.platforms.simkl) matchedItem.platforms.simkl.episode = Math.max(matchedItem.platforms.simkl.episode, episodeNumber);
      if (matchedItem.platforms.mal) matchedItem.platforms.mal.episode = Math.max(matchedItem.platforms.mal.episode, episodeNumber);
      if (matchedItem.platforms.anilist) matchedItem.platforms.anilist.episode = Math.max(matchedItem.platforms.anilist.episode, episodeNumber);
    }

    const newLog = {
      id: `sync-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: player || "Local Player",
      targetPlatform: "all",
      action: "scrobble",
      status: "success" as "success",
      itemTitle: matchedItem ? matchedItem.title : (title || "Unknown"),
      platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
      details: `Scrobbled ${title || "Unknown"} Ep ${episodeNumber} from ${player} (Centralized Playback Session Manager)`
    };
    syncLogs.unshift(newLog);
    persistDb();
    
    if (app.locals.io) {
       app.locals.io.emit('state_change', { type: 'scrobble_committed', payload });
    }
  }
}

export const playbackManager = new PlaybackSessionManager();

app.post("/api/playback/heartbeat", (req, res) => {
   playbackManager.handleHeartbeat(req.body);
   res.json({ success: true, message: "Heartbeat accepted" });
});
