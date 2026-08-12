export type PlatformType = 'simkl' | 'mal' | 'anilist';

export type WatchStatus = 'watching' | 'completed' | 'plan_to_watch' | 'paused' | 'dropped';

export interface PlatformProgress {
  id: string;
  title?: string;
  status: WatchStatus;
  episode: number;
  score: number; // 0-10 or 0-100
  updatedAt: string;
  synced: boolean;
}

export interface LibraryItem {
  id: string;
  title: string;
  japaneseTitle?: string;
  mediaType: 'anime' | 'drama' | 'show';
  coverImage: string;
  totalEpisodes: number;
  year: number;
  genres: string[];
  platforms: {
    simkl?: PlatformProgress;
    mal?: PlatformProgress;
    anilist?: PlatformProgress;
  };
  plexMatch?: {
    ratingKey: string;
    filename: string;
    matchScore: number;
    lastScrobbledAt?: string;
  };
  hasConflict: boolean;
  conflictDetails?: {
    type: 'episode_mismatch' | 'status_mismatch' | 'score_mismatch' | 'desync';
    summary: string;
    differences: Array<{
      platform: PlatformType;
      status: WatchStatus;
      episode: number;
      updatedAt: string;
    }>;
  };
}

export interface SyncLog {
  id: string;
  timestamp: string;
  source: string;
  itemTitle: string;
  action: string;
  platformsAffected: PlatformType[];
  status: 'success' | 'conflict' | 'warning' | 'failed';
  details: string;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  source: 'plex' | 'tautulli';
  event: 'media.play' | 'media.pause' | 'media.scrobble' | 'media.stop' | 'watched';
  mediaTitle: string;
  grandparentTitle?: string; // Anime / Series title
  parentIndex?: number; // Season
  index?: number; // Episode
  user: string;
  player: string;
  progressPercent: number;
  matchedItemId?: string;
  rawPayload: Record<string, any>;
}

export interface BrowserExtensionState {
  installed: boolean;
  activeSite?: 'Crunchyroll' | 'Netflix' | 'HiDive' | 'Hulu' | 'Aniwave' | 'Local Player';
  currentMedia?: {
    title: string;
    season: number;
    episode: number;
    currentTime: number;
    duration: number;
    progressPercent: number;
    isPlaying: boolean;
    detectedAnimeId?: string;
  };
  autoScrobbleEnabled: boolean;
  overlayVisible: boolean;
  badgeCount: number;
}

export interface AppSettings {
  simkl: {
    clientId: string;
    accessToken: string;
    connected: boolean;
    username: string;
  };
  mal: {
    clientId: string;
    accessToken: string;
    connected: boolean;
    username: string;
  };
  anilist: {
    accessToken: string;
    connected: boolean;
    username: string;
  };
  plex: {
    serverUrl: string;
    token: string;
    connected: boolean;
    serverName: string;
    webhookUrl: string;
    autoScrobbleThreshold: number; // e.g. 80%
  };
  tautulli: {
    webhookUrl: string;
    secretKey: string;
    connected: boolean;
  };
  remoteSync?: {
    enabled: boolean;
    serverUrl: string;
    apiKey: string;
    lastSync?: string;
  };
  daemonSettings?: {
    runOnStartup: boolean;
    enableLocalMediaDetection: boolean;
    autoScrobbleLocal: boolean; // if true, don't prompt, just scrobble
  };
  maintenanceMode?: boolean;
  automatedBackups?: {
    enabled: boolean;
    provider: 'github_gist' | 'github_repo' | 'gdrive' | 'onedrive';
    frequency: 'daily' | 'weekly' | 'monthly';
    token: string;
    targetId: string;
    lastBackup?: string;
  };
  syncRules: {
    autoSyncIntervalMinutes: number;
    conflictPolicy: 'ask_user' | 'source_of_truth' | 'highest_episode';
    defaultSourceOfTruth: PlatformType;
    autoResolveWithAI: boolean;
    syncDramasFromSimklToMAL: boolean; // Note: MAL handles anime; Simkl handles anime + drama
  };
}

export interface AIConflictAnalysis {
  recommendation: {
    sourceOfTruth: PlatformType;
    targetEpisode: number;
    targetStatus: WatchStatus;
    reasoning: string;
  };
  platformDiffSummary: string;
  suggestedActionPlan: string[];
}

export interface SyncAnalyticsPoint {
  date: string;
  label: string;
  totalSyncs: number;
  successfulSyncs: number;
  conflicts: number;
  successRate: number; // percentage e.g. 95
}

export interface HealthCheckService {
  name: string;
  endpoint: string;
  status: 'online' | 'offline' | 'checking';
  latencyMs: number;
  lastChecked: string;
  details: string;
}

export interface HealthCheckStatus {
  plex: HealthCheckService;
  tautulli: HealthCheckService;
  lastOverallPing: string;
}

