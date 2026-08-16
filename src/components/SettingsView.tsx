import React, { useState } from 'react';
import { PreImportModal } from './PreImportModal';
import { BackupSettingsView } from './BackupSettingsView';
import { AppSettings, PlatformType } from '../types';
import { OAuthService } from '../services/OAuthService';
import { 
  Database, FileSpreadsheet, Settings, Radio, Cloud, 
  Palette,
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

  // OAuth Popup Handler
  const handleConnect = async (provider: string) => {
    await OAuthService.initiateLogin(provider);
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      setFormState(prev => {
        const updatedSettings = OAuthService.processAuthMessage(event, prev);
        if (updatedSettings) {
          // Immediately persist the captured tokens to the backend DB
          onSaveSettings(updatedSettings);
          return updatedSettings;
        }
        return prev;
      });
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSaveSettings]);

  // Background processor for the queue
  React.useEffect(() => {
    const processNext = () => {
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

      {/* Section 0: Theme & Appearance */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-neutral-900 pb-3">
          <Palette className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Theme & Accent Colors</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Accent Color</label>
              <input
                type="color"
                value={formState.theme?.accentColor || '#4f46e5'}
                onChange={(e) => setFormState(prev => ({ ...prev, theme: { ...prev.theme, accentColor: e.target.value, isGradient: prev.theme?.isGradient || false } }))}
                className="w-full h-10 mt-1 cursor-pointer bg-transparent rounded border border-gray-200 dark:border-neutral-800"
              />
            </div>
            <div className="flex items-center space-x-4 mt-6">
              <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formState.theme?.isGradient || false}
                  onChange={(e) => setFormState(prev => ({ ...prev, theme: { ...prev.theme, isGradient: e.target.checked, accentColor: prev.theme?.accentColor || '#4f46e5' } }))}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span>Enable Gradient Styling</span>
              </label>
            </div>
          </div>
          
          {formState.theme?.isGradient && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-neutral-900/50">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Gradient Start</label>
                <input
                  type="color"
                  value={formState.theme?.gradientStart || '#4f46e5'}
                  onChange={(e) => setFormState(prev => ({ ...prev, theme: { ...prev.theme, isGradient: true, accentColor: prev.theme?.accentColor || '#4f46e5', gradientStart: e.target.value } }))}
                  className="w-full h-10 mt-1 cursor-pointer bg-transparent rounded border border-gray-200 dark:border-neutral-800"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Gradient End</label>
                <input
                  type="color"
                  value={formState.theme?.gradientEnd || '#9333ea'}
                  onChange={(e) => setFormState(prev => ({ ...prev, theme: { ...prev.theme, isGradient: true, accentColor: prev.theme?.accentColor || '#4f46e5', gradientEnd: e.target.value } }))}
                  className="w-full h-10 mt-1 cursor-pointer bg-transparent rounded border border-gray-200 dark:border-neutral-800"
                />
              </div>
            </div>
          )}
        </div>
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

            <div className="pt-2">
              <label className="text-gray-600 dark:text-gray-400 font-medium mb-1 block">Authentication</label>
              <button
                type="button"
                onClick={() => handleConnect('simkl')}
                className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-bold transition shadow-sm ${
                  formState.simkl.connected
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <span>{formState.simkl.connected ? 'Simkl Connected ✓' : 'Connect with Simkl'}</span>
              </button>
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

            <div className="pt-2">
              <label className="text-gray-600 dark:text-gray-400 font-medium mb-1 block">Authentication</label>
              <button
                type="button"
                onClick={() => handleConnect('mal')}
                className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-bold transition shadow-sm ${
                  formState.mal.connected
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                <span>{formState.mal.connected ? 'MyAnimeList Connected ✓' : 'Connect with MyAnimeList'}</span>
              </button>
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

            <div className="pt-2">
              <label className="text-gray-600 dark:text-gray-400 font-medium mb-1 block">Authentication</label>
              <button
                type="button"
                onClick={() => handleConnect('anilist')}
                className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-bold transition shadow-sm ${
                  formState.anilist.connected
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                    : 'bg-sky-600 hover:bg-sky-500 text-white'
                }`}
              >
                <span>{formState.anilist.connected ? 'AniList Connected ✓' : 'Connect with AniList'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Media Servers & Scrobbler */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-3">
            <div className="flex items-center space-x-2">
              <Tv className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Media Servers (Plex, Jellyfin, Emby)</h3>
            </div>
            <span className="text-xs text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Webhooks Active
            </span>
          </div>

          <div className="space-y-6 text-xs">
            {/* Plex */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-neutral-800 pb-1">Plex</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <label className="text-gray-600 dark:text-gray-400 font-medium">Scrobble Threshold (%)</label>
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

            {/* Jellyfin */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-1">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Jellyfin</h4>
                <button
                  onClick={() => setFormState(prev => ({ ...prev, jellyfin: { ...prev.jellyfin, connected: !prev.jellyfin.connected } }))}
                  className={`w-8 h-4 rounded-full transition-colors relative ${formState.jellyfin.connected ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${formState.jellyfin.connected ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
              
              {formState.jellyfin.connected && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-600 dark:text-gray-400 font-medium">Jellyfin Server Name</label>
                    <input
                      type="text"
                      value={formState.jellyfin.serverName}
                      onChange={(e) => setFormState({
                        ...formState,
                        jellyfin: { ...formState.jellyfin, serverName: e.target.value }
                      })}
                      className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 dark:text-gray-400 font-medium">Server URL</label>
                    <input
                      type="text"
                      value={formState.jellyfin.serverUrl}
                      onChange={(e) => setFormState({
                        ...formState,
                        jellyfin: { ...formState.jellyfin, serverUrl: e.target.value }
                      })}
                      className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-gray-600 dark:text-gray-400 font-medium">API Key</label>
                    <input
                      type="password"
                      value={formState.jellyfin.apiKey}
                      onChange={(e) => setFormState({
                        ...formState,
                        jellyfin: { ...formState.jellyfin, apiKey: e.target.value }
                      })}
                      className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                      placeholder="Jellyfin API Token"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Emby */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-1">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Emby</h4>
                <button
                  onClick={() => setFormState(prev => ({ ...prev, emby: { ...prev.emby, connected: !prev.emby.connected } }))}
                  className={`w-8 h-4 rounded-full transition-colors relative ${formState.emby.connected ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${formState.emby.connected ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
              
              {formState.emby.connected && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-600 dark:text-gray-400 font-medium">Emby Server Name</label>
                    <input
                      type="text"
                      value={formState.emby.serverName}
                      onChange={(e) => setFormState({
                        ...formState,
                        emby: { ...formState.emby, serverName: e.target.value }
                      })}
                      className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 dark:text-gray-400 font-medium">Server URL</label>
                    <input
                      type="text"
                      value={formState.emby.serverUrl}
                      onChange={(e) => setFormState({
                        ...formState,
                        emby: { ...formState.emby, serverUrl: e.target.value }
                      })}
                      className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-gray-600 dark:text-gray-400 font-medium">API Key</label>
                    <input
                      type="password"
                      value={formState.emby.apiKey}
                      onChange={(e) => setFormState({
                        ...formState,
                        emby: { ...formState.emby, apiKey: e.target.value }
                      })}
                      className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                      placeholder="Emby API Token"
                    />
                  </div>
                </div>
              )}
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
                try {
                  const res = await fetch('/api/remote-sync/push', { method: 'POST' });
                  const data = await res.json();
                  if (data.success) {
                    setFormState(prev => ({ ...prev, remoteSync: { ...prev.remoteSync, lastSync: data.timestamp } }));
                    alert('Successfully pushed to remote server.');
                  } else {
                    alert(data.error || 'Failed to push');
                  }
                } catch (err) {
                  alert('Network error while pushing to remote server.');
                }
              }}
              className="px-3 py-1.5 bg-indigo-600/20 text-indigo-500 hover:bg-indigo-600/30 rounded-lg text-xs font-semibold transition"
            >
              Push
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/remote-sync/pull', { method: 'POST' });
                  const data = await res.json();
                  if (data.success) {
                    alert('Successfully pulled from remote server. Refreshing...');
                    window.location.reload();
                  } else {
                    alert(data.error || 'Failed to pull');
                  }
                } catch (err) {
                  alert('Network error while pulling from remote server.');
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
              <span className="text-xs text-gray-500 dark:text-gray-400">Enable tracking of web-based streaming (Netflix, Crunchyroll, Hi-Dive, Plex, Stremio) and native Windows apps (MPC-BE, VLC, Plex Desktop, Netflix Desktop, Stremio Desktop).</span>
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
              onChange={(e) => {
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
                      try {
                        const base64Data = event.target?.result;
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
      <BackupSettingsView formState={formState} setFormState={setFormState} />

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
            try {
              if (!importState) return;
              const currentId = importState.id;
              setImportState(null); // close modal
              setImportQueue(prev => prev.map(q => q.id === currentId ? { ...q, status: 'importing' } : q));
              
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
              if (importState) {
                setImportQueue(prev => prev.map(q => q.id === importState.id ? { ...q, status: 'error', error: 'Network error.' } : q));
              }
            }
          }}
        />
      )}
    </>
  );
};
