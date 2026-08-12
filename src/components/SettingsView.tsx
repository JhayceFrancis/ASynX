import React, { useState } from 'react';
import { AppSettings, PlatformType } from '../types';
import { 
  Settings, 
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formState);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              <Settings className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-100">API Credentials & Sync Preferences</h2>
          </div>
          <p className="text-xs text-slate-400">
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
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">Simkl API Connection</h3>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Connected
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium">Username</label>
              <input
                type="text"
                value={formState.simkl.username}
                onChange={(e) => setFormState({
                  ...formState,
                  simkl: { ...formState.simkl, username: e.target.value }
                })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Simkl Client ID</label>
              <input
                type="text"
                value={formState.simkl.clientId}
                onChange={(e) => setFormState({
                  ...formState,
                  simkl: { ...formState.simkl, clientId: e.target.value }
                })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">OAuth User Token</label>
              <input
                type="password"
                value={formState.simkl.accessToken}
                onChange={(e) => setFormState({
                  ...formState,
                  simkl: { ...formState.simkl, accessToken: e.target.value }
                })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: MyAnimeList API Config */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-blue-400" />
              <h3 className="text-sm font-bold text-slate-100">MyAnimeList (MAL) API Connection</h3>
            </div>
            <span className="text-xs text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Connected
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium">Username</label>
              <input
                type="text"
                value={formState.mal.username}
                onChange={(e) => setFormState({
                  ...formState,
                  mal: { ...formState.mal, username: e.target.value }
                })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">MAL Client ID</label>
              <input
                type="text"
                value={formState.mal.clientId}
                onChange={(e) => setFormState({
                  ...formState,
                  mal: { ...formState.mal, clientId: e.target.value }
                })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Bearer Token</label>
              <input
                type="password"
                value={formState.mal.accessToken}
                onChange={(e) => setFormState({
                  ...formState,
                  mal: { ...formState.mal, accessToken: e.target.value }
                })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: AniList GraphQL Config */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">AniList API Connection</h3>
            </div>
            <span className="text-xs text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Connected
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium">Username</label>
              <input
                type="text"
                value={formState.anilist.username}
                onChange={(e) => setFormState({
                  ...formState,
                  anilist: { ...formState.anilist, username: e.target.value }
                })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">GraphQL Personal Access Token</label>
              <input
                type="password"
                value={formState.anilist.accessToken}
                onChange={(e) => setFormState({
                  ...formState,
                  anilist: { ...formState.anilist, accessToken: e.target.value }
                })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Plex & Tautulli Config */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Tv className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-slate-100">Plex & Tautulli Scrobbler</h3>
            </div>
            <span className="text-xs text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Webhooks Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium">Plex Server Name</label>
              <input
                type="text"
                value={formState.plex.serverName}
                onChange={(e) => setFormState({
                  ...formState,
                  plex: { ...formState.plex, serverName: e.target.value }
                })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Auto-Scrobble Watch Percentage Threshold</label>
              <input
                type="number"
                min="50"
                max="98"
                value={formState.plex.autoScrobbleThreshold}
                onChange={(e) => setFormState({
                  ...formState,
                  plex: { ...formState.plex, autoScrobbleThreshold: Number(e.target.value) }
                })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Matrix Sync Rules & Policy */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-slate-100">Matrix Sync Engine Rules & Defaults</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium">Background Sync Frequency</label>
            <select
              value={formState.syncRules.autoSyncIntervalMinutes}
              onChange={(e) => setFormState({
                ...formState,
                syncRules: { ...formState.syncRules, autoSyncIntervalMinutes: Number(e.target.value) }
              })}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
            >
              <option value={5}>Every 5 Minutes</option>
              <option value={15}>Every 15 Minutes</option>
              <option value={30}>Every 30 Minutes</option>
              <option value={60}>Every Hour</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium">Conflict Resolution Policy</label>
            <select
              value={formState.syncRules.conflictPolicy}
              onChange={(e) => setFormState({
                ...formState,
                syncRules: { ...formState.syncRules, conflictPolicy: e.target.value as any }
              })}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
            >
              <option value="ask_user">Flag for Review in Resolution Center</option>
              <option value="highest_episode">Auto-Apply Highest Watched Episode</option>
              <option value="source_of_truth">Auto-Use Default Source of Truth</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium">Default Source of Truth Platform</label>
            <select
              value={formState.syncRules.defaultSourceOfTruth}
              onChange={(e) => setFormState({
                ...formState,
                syncRules: { ...formState.syncRules, defaultSourceOfTruth: e.target.value as any }
              })}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
            >
              <option value="anilist">AniList GraphQL</option>
              <option value="simkl">Simkl API</option>
              <option value="mal">MyAnimeList</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
};
