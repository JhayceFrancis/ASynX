import React, { useState } from 'react';
import { PreImportModal } from './PreImportModal';
import { AppSettings, PlatformType } from '../types';
import { 
  Database, FileSpreadsheet, Settings, Radio, Cloud, 
  CheckCircle2, 
  Key, 
  Tv, 
  Sliders, 
  Save, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  Link2
} from 'lucide-react';

export type QueueItemStatus = 'pending' | 'processing' | 'awaiting_mapping' | 'importing' | 'completed' | 'error';
export interface ImportQueueItem {
  id: string;
  file: File;
  status: QueueItemStatus;
  progress: number;
  parsedData?: any[];
  headers?: string[];
  error?: string;
}

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings
}) => {
  const [formState, setFormState] = useState<AppSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [importState, setImportState] = useState<{ id: string; file: File; parsedData: any[]; headers: string[] } | null>(null);
  const [importQueue, setImportQueue] = useState<ImportQueueItem[]>([]);

  // Synchronize formState when props update
  React.useEffect(() => {
    setFormState(settings);
  }, [settings]);

  // Background processor for the queue
  React.useEffect(() => {
    const processNext = async () => {
      const nextPending = importQueue.find(q => q.status === 'pending');
      if (!nextPending) return;

      // Mark as processing
      setImportQueue(prev => prev.map(q => q.id === nextPending.id ? { ...q, status: 'processing', progress: 10 } : q));

      const { file } = nextPending;
      const ext = file.name.split('.').pop()?.toLowerCase();
      
      if (ext === 'json' || ext === 'csv') {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            // Simulate processing time for progress bar
            setImportQueue(prev => prev.map(q => q.id === nextPending.id ? { ...q, progress: 40 } : q));
            await new Promise(r => setTimeout(r, 600)); // fake delay
            
            const text = event.target?.result as string;
            let parsedData: any[] = [];
            let headers: string[] = [];
            
            if (ext === 'json') {
              const data = JSON.parse(text);
              parsedData = Array.isArray(data) ? data : data.items || [];
              if (parsedData.length > 0) headers = Object.keys(parsedData[0]);
            } else if (ext === 'csv') {
              const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
              if (lines.length > 0) {
                headers = lines[0].split(',').map(h => h.trim());
                parsedData = lines.slice(1).map(line => {
                  const values = line.split(',');
                  const obj: any = {};
                  headers.forEach((h, i) => { obj[h] = values[i]; });
                  return obj;
                });
              }
            }
            
            setImportQueue(prev => prev.map(q => q.id === nextPending.id ? { ...q, progress: 80 } : q));
            await new Promise(r => setTimeout(r, 400)); // fake delay validating
            
            if (parsedData.length > 0) {
              setImportQueue(prev => prev.map(q => q.id === nextPending.id ? { 
                ...q, 
                status: 'awaiting_mapping', 
                progress: 100,
                parsedData,
                headers
              } : q));
            } else {
              setImportQueue(prev => prev.map(q => q.id === nextPending.id ? { ...q, status: 'error', error: 'No valid records found.' } : q));
            }
          } catch (err) {
            setImportQueue(prev => prev.map(q => q.id === nextPending.id ? { ...q, status: 'error', error: 'Failed to parse file.' } : q));
          }
        };
        reader.readAsText(file);
      } else {
        setImportQueue(prev => prev.map(q => q.id === nextPending.id ? { ...q, status: 'error', error: 'Unsupported format.' } : q));
      }
    };
    
    processNext();
  }, [importQueue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formState);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#111] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-neutral-800">
              <Settings className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">API Credentials & Sync Preferences</h2>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Configure authentication tokens, Plex server credentials, auto-scrobble rules, and conflict resolution defaults.
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center space-x-2"
        >
          {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Settings Saved!' : 'Save All Preferences'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Simkl API Config */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Simkl API Connection</h3>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Connected
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-gray-600 dark:text-gray-400 font-medium">Username</label>
              <input
                type="text"
                value={formState.simkl.username}
                onChange={(e) => setFormState({
                  ...formState,
                  simkl: { ...formState.simkl, username: e.target.value }
                })}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-gray-600 dark:text-gray-400 font-medium">Simkl Client ID</label>
              <input
                type="text"
                value={formState.simkl.clientId}
                onChange={(e) => setFormState({
                  ...formState,
                  simkl: { ...formState.simkl, clientId: e.target.value }
                })}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-gray-600 dark:text-gray-400 font-medium">OAuth User Token</label>
              <input
                type="password"
                value={formState.simkl.accessToken}
                onChange={(e) => setFormState({
                  ...formState,
                  simkl: { ...formState.simkl, accessToken: e.target.value }
                })}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: MyAnimeList API Config */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-blue-400" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">MyAnimeList (MAL) API Connection</h3>
            </div>
            <span className="text-xs text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Connected
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-gray-600 dark:text-gray-400 font-medium">Username</label>
              <input
                type="text"
                value={formState.mal.username}
                onChange={(e) => setFormState({
                  ...formState,
                  mal: { ...formState.mal, username: e.target.value }
                })}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-gray-600 dark:text-gray-400 font-medium">MAL Client ID</label>
              <input
                type="text"
                value={formState.mal.clientId}
                onChange={(e) => setFormState({
                  ...formState,
                  mal: { ...formState.mal, clientId: e.target.value }
                })}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-gray-600 dark:text-gray-400 font-medium">Bearer Token</label>
              <input
                type="password"
                value={formState.mal.accessToken}
                onChange={(e) => setFormState({
                  ...formState,
                  mal: { ...formState.mal, accessToken: e.target.value }
                })}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: AniList GraphQL Config */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">AniList API Connection</h3>
            </div>
            <span className="text-xs text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Connected
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-gray-600 dark:text-gray-400 font-medium">Username</label>
              <input
                type="text"
                value={formState.anilist.username}
                onChange={(e) => setFormState({
                  ...formState,
                  anilist: { ...formState.anilist, username: e.target.value }
                })}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-gray-600 dark:text-gray-400 font-medium">GraphQL Personal Access Token</label>
              <input
                type="password"
                value={formState.anilist.accessToken}
                onChange={(e) => setFormState({
                  ...formState,
                  anilist: { ...formState.anilist, accessToken: e.target.value }
                })}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Plex & Tautulli Config */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-3">
            <div className="flex items-center space-x-2">
              <Tv className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Plex & Tautulli Scrobbler</h3>
            </div>
            <span className="text-xs text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Webhooks Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-gray-600 dark:text-gray-400 font-medium">Plex Server Name</label>
              <input
                type="text"
                value={formState.plex.serverName}
                onChange={(e) => setFormState({
                  ...formState,
                  plex: { ...formState.plex, serverName: e.target.value }
                })}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-gray-600 dark:text-gray-400 font-medium">Auto-Scrobble Watch Percentage Threshold</label>
              <input
                type="number"
                min="50"
                max="98"
                value={formState.plex.autoScrobbleThreshold}
                onChange={(e) => setFormState({
                  ...formState,
                  plex: { ...formState.plex, autoScrobbleThreshold: Number(e.target.value) }
                })}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      

      {/* Section 6: Remote Sync (Docker Backend) */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-3 gap-3">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Remote Sync (Docker Backend)</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={async () => {
                const res = await fetch('/api/remote-sync/push', { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                  setFormState(prev => ({ ...prev, remoteSync: { ...prev.remoteSync, lastSync: data.timestamp } }));
                  alert('Successfully pushed to remote server.');
                } else {
                  alert(data.error || 'Failed to push');
                }
              }}
              className="px-3 py-1.5 bg-indigo-600/20 text-indigo-500 hover:bg-indigo-600/30 rounded-lg text-xs font-semibold transition"
            >
              Push
            </button>
            <button
              onClick={async () => {
                const res = await fetch('/api/remote-sync/pull', { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                  alert('Successfully pulled from remote server. Refreshing...');
                  window.location.reload();
                } else {
                  alert(data.error || 'Failed to pull');
                }
              }}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg text-xs font-semibold transition"
            >
              Pull
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Enable Remote Sync</label>
            <div className="mt-2 flex items-center space-x-3">
              <button
                onClick={() => setFormState(prev => ({ ...prev, remoteSync: { ...prev.remoteSync, enabled: !prev.remoteSync.enabled } }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${formState.remoteSync?.enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formState.remoteSync?.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {formState.remoteSync?.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>

          <div>
            <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Last Synced</label>
            <div className="mt-2 text-xs text-gray-800 dark:text-gray-200 font-mono">
              {formState.remoteSync?.lastSync ? new Date(formState.remoteSync.lastSync).toLocaleString() : 'Never'}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-gray-600 dark:text-gray-400 font-medium text-xs flex justify-between items-center">
              <span>Remote Server URL (e.g., https://sync.yourdomain.com)</span>
              {formState.remoteSync?.serverUrl && formState.remoteSync.serverUrl.startsWith('http://') && !formState.remoteSync.serverUrl.includes('localhost') && !formState.remoteSync.serverUrl.includes('127.0.0.1') && (
                <span className="text-amber-500 font-bold ml-2 text-[10px] flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-1" /> WARNING: Unencrypted (HTTP)
                </span>
              )}
            </label>
            <input
              type="text"
              value={formState.remoteSync?.serverUrl || ''}
              onChange={(e) => setFormState({
                ...formState,
                remoteSync: { ...formState.remoteSync, serverUrl: e.target.value }
              })}
              className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">API Key</label>
            <input
              type="text"
              value={formState.remoteSync?.apiKey || ''}
              onChange={(e) => setFormState({
                ...formState,
                remoteSync: { ...formState.remoteSync, apiKey: e.target.value }
              })}
              className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
             <button
              onClick={async () => {
                if (!formState.remoteSync?.serverUrl) {
                   alert("Please enter a Remote Server URL.");
                   return;
                }
                try {
                  const res = await fetch(`${formState.remoteSync.serverUrl}/api/remote-sync/info`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey: formState.remoteSync.apiKey })
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert(`${data.message}\nVersion: ${data.version}`);
                  } else {
                    alert(data.error || 'Failed to connect. Invalid API Key or Server.');
                  }
                } catch (err) {
                  alert("Failed to connect to the server. Is it running and reachable?");
                }
              }}
              className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black hover:bg-neutral-700 dark:hover:bg-neutral-300 rounded-xl text-xs font-semibold transition"
            >
              Test Connection
            </button>
          </div>
        </div>
      </div>

      
      {/* Section 7: Background Daemon (Local Media Detection) */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-neutral-900 pb-3">
          <Tv className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Local Media & Background Daemon</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-gray-800 dark:text-gray-200 font-semibold">Run on System Startup</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Launch ASynX as a background daemon when you log into Windows.</span>
            </div>
            <button
              onClick={() => setFormState(prev => ({ ...prev, daemonSettings: { ...prev.daemonSettings, runOnStartup: !prev.daemonSettings?.runOnStartup } }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${formState.daemonSettings?.runOnStartup ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formState.daemonSettings?.runOnStartup ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="block text-gray-800 dark:text-gray-200 font-semibold">Local Media Detection</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Enable API endpoint for browser extensions (Crunchyroll, Netflix) and Stremio/VLC plugins to report playback.</span>
            </div>
            <button
              onClick={() => setFormState(prev => ({ ...prev, daemonSettings: { ...prev.daemonSettings, enableLocalMediaDetection: !prev.daemonSettings?.enableLocalMediaDetection } }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${formState.daemonSettings?.enableLocalMediaDetection ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formState.daemonSettings?.enableLocalMediaDetection ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="block text-gray-800 dark:text-gray-200 font-semibold">Automated Scrobbling (No Prompt)</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">If enabled, detected media will be scrobbled automatically without asking for confirmation.</span>
            </div>
            <button
              onClick={() => setFormState(prev => ({ ...prev, daemonSettings: { ...prev.daemonSettings, autoScrobbleLocal: !prev.daemonSettings?.autoScrobbleLocal } }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${formState.daemonSettings?.autoScrobbleLocal ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formState.daemonSettings?.autoScrobbleLocal ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 p-3 rounded-lg border border-blue-200/50 dark:border-blue-900/30">
            <span className="font-semibold block mb-1">Developer API</span>
            <span className="text-xs">Third-party plugins can POST playback data to <code className="bg-white dark:bg-black px-1 py-0.5 rounded text-blue-700 dark:text-blue-300">http://127.0.0.1:3000/api/daemon/report</code> with payload <code>{'{'} title, player, currentEpisode, totalEpisodes {'}'}</code> to trigger the prompt.</span>
          </div>
        </div>
      </div>

      {/* Section 5: Matrix Sync Rules & Policy */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-neutral-900 pb-3">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Matrix Sync Engine Rules & Defaults</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-gray-600 dark:text-gray-400 font-medium">Background Sync Frequency</label>
            <select
              value={formState.syncRules.autoSyncIntervalMinutes}
              onChange={(e) => setFormState({
                ...formState,
                syncRules: { ...formState.syncRules, autoSyncIntervalMinutes: Number(e.target.value) }
              })}
              className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              <option value={5}>Every 5 Minutes</option>
              <option value={15}>Every 15 Minutes</option>
              <option value={30}>Every 30 Minutes</option>
              <option value={60}>Every Hour</option>
            </select>
          </div>

          <div>
            <label className="text-gray-600 dark:text-gray-400 font-medium">Conflict Resolution Policy</label>
            <select
              value={formState.syncRules.conflictPolicy}
              onChange={(e) => setFormState({
                ...formState,
                syncRules: { ...formState.syncRules, conflictPolicy: e.target.value as any }
              })}
              className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              <option value="ask_user">Flag for Review in Resolution Center</option>
              <option value="highest_episode">Auto-Apply Highest Watched Episode</option>
              <option value="source_of_truth">Auto-Use Default Source of Truth</option>
            </select>
          </div>

          <div>
            <label className="text-gray-600 dark:text-gray-400 font-medium">Default Source of Truth Platform</label>
            <select
              value={formState.syncRules.defaultSourceOfTruth}
              onChange={(e) => setFormState({
                ...formState,
                syncRules: { ...formState.syncRules, defaultSourceOfTruth: e.target.value as any }
              })}
              className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              <option value="anilist">AniList GraphQL</option>
              <option value="simkl">Simkl API</option>
              <option value="mal">MyAnimeList</option>
            </select>
          </div>
        </div>
      </div>
      {/* Section 8: Data Portability & Backups */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-neutral-900 pb-3">
          <Save className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Data Portability & Backups</h3>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm">
            <span className="block text-gray-800 dark:text-gray-200 font-semibold">Import Media Tracking Data</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Restore your database from an external file. Supported formats: .csv, .json, .zip, .html (MAL/AniList Exports)</span>
          </div>
          <div className="relative">
            <input 
              type="file" 
              id="file-upload" 
              className="absolute inset-0 w-full h-full z-10 opacity-0 cursor-pointer"
              accept=".csv,.json,.zip,.html"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const ext = file.name.split('.').pop()?.toLowerCase();
                  if (ext === 'json' || ext === 'csv') {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const text = event.target?.result as string;
                        let parsedData: any[] = [];
                        let headers: string[] = [];
                        
                        if (ext === 'json') {
                          const data = JSON.parse(text);
                          parsedData = Array.isArray(data) ? data : data.items || [];
                          if (parsedData.length > 0) headers = Object.keys(parsedData[0]);
                        } else if (ext === 'csv') {
                          // Simple CSV parser
                          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
                          if (lines.length > 0) {
                            headers = lines[0].split(',').map(h => h.trim());
                            parsedData = lines.slice(1).map(line => {
                              // Basic split, doesn't handle quoted commas perfectly but works for simple exports
                              const values = line.split(',');
                              const obj: any = {};
                              headers.forEach((h, i) => { obj[h] = values[i]; });
                              return obj;
                            });
                          }
                        }
                        
                        if (parsedData.length > 0) {
                          setImportState({ file, parsedData, headers });
                        } else {
                          alert('No valid records found in file.');
                        }
                        e.target.value = ''; // Reset input
                      } catch (err) {
                        alert('Failed to parse file.');
                      }
                    };
                    reader.readAsText(file);
                  } else {
                    // Fallback to legacy upload for unsupported formats
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                      const base64Data = event.target?.result;
                      try {
                        const res = await fetch('/api/data/import-file', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ filename: file.name, fileData: base64Data })
                        });
                        const data = await res.json();
                        if (data.success) {
                          alert(data.message);
                        } else {
                          alert(data.error || 'Failed to import file.');
                        }
                      } catch (err) {
                        alert('Network error while uploading file.');
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }
              }}
            />
            <button
              type="button"
              className="pointer-events-none px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
            >
              Select Backup File
            </button>
          </div>
        </div>
      </div>



      {importQueue.length > 0 && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-indigo-200 dark:border-indigo-900/30 rounded-3xl p-6 space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/30 pb-3 relative z-10">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Import Queue Processing</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              {importQueue.filter(q => q.status === 'completed' || q.status === 'error').length} / {importQueue.length} Files
            </span>
          </div>
          
          <div className="space-y-3 relative z-10 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-800">
            {importQueue.map((item) => (
              <div key={item.id} className="flex flex-col space-y-2 p-3 bg-gray-50 dark:bg-[#111] rounded-xl border border-gray-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <FileSpreadsheet className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{item.file.name}</span>
                    <span className="text-[10px] text-gray-500">{(item.file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.status === 'pending' && <span className="text-[10px] font-semibold text-gray-500">Queued</span>}
                    {item.status === 'processing' && <span className="text-[10px] font-semibold text-indigo-500 animate-pulse">Parsing...</span>}
                    {item.status === 'awaiting_mapping' && (
                      <button 
                        type="button"
                        onClick={() => setImportState({ id: item.id, file: item.file, parsedData: item.parsedData!, headers: item.headers! })}
                        className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-white dark:text-amber-950 text-[10px] font-bold rounded shadow transition-colors"
                      >
                        Action Required: Map Fields
                      </button>
                    )}
                    {item.status === 'importing' && <span className="text-[10px] font-semibold text-blue-500 animate-pulse">Saving to DB...</span>}
                    {item.status === 'completed' && <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Done</span>}
                    {item.status === 'error' && <span className="text-[10px] font-semibold text-red-500">{item.error}</span>}
                  </div>
                </div>
                
                {/* Progress Bar */}
                {item.status !== 'error' && (
                  <div className="w-full bg-gray-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        item.status === 'completed' ? 'bg-emerald-500' :
                        item.status === 'awaiting_mapping' ? 'bg-amber-500' :
                        'bg-indigo-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 9: Automated Cloud Backups */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-3 gap-3">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Automated Cloud Backups</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={async () => {
                if (!formState.automatedBackups?.enabled) {
                   alert("Please enable backups first.");
                   return;
                }
                try {
                  const res = await fetch('/api/backups/run', { method: 'POST' });
                  const data = await res.json();
                  if (data.success) {
                    setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, lastBackup: data.lastBackup } }));
                    alert(data.message);
                  } else {
                    alert(data.error || 'Backup failed');
                  }
                } catch (err) {
                  alert("Network error.");
                }
              }}
              className="px-3 py-1.5 bg-indigo-600/20 text-indigo-500 hover:bg-indigo-600/30 rounded-lg text-xs font-semibold transition"
            >
              Run Backup Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-gray-800 dark:text-gray-200 font-semibold">Enable Automated Backups</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Regularly push an encrypted snapshot to your preferred cloud.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const isEnabled = formState.automatedBackups?.enabled || false;
                setFormState(prev => ({ 
                  ...prev, 
                  automatedBackups: { 
                    ...(prev.automatedBackups || { provider: 'github_gist', frequency: 'weekly', token: '', targetId: '' }),
                    enabled: !isEnabled 
                  } 
                }));
              }}
              className={`w-12 h-6 rounded-full transition-colors relative ${formState.automatedBackups?.enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formState.automatedBackups?.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          
          {formState.automatedBackups?.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Provider</label>
                <select
                  value={formState.automatedBackups.provider}
                  onChange={(e) => setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, provider: e.target.value as any } }))}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  <option value="github_gist">GitHub Private Gist</option>
                  <option value="github_repo">GitHub Private Repo</option>
                  <option value="gdrive">Google Drive</option>
                  <option value="onedrive">OneDrive</option>
                </select>
              </div>
              
              <div>
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Frequency</label>
                <select
                  value={formState.automatedBackups.frequency}
                  onChange={(e) => setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, frequency: e.target.value as any } }))}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly (Default)</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Auth Token (Personal Access Token / OAuth Refresh Token)</label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={formState.automatedBackups.token || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, token: e.target.value } }))}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Target ID (Gist ID, Repo Name, or Folder ID)</label>
                <input
                  type="text"
                  placeholder="Leave blank to create new (Gist only)"
                  value={formState.automatedBackups.targetId || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, targetId: e.target.value } }))}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Last Backup</label>
                <div className="mt-1 text-xs text-gray-800 dark:text-gray-200 font-mono">
                  {formState.automatedBackups?.lastBackup ? new Date(formState.automatedBackups.lastBackup).toLocaleString() : 'Never'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 10: System Maintenance */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-red-200 dark:border-red-900/30 rounded-3xl p-6 space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-red-100 dark:border-red-900/30 pb-3 gap-3 relative z-10">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">System Maintenance</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-gray-800 dark:text-gray-200 font-semibold">Maintenance Mode</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Pause all incoming webhooks, background syncs, and auto-scrobblers. Useful during manual database cleanup or mass imports to prevent accidental overrides.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormState(prev => ({ 
                  ...prev, 
                  maintenanceMode: !prev.maintenanceMode
                }));
              }}
              className={`w-12 h-6 rounded-full transition-colors relative ${formState.maintenanceMode ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-800'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formState.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

    </form>
      
      {importState && (
        <PreImportModal
          file={importState.file}
          parsedData={importState.parsedData}
          headers={importState.headers}
          onClose={() => setImportState(null)}
          onImport={async (mappedItems) => {
            const currentId = importState.id;
            setImportState(null); // close modal
            setImportQueue(prev => prev.map(q => q.id === currentId ? { ...q, status: 'importing' } : q));
            
            try {
              // Simulated database saving delay
              await new Promise(r => setTimeout(r, 1500));

              const res = await fetch('/api/library/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: mappedItems })
              });
              const data = await res.json();
              
              if (data.success) {
                await fetch('/api/data/import-file', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ filename: importState.file.name, fileData: 'mock' })
                });
                setImportQueue(prev => prev.map(q => q.id === currentId ? { ...q, status: 'completed' } : q));
              } else {
                setImportQueue(prev => prev.map(q => q.id === currentId ? { ...q, status: 'error', error: data.error || 'Failed to import' } : q));
              }
            } catch (err) {
              setImportQueue(prev => prev.map(q => q.id === currentId ? { ...q, status: 'error', error: 'Network error.' } : q));
            }
          }}
        />
      )}
    </>
  );
};
