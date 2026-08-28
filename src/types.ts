
export interface PanelConfig {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  bgColor?: string;
  isStatic?: boolean;

  bgGradient?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: string;
  fontStyle?: string;
  customSize?: 'landscape' | 'portrait' | 'square' | 'wide' | 'tall' | 'custom';
}

export type TabLayouts = Record<string, PanelConfig[]>;

export type PlatformType = 'simkl' | 'mal' | 'anilist' | 'karakeep';

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
  mediaType: 'Anime TV Series' | 'Anime Film' | 'Film' | 'TV Series' | 'Anime Special' | 'Drama';
  coverImage: string;
  totalEpisodes: number;
  episodes?: number;
  year: number;
  genres: string[];
  platforms: {
    simkl?: PlatformProgress;
    mal?: PlatformProgress;
    anilist?: PlatformProgress;
    karakeep?: PlatformProgress;
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
  itemId?: string;
  timestamp: string;
  source: string;
  itemTitle: string;
  action: string;
  platformsAffected: PlatformType[];
  status: 'success' | 'conflict' | 'warning' | 'failed';
  message?: string;
  details: string;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  source: 'plex' | 'tautulli' | 'jellyfin' | 'emby' | 'karakeep';
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
  activeSite?: 'Crunchyroll' | 'Netflix' | 'HiDive' | 'Hulu' | 'Aniwave' | 'Local Player' | 'MPC-BE' | 'VLC' | 'Plex Desktop' | 'Netflix Desktop' | 'Stremio Desktop' | 'Plex Web' | 'Stremio Web';
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
  extensionEnabled?: boolean;
  pushNotifications?: {
    enabled: boolean;
    browserNotifications: boolean;
    discordWebhookUrl: string;
    appriseUrl: string;
    pushbulletToken: string;
    triggers: {
      onSyncSuccess: boolean;
      onSyncFailure: boolean;
      onConflict: boolean;
    };
  };
  dashboardLayout?: PanelConfig[];
  nexusTabName?: string;
  theme?: {
    accentColor?: string;
    isGradient?: boolean;
    gradientStart?: string;
    gradientEnd?: string;
    headerColor?: string;
    headerIsGradient?: boolean;
    headerGradientColors?: string[];
    headerGradientDirection?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    iconColor?: string;
    paddingSize?: string;
    gradientColors?: string[];
    gradientDirection?: string;
    appBackgroundGradient?: string;
    subheaderColor?: string;
    subheadingText?: string;
    borderRadius?: string;
    fontFamily?: string;
    layoutDensity?: 'compact' | 'comfortable' | 'spacious';
    cardStyle?: 'flat' | 'glass' | 'neumorphic' | 'outlined';
    animationSpeed?: 'fast' | 'normal' | 'slow' | 'none';
    defaultViewMode?: 'grid' | 'list' | 'block';
    navbarStyle?: 'solid' | 'transparent' | 'frosted';
    logoGradientStart?: string;
    logoGradientEnd?: string;
  };
  simkl: {
    clientId: string;
    accessToken: string;
    connected: boolean;
    username?: string;
  };
  mal: {
    clientId: string;
    accessToken: string;
    connected: boolean;
    username: string;
  };
  anilist: {
    clientId?: string;
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
  jellyfin: {
    serverUrl: string;
    apiKey: string;
    connected: boolean;
    serverName: string;
    webhookUrl: string;
    autoScrobbleThreshold: number;
  };
  emby: {
    serverUrl: string;
    apiKey: string;
    connected: boolean;
    serverName: string;
    webhookUrl: string;
    autoScrobbleThreshold: number;
  };
  karakeep: {
    apiUrl: string;
    apiKey: string;
    webhookUrl: string;
    connected: boolean;
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
  databaseManagement?: {
    autoPurgeSyncLogs: boolean;
    autoPurgeDays: number;
  };
  maintenanceMode?: boolean;
  automatedBackups?: {
    enabled: boolean;
    provider: 'github_gist' | 'github_repo' | 'gdrive' | 'onedrive';
    frequency: 'daily' | 'weekly' | 'monthly';
    token: string;
    targetId: string;
    encryptionKey?: string;
    lastBackup?: string;
  };
  keyboardShortcuts?: {
    enabled: boolean;
  };
  customLayouts?: TabLayouts;
  syncRules: {
    presetProfile?: 'aggressive' | 'manual' | 'hybrid' | 'custom';
    autoSyncIntervalMinutes: number;
    syncScheduleMode?: 'interval' | 'specific_time';
    syncSpecificTime?: string;
    conflictPolicy: 'ask_user' | 'source_of_truth' | 'highest_episode';
    defaultSourceOfTruth: PlatformType;
    platformPriority?: PlatformType[];
    autoResolveWithAI: boolean;
    syncDramasFromSimklToMAL: boolean;
    scheduledRules?: Array<{
      id: string;
      source: string;
      target: string;
      time: string;
      enabled: boolean;
    }>;
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
  successRate: number;
  avgLatencyMs: number;
  mediaViewingFrequency?: number;
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
  jellyfin: HealthCheckService;
  emby: HealthCheckService;
  karakeep: HealthCheckService;
  lastOverallPing: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
