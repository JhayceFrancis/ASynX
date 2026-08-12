import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
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
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// Initial Settings
let appSettings: AppSettings = {
  simkl: {
    clientId: "simkl_client_8943a12",
    accessToken: "simkl_oauth_token_active",
    connected: true,
    username: "OtakuWatcher99"
  },
  mal: {
    clientId: "mal_client_991823",
    accessToken: "mal_bearer_token_active",
    connected: true,
    username: "AnimeCollector"
  },
  anilist: {
    accessToken: "anilist_bearer_token_active",
    connected: true,
    username: "AniTrackPro"
  },
  plex: {
    serverUrl: "http://192.168.1.100:32400",
    token: "plex_x_token_hidden",
    connected: true,
    serverName: "HomeMediaServer-Plex",
    webhookUrl: "https://your-app-url/api/webhooks/plex",
    autoScrobbleThreshold: 80
  },
  tautulli: {
    webhookUrl: "https://your-app-url/api/webhooks/tautulli",
    secretKey: "tautulli_sec_99812",
    connected: true
  },
  syncRules: {
    autoSyncIntervalMinutes: 15,
    conflictPolicy: "ask_user",
    defaultSourceOfTruth: "anilist",
    autoResolveWithAI: true,
    syncDramasFromSimklToMAL: false
  }
};

