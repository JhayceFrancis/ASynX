import React, { useState, useEffect } from 'react';
import { WebhookLog, AppSettings, LibraryItem, HealthCheckStatus } from '../types';
import { 
  Tv, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  Zap, 
  FileText, 
  Search, 
  Sparkles, 
  Radio,
  ArrowRight,
  Code,
  Activity,
  AlertOctagon,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  Server
} from 'lucide-react';

interface PlexWebhookViewProps {
  settings: AppSettings;
  webhookLogs: WebhookLog[];
  libraryItems: LibraryItem[];
  onTriggerSimulatedWebhook: (payload: any, source: string) => void;
}

export const PlexWebhookView: React.FC<PlexWebhookViewProps> = ({
  settings,
  webhookLogs,
  libraryItems,
  onTriggerSimulatedWebhook
}) => {
  const [copiedPlex, setCopiedPlex] = useState(false);
  const [copiedTautulli, setCopiedTautulli] = useState(false);
  const [copiedJellyfin, setCopiedJellyfin] = useState(false);
  const [copiedEmby, setCopiedEmby] = useState(false);

  // Automated Health Checker state
  const [healthData, setHealthData] = useState<HealthCheckStatus | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  // Test Payload Generator State
  const [selectedItemTitle, setSelectedItemTitle] = useState(libraryItems[0]?.title || 'Solo Leveling Season 2');
  const [testSeason, setTestSeason] = useState<number>(2);
  const [testEpisode, setTestEpisode] = useState<number>(10);
  const [testUser, setTestUser] = useState<string>('OtakuWatcher99');
  const [testDevice, setTestDevice] = useState<string>('NVIDIA SHIELD TV');
  const [testSource, setTestSource] = useState<'plex' | 'tautulli' | 'jellyfin' | 'emby'>('plex');

  // AI Filename Matcher state
  const [customFilename, setCustomFilename] = useState('[SubsPlease] Solo Leveling S2 - 11 (1080p) [9A1B2C].mkv');
  const [matchResult, setMatchResult] = useState<any>(null);
  const [isMatching, setIsMatching] = useState(false);

  const plexUrl = window.location.origin + '/api/webhooks/plex';
  const tautulliUrl = window.location.origin + '/api/webhooks/tautulli';
  const jellyfinUrl = window.location.origin + '/api/webhooks/jellyfin';
  const embyUrl = window.location.origin + '/api/webhooks/emby';

  // Fetch initial health check
  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/webhooks/health');
      if (res.ok) {
        setHealthData(await res.json());
      }
    } catch (e) {
      console.error('Failed fetching health check:', e);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  // Run ping health check
  const handlePingWebhooks = async (service?: 'plex' | 'tautulli' | 'jellyfin' | 'emby') => {
    setIsPinging(true);
    try {
      const res = await fetch('/api/webhooks/health/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service })
      });
      if (res.ok) {
        setHealthData(await res.json());
      }
    } catch (e) {
      console.error('Error pinging webhook endpoints:', e);
    } finally {
      setIsPinging(false);
    }
  };

  const handleCopy = (text: string, type: 'plex' | 'tautulli' | 'jellyfin' | 'emby') => {
    navigator.clipboard.writeText(text).catch(err => console.error("Clipboard error:", err));
    if (type === 'plex') {
      setCopiedPlex(true);
      setTimeout(() => setCopiedPlex(false), 2000);
    } else if (type === 'tautulli') {
      setCopiedTautulli(true);
      setTimeout(() => setCopiedTautulli(false), 2000);
    } else if (type === 'jellyfin') {
      setCopiedJellyfin(true);
      setTimeout(() => setCopiedJellyfin(false), 2000);
    } else if (type === 'emby') {
      setCopiedEmby(true);
      setTimeout(() => setCopiedEmby(false), 2000);
    }
  };

  const handleSendTestWebhook = () => {
    if (testSource === 'plex') {
      const payload = {
        event: 'media.scrobble',
        Account: { title: testUser },
        Player: { title: testDevice },
        Metadata: {
          type: 'episode',
          title: `Episode ${testEpisode}`,
          grandparentTitle: selectedItemTitle,
          parentIndex: testSeason,
          index: testEpisode
        }
      };
      onTriggerSimulatedWebhook(payload, 'plex');
    } else if (testSource === 'tautulli') {
      const payload = {
        action: 'watched',
        show_name: selectedItemTitle,
        season_num: testSeason,
        episode_num: testEpisode,
        user: testUser,
        player: testDevice
      };
      onTriggerSimulatedWebhook(payload, 'tautulli');
    } else if (testSource === 'jellyfin') {
      const payload = {
        NotificationType: "PlaybackStop",
        SeriesName: selectedItemTitle,
        SeasonNumber: testSeason,
        EpisodeNumber: testEpisode,
        UserId: testUser,
        Client: testDevice
      };
      onTriggerSimulatedWebhook(payload, 'jellyfin');
    } else if (testSource === 'emby') {
      const payload = {
        Event: "playback.stop",
        Item: {
          SeriesName: selectedItemTitle,
          ParentIndexNumber: testSeason,
          IndexNumber: testEpisode
        },
        User: { Name: testUser },
        Session: { Client: testDevice }
      };
      onTriggerSimulatedWebhook(payload, 'emby');
    }
  };

  const handleRunAiMatch = async () => {
    setIsMatching(true);
    try {
      const res = await fetch('/api/plex/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: customFilename })
      });
      const data = await res.json();
      setMatchResult(data);
    } catch (err) {
      console.error('Failed to run AI match:', err);
    } finally {
      setIsMatching(false);
    }
  };

  const plexStatus = healthData?.plex.status || 'online';
  const tautulliStatus = healthData?.tautulli.status || 'online';
  const jellyfinStatus = healthData?.jellyfin?.status || 'offline';
  const embyStatus = healthData?.emby?.status || 'offline';
  const hasOffline = plexStatus === 'offline' || tautulliStatus === 'offline' || jellyfinStatus === 'offline' || embyStatus === 'offline';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Tv className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Plex Media Server & Tautulli Automation Suite</h2>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            Real-time webhook listener scrobbles watched progress directly to Simkl, MyAnimeList, and AniList.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full border font-semibold text-xs flex items-center space-x-1.5 ${
            hasOffline
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${hasOffline ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
            <span>{hasOffline ? 'Integration Alert (Offline)' : 'Webhook Listener Ready'}</span>
          </span>
        </div>
      </div>

      {/* AUTOMATED HEALTH CHECKER CARD */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-neutral-900 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Automated Webhook Health & Connection Status</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Pings configured webhooks and monitors active integration drops in real-time</p>
            </div>
          </div>

          <button
            onClick={() => handlePingWebhooks()}
            disabled={isPinging}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'Testing Ping...' : 'Ping All Endpoints'}</span>
          </button>
        </div>

        {/* Offline Alert Notification Banner if dropped */}
        {hasOffline && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl flex items-center justify-between text-xs text-rose-200">
            <div className="flex items-center space-x-2.5">
              <AlertOctagon className="w-5 h-5 text-rose-400 flex-shrink-0 animate-bounce" />
              <div>
                <p className="font-bold">Integration Connection Drop Alert!</p>
                <p className="text-[11px] text-rose-300/80">
                  One or more webhook integrations (Plex or Tautulli) appear unreachable. Check your server IP, secret tokens, or local network router.
                </p>
              </div>
            </div>
            <button
              onClick={() => handlePingWebhooks()}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex-shrink-0"
            >
              Re-Ping
            </button>
          </div>
        )}

        {/* Connection Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Plex Health Card */}
          <div className={`p-4 rounded-2xl border transition ${
            plexStatus === 'online' 
              ? 'bg-gray-50 dark:bg-black/80 border-gray-200 dark:border-neutral-900' 
              : 'bg-rose-950/20 border-rose-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">Plex Media Server</span>
              </div>

              {/* Connection Status Indicator */}
              <div className="flex items-center space-x-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1 ${
                  plexStatus === 'online'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {plexStatus === 'online' ? (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-400" />
                      <span>Online ({healthData?.plex.latencyMs || 22}ms)</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-rose-400" />
                      <span>Offline</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-1 font-mono">
              Endpoint: {healthData?.plex.endpoint || 'http://192.168.1.100:32400'}
            </p>
            <p className="text-[11px] text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
              {healthData?.plex.details || 'Responding OK.'}
            </p>

            <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-500">
              <span>Last Checked: {healthData?.plex.lastChecked ? new Date(healthData.plex.lastChecked).toLocaleTimeString() : 'Just now'}</span>
              <button
                onClick={() => handlePingWebhooks('plex')}
                className="text-indigo-400 hover:underline font-semibold cursor-pointer"
              >
                Ping Plex
              </button>
            </div>
          </div>

          {/* Tautulli Health Card */}
          <div className={`p-4 rounded-2xl border transition ${
            tautulliStatus === 'online' 
              ? 'bg-gray-50 dark:bg-black/80 border-gray-200 dark:border-neutral-900' 
              : 'bg-rose-950/20 border-rose-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">Tautulli Integration</span>
              </div>

              {/* Connection Status Indicator */}
              <div className="flex items-center space-x-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1 ${
                  tautulliStatus === 'online'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {tautulliStatus === 'online' ? (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-400" />
                      <span>Online ({healthData?.tautulli.latencyMs || 34}ms)</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-rose-400" />
                      <span>Offline</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-1 font-mono">
              Endpoint: {healthData?.tautulli.endpoint || 'http://192.168.1.100:8181'}
            </p>
            <p className="text-[11px] text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
              {healthData?.tautulli.details || 'Tautulli notification listener active.'}
            </p>

            <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-500">
              <span>Last Checked: {healthData?.tautulli.lastChecked ? new Date(healthData.tautulli.lastChecked).toLocaleTimeString() : 'Just now'}</span>
              <button
                onClick={() => handlePingWebhooks('tautulli')}
                className="text-indigo-400 hover:underline font-semibold cursor-pointer"
              >
                Ping Tautulli
              </button>
            </div>
          </div>

          {/* Jellyfin Health Card */}
          <div className={`p-4 rounded-2xl border transition ${
            jellyfinStatus === 'online' 
              ? 'bg-gray-50 dark:bg-black/80 border-gray-200 dark:border-neutral-900' 
              : 'bg-rose-950/20 border-rose-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">Jellyfin Server</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1 ${
                  jellyfinStatus === 'online'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {jellyfinStatus === 'online' ? (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-400" />
                      <span>Online ({healthData?.jellyfin?.latencyMs || 18}ms)</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-rose-400" />
                      <span>Offline</span>
                    </>
                  )}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-1 font-mono">
              Endpoint: {healthData?.jellyfin?.endpoint || 'http://192.168.1.101:8096'}
            </p>
            <p className="text-[11px] text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
              {healthData?.jellyfin?.details || 'Responding OK.'}
            </p>
            <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-500">
              <span>Last Checked: {healthData?.jellyfin?.lastChecked ? new Date(healthData.jellyfin.lastChecked).toLocaleTimeString() : 'Just now'}</span>
              <button
                onClick={() => handlePingWebhooks('jellyfin')}
                className="text-indigo-400 hover:underline font-semibold cursor-pointer"
              >
                Ping Jellyfin
              </button>
            </div>
          </div>

          {/* Emby Health Card */}
          <div className={`p-4 rounded-2xl border transition ${
            embyStatus === 'online' 
              ? 'bg-gray-50 dark:bg-black/80 border-gray-200 dark:border-neutral-900' 
              : 'bg-rose-950/20 border-rose-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-green-400" />
                <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">Emby Server</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1 ${
                  embyStatus === 'online'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {embyStatus === 'online' ? (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-400" />
                      <span>Online ({healthData?.emby?.latencyMs || 20}ms)</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-rose-400" />
                      <span>Offline</span>
                    </>
                  )}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-1 font-mono">
              Endpoint: {healthData?.emby?.endpoint || 'http://192.168.1.102:8096'}
            </p>
            <p className="text-[11px] text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
              {healthData?.emby?.details || 'Responding OK.'}
            </p>
            <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-500">
              <span>Last Checked: {healthData?.emby?.lastChecked ? new Date(healthData.emby.lastChecked).toLocaleTimeString() : 'Just now'}</span>
              <button
                onClick={() => handlePingWebhooks('emby')}
                className="text-indigo-400 hover:underline font-semibold cursor-pointer"
              >
                Ping Emby
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Webhook Endpoints & Setup */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Webhook Receiver Endpoints</h3>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Copy these URL endpoints into your Plex Media Server (Settings → Webhooks) or Tautulli Webhook Notification settings.
          </p>

          {/* Plex URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
              <span>Plex Webhook Target URL</span>
              <span className="text-[10px] text-amber-400">Plex Pass Required</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={plexUrl}
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-xs font-mono text-purple-300 focus:outline-none"
              />
              <button
                onClick={() => handleCopy(plexUrl, 'plex')}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1 flex-shrink-0"
              >
                {copiedPlex ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPlex ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Tautulli URL */}
          <div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-neutral-900">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tautulli Webhook Target URL</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={tautulliUrl}
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
              />
              <button
                onClick={() => handleCopy(tautulliUrl, 'tautulli')}
                className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1 flex-shrink-0"
              >
                {copiedTautulli ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTautulli ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Jellyfin URL */}
          <div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-neutral-900">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Jellyfin Webhook Target URL</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={jellyfinUrl}
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-xs font-mono text-purple-400 focus:outline-none"
              />
              <button
                onClick={() => handleCopy(jellyfinUrl, 'jellyfin')}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1 flex-shrink-0"
              >
                {copiedJellyfin ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJellyfin ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Emby URL */}
          <div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-neutral-900">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Emby Webhook Target URL</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={embyUrl}
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-xs font-mono text-green-500 focus:outline-none"
              />
              <button
                onClick={() => handleCopy(embyUrl, 'emby')}
                className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1 flex-shrink-0"
              >
                {copiedEmby ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmby ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-purple-950/30 rounded-2xl border border-purple-800/30 text-xs text-purple-200 space-y-1">
            <p className="font-bold flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Automatic Scrobble Threshold: {settings.plex.autoScrobbleThreshold}%</span>
            </p>
            <p className="text-purple-300/80 text-[11px]">
              When Plex or Tautulli signals video progress passing {settings.plex.autoScrobbleThreshold}%, AniSync Matrix updates Simkl, MAL, and AniList simultaneously.
            </p>
          </div>
        </div>

        {/* Card 2: Interactive Webhook Simulator */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Play className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Live Webhook Simulator</h3>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
              Test Payload
            </span>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400">
            Simulate a media playback event from your Plex client or Tautulli instance to test live auto-scrobbling across Simkl, MAL, and AniList.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Show Select */}
            <div className="col-span-2">
              <label className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Select Anime / Drama Title</label>
              <select
                value={selectedItemTitle}
                onChange={(e) => setSelectedItemTitle(e.target.value)}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                {libraryItems.map(item => (
                  <option key={item.id} value={item.title}>{item.title}</option>
                ))}
              </select>
            </div>

            {/* Season */}
            <div>
              <label className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Season Number</label>
              <input
                type="number"
                value={testSeason}
                onChange={(e) => setTestSeason(Number(e.target.value))}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
              />
            </div>

            {/* Episode */}
            <div>
              <label className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Episode Number</label>
              <input
                type="number"
                value={testEpisode}
                onChange={(e) => setTestEpisode(Number(e.target.value))}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
              />
            </div>

            {/* User */}
            <div>
              <label className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Plex Account User</label>
              <input
                type="text"
                value={testUser}
                onChange={(e) => setTestUser(e.target.value)}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
              />
            </div>

            {/* Source */}
            <div>
              <label className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Payload Type</label>
              <select
                value={testSource}
                onChange={(e) => setTestSource(e.target.value as any)}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                <option value="plex">Plex Standard Scrobble</option>
                <option value="tautulli">Tautulli Watch Event</option>
                <option value="jellyfin">Jellyfin Playback Stop</option>
                <option value="emby">Emby Playback Stop</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSendTestWebhook}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Send Test Webhook Scrobble Event</span>
          </button>
        </div>
      </div>

      {/* AI Plex Filename Matcher Tool */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">AI Plex Filename-to-Anime ID Parser</h3>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Paste complex torrent release filenames (e.g., <code className="text-indigo-300 font-mono">[SubsPlease] Solo Leveling S2 - 11 [1080p].mkv</code>) to verify how Gemini parses raw titles into standard anime and drama IDs.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customFilename}
            onChange={(e) => setCustomFilename(e.target.value)}
            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleRunAiMatch}
            disabled={isMatching}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer flex-shrink-0 flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isMatching ? 'Parsing...' : 'Parse Filename'}</span>
          </button>
        </div>

        {matchResult && (
          <div className="p-4 bg-gray-50 dark:bg-black rounded-2xl border border-indigo-500/30 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-2">
              <span className="font-bold text-indigo-300">Parsed Title: "{matchResult.parsedTitle}"</span>
              <span className="text-emerald-400 font-bold">Confidence: {matchResult.confidenceScore}%</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-700 dark:text-gray-300 pt-1">
              <div>Season: <strong className="text-gray-900 dark:text-gray-100">{matchResult.season}</strong></div>
              <div>Episode: <strong className="text-gray-900 dark:text-gray-100">{matchResult.episode}</strong></div>
              <div>Group: <strong className="text-gray-900 dark:text-gray-100">{matchResult.releaseGroup || 'Generic'}</strong></div>
              <div>Matched: <strong className="text-indigo-300">{matchResult.matchedItem?.title}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Webhook Logs History Table */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Ingested Webhook Event Stream</h3>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">{webhookLogs.length} Events Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-neutral-900 text-gray-600 dark:text-gray-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Event</th>
                <th className="py-2.5 px-3">Media Title</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Client Player</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {webhookLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500 dark:text-gray-500">
                    No webhooks received yet. Send a test webhook above!
                  </td>
                </tr>
              ) : (
                webhookLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:bg-black/60 transition">
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        log.source === 'plex' 
                          ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' 
                          : log.source === 'jellyfin'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : log.source === 'emby'
                          ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                          : 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/30'
                      }`}>
                        {log.source}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-800 dark:text-gray-200 font-medium">{log.event}</td>
                    <td className="py-3 px-3 text-gray-900 dark:text-gray-100 font-semibold">{log.mediaTitle}</td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">{log.user}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{log.player}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