// Initial Library Seed Data (Anime & Dramas)
let libraryItems: LibraryItem[] = [
  {
    id: "item-1",
    title: "Solo Leveling Season 2: Arise from the Shadow",
    japaneseTitle: "Ore dake Level Up na Ken Season 2",
    mediaType: "anime",
    coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80",
    totalEpisodes: 13,
    year: 2025,
    genres: ["Action", "Fantasy", "Supernatural"],
    platforms: {
      simkl: {
        id: "simkl-491201",
        title: "Solo Leveling S2",
        status: "watching",
        episode: 9,
        score: 9,
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        synced: false
      },
      mal: {
        id: "mal-58514",
        title: "Solo Leveling Season 2",
        status: "watching",
        episode: 8,
        score: 8,
        updatedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
        synced: false
      },
      anilist: {
        id: "anilist-178021",
        title: "Solo Leveling Season 2",
        status: "watching",
        episode: 10,
        score: 9,
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        synced: true
      }
    },
    plexMatch: {
      ratingKey: "plex-10923",
      filename: "[SubsPlease] Solo Leveling S2 - 10 (1080p) [2A19F8].mkv",
      matchScore: 98,
      lastScrobbledAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    hasConflict: true,
    conflictDetails: {
      type: "episode_mismatch",
      summary: "Episode count desync across platforms: AniList is at Ep 10, Simkl is at Ep 9, MAL is trailing at Ep 8.",
      differences: [
        { platform: "anilist", status: "watching", episode: 10, updatedAt: new Date(Date.now() - 3600000 * 2).toISOString() },
        { platform: "simkl", status: "watching", episode: 9, updatedAt: new Date(Date.now() - 3600000 * 4).toISOString() },
        { platform: "mal", status: "watching", episode: 8, updatedAt: new Date(Date.now() - 3600000 * 28).toISOString() }
      ]
    }
  },
  {
    id: "item-2",
    title: "Frieren: Beyond Journey's End",
    japaneseTitle: "Sousou no Frieren",
    mediaType: "anime",
    coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80",
    totalEpisodes: 28,
    year: 2024,
    genres: ["Adventure", "Drama", "Fantasy"],
    platforms: {
      simkl: {
        id: "simkl-39102",
        title: "Frieren",
        status: "completed",
        episode: 28,
        score: 10,
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        synced: true
      },
      mal: {
        id: "mal-52991",
        title: "Sousou no Frieren",
        status: "completed",
        episode: 28,
        score: 10,
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        synced: true
      },
      anilist: {
        id: "anilist-154587",
        title: "Frieren: Beyond Journey's End",
        status: "completed",
        episode: 28,
        score: 10,
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        synced: true
      }
    },
    plexMatch: {
      ratingKey: "plex-8812",
      filename: "Frieren - S01E28 - The Era of Humans.mkv",
      matchScore: 100,
      lastScrobbledAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    hasConflict: false
  },
  {
    id: "item-3",
    title: "Alice in Borderland Season 3",
    japaneseTitle: "Imawa no Kuni no Arisu S3",
    mediaType: "drama",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80",
    totalEpisodes: 8,
    year: 2025,
    genres: ["Action", "Mystery", "Drama", "Thriller"],
    platforms: {
      simkl: {
        id: "simkl-drama-8819",
        title: "Alice in Borderland (TV Series)",
        status: "watching",
        episode: 4,
        score: 9,
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        synced: false
      },
      mal: {
        id: "mal-none",
        title: "N/A (Live-Action Drama)",
        status: "plan_to_watch",
        episode: 0,
        score: 0,
        updatedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        synced: false
      },
      anilist: {
        id: "anilist-120912",
        title: "Alice in Borderland (Live Action)",
        status: "watching",
        episode: 3,
        score: 8,
        updatedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
        synced: false
      }
    },
    plexMatch: {
      ratingKey: "plex-14902",
      filename: "Alice in Borderland - S03E04 - Joker Card.mp4",
      matchScore: 95,
      lastScrobbledAt: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    hasConflict: true,
    conflictDetails: {
      type: "status_mismatch",
      summary: "Simkl shows Episode 4 watched via Netflix extension, whereas AniList is lagging at Ep 3.",
      differences: [
        { platform: "simkl", status: "watching", episode: 4, updatedAt: new Date(Date.now() - 3600000 * 12).toISOString() },
        { platform: "anilist", status: "watching", episode: 3, updatedAt: new Date(Date.now() - 3600000 * 36).toISOString() }
      ]
    }
  },
  {
    id: "item-4",
    title: "Jujutsu Kaisen Season 3: Culling Game",
    japaneseTitle: "Jujutsu Kaisen Shimetsu Chikan",
    mediaType: "anime",
    coverImage: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&q=80",
    totalEpisodes: 24,
    year: 2025,
    genres: ["Action", "Fantasy", "Supernatural"],
    platforms: {
      simkl: {
        id: "simkl-51200",
        title: "Jujutsu Kaisen Season 3",
        status: "plan_to_watch",
        episode: 0,
        score: 0,
        updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        synced: true
      },
      mal: {
        id: "mal-56894",
        title: "Jujutsu Kaisen: Shimetsu Chikan",
        status: "plan_to_watch",
        episode: 0,
        score: 0,
        updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        synced: true
      },
      anilist: {
        id: "anilist-171018",
        title: "Jujutsu Kaisen Season 3",
        status: "plan_to_watch",
        episode: 0,
        score: 0,
        updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        synced: true
      }
    },
    hasConflict: false
  },
  {
    id: "item-5",
    title: "Demon Slayer: Kimetsu no Yaiba Infinity Castle",
    japaneseTitle: "Kimetsu no Yaiba: Mugen Jouchou-hen",
    mediaType: "anime",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80",
    totalEpisodes: 12,
    year: 2025,
    genres: ["Action", "Demon", "Historical"],
    platforms: {
      simkl: {
        id: "simkl-99012",
        title: "Demon Slayer Infinity Castle",
        status: "watching",
        episode: 5,
        score: 9,
        updatedAt: new Date(Date.now() - 3600000 * 15).toISOString(),
        synced: false
      },
      mal: {
        id: "mal-59011",
        title: "Kimetsu no Yaiba: Mugen Jouchou-hen",
        status: "watching",
        episode: 6,
        score: 9,
        updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        synced: true
      },
      anilist: {
        id: "anilist-180120",
        title: "Demon Slayer: Kimetsu no Yaiba Infinity Castle Arc",
        status: "watching",
        episode: 6,
        score: 9,
        updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        synced: true
      }
    },
    plexMatch: {
      ratingKey: "plex-19203",
      filename: "[Erai-raws] Kimetsu no Yaiba Infinity Castle - 06 [1080p].mkv",
      matchScore: 99,
      lastScrobbledAt: new Date(Date.now() - 3600000 * 1).toISOString()
    },
    hasConflict: true,
    conflictDetails: {
      type: "episode_mismatch",
      summary: "Plex scrobbled Ep 6 to MAL and AniList, but Simkl update failed due to temporary API rate limit.",
      differences: [
        { platform: "mal", status: "watching", episode: 6, updatedAt: new Date(Date.now() - 3600000 * 1).toISOString() },
        { platform: "anilist", status: "watching", episode: 6, updatedAt: new Date(Date.now() - 3600000 * 1).toISOString() },
        { platform: "simkl", status: "watching", episode: 5, updatedAt: new Date(Date.now() - 3600000 * 15).toISOString() }
      ]
    }
  }
];

// Initial Logs
let syncLogs: SyncLog[] = [
  {
    id: "slog-1",
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    source: "plex_webhook",
    itemTitle: "Demon Slayer: Kimetsu no Yaiba Infinity Castle",
    action: "Plex Scrobble (Ep 6 @ 92% watched)",
    platformsAffected: ["mal", "anilist"],
    status: "success",
    details: "Updated MAL & AniList progress to Episode 6. Simkl failed due to temporary 429 response."
  },
  {
    id: "slog-2",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    source: "extension_autoscrobble",
    itemTitle: "Solo Leveling Season 2: Arise from the Shadow",
    action: "Crunchyroll Extension Scrobble (Ep 10)",
    platformsAffected: ["anilist"],
    status: "conflict",
    details: "AniList set to Ep 10. Flagged desync conflict with Simkl (Ep 9) and MAL (Ep 8)."
  },
  {
    id: "slog-3",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    source: "tautulli_webhook",
    itemTitle: "Alice in Borderland Season 3",
    action: "Tautulli Scrobble Trigger (S03E04)",
    platformsAffected: ["simkl"],
    status: "success",
    details: "Updated Simkl Drama history to Episode 4."
  }
];

let webhookLogs: WebhookLog[] = [
  {
    id: "wlog-1",
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    source: "plex",
    event: "media.scrobble",
    mediaTitle: "Episode 6 - Akaza's Resurgence",
    grandparentTitle: "Demon Slayer: Kimetsu no Yaiba",
    parentIndex: 5,
    index: 6,
    user: "OtakuWatcher99",
    player: "NVIDIA SHIELD Android TV",
    progressPercent: 94,
    matchedItemId: "item-5",
    rawPayload: {
      event: "media.scrobble",
      Account: { title: "OtakuWatcher99" },
      Player: { title: "NVIDIA SHIELD Android TV" },
      Metadata: {
        type: "episode",
        title: "Episode 6 - Akaza's Resurgence",
        grandparentTitle: "Demon Slayer: Kimetsu no Yaiba",
        parentIndex: 5,
        index: 6
      }
    }
  },
  {
    id: "wlog-2",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    source: "tautulli",
    event: "watched",
    mediaTitle: "Joker Card",
    grandparentTitle: "Alice in Borderland",
    parentIndex: 3,
    index: 4,
    user: "HomeUser",
    player: "Apple TV 4K",
    progressPercent: 100,
    matchedItemId: "item-3",
    rawPayload: {
      action: "watched",
      show_name: "Alice in Borderland",
      season_num: 3,
      episode_num: 4,
      user: "HomeUser"
    }
  }
];

let extensionState: BrowserExtensionState = {
  installed: true,
  activeSite: "Crunchyroll",
  currentMedia: {
    title: "Solo Leveling Season 2: Arise from the Shadow",
    season: 2,
    episode: 10,
    currentTime: 1210,
    duration: 1420,
    progressPercent: 85,
    isPlaying: true,
    detectedAnimeId: "item-1"
  },
  autoScrobbleEnabled: true,
  overlayVisible: true,
  badgeCount: 3
};

// --- API ENDPOINTS ---

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
app.post("/api/settings", (req, res) => {
  appSettings = { ...appSettings, ...req.body };
  res.json({ success: true, settings: appSettings });
});

// Get Sync Metrics & Status
app.get("/api/sync/status", (req, res) => {
  const conflictsCount = libraryItems.filter(i => i.hasConflict).length;
  const syncedCount = libraryItems.filter(i => !i.hasConflict).length;
  const totalItems = libraryItems.length;

  res.json({
    platforms: {
      simkl: { connected: appSettings.simkl.connected, username: appSettings.simkl.username, status: "operational" },
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
    items = items.filter(i => i.mediaType === "anime");
  } else if (filter === "drama") {
    items = items.filter(i => i.mediaType === "drama");
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
    platformsAffected: ["simkl", "mal", "anilist"],
    status: "success",
    details: `Synchronized ${affected.length} items across connected Simkl, MAL, and AniList accounts.`
  };

  syncLogs.unshift(newLog);

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
    platformsAffected: ["simkl", "mal", "anilist"],
    status: "success",
    details: `Successfully triggered cross-platform sync for "${item.title}".`
  };

  syncLogs.unshift(newLog);
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
    status: "success",
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

    (['simkl', 'mal', 'anilist'] as PlatformType[]).forEach(p => {
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
    platformsAffected: ["simkl", "mal", "anilist"],
    status: "success",
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

  (['simkl', 'mal', 'anilist'] as PlatformType[]).forEach(p => {
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
    platformsAffected: ["simkl", "mal", "anilist"],
    status: "success",
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

    points.push({
      date: dateStr,
      label: monthDay,
      totalSyncs,
      successfulSyncs,
      conflicts,
      successRate
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
      parsedTitle: filename.replace(/\[.*?\]/g, '').replace(/\.mkv|\.mp4/g, '').trim(),
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
    platformsAffected: ["simkl", "mal", "anilist"],
    status: "success",
    details: `Ingested Plex webhook for ${user} playing on ${player}. Updated Simkl, MAL & AniList.`
  };

  syncLogs.unshift(syncLog);

  res.status(200).json({ status: "success", matchedItemId: matchedItem?.id, message: "Plex webhook processed." });
});

// Webhook Handler for Tautulli
app.post("/api/webhooks/tautulli", (req, res) => {
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
    platformsAffected: ["simkl", "mal", "anilist"],
    status: "success",
    details: `Tautulli trigger processed for ${showName} Ep ${episode}.`
  });

  res.json({ success: true, message: "Tautulli webhook received." });
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
      platformsAffected: ["simkl", "mal", "anilist"],
      status: "success",
      details: `Browser Plugin auto-detected stream on ${site || 'Crunchyroll'} and updated Simkl, MAL, and AniList to Episode ${epNum}.`
    });
  } else if (action === "toggle_overlay") {
    extensionState.overlayVisible = !extensionState.overlayVisible;
  }

  res.json({ success: true, extensionState, logs: syncLogs.slice(0, 10) });
});

// Start Server Function
async function startServer() {
  // Vite dev middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AniSync Matrix Server running on http://localhost:${PORT}`);
  });
}

startServer();
