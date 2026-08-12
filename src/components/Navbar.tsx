import React from 'react';
import { RefreshCw, Radio, Chrome, ShieldAlert, Cpu, Settings, Layers, AlertTriangle, Tv, CheckCircle2, Monitor, Sun, Moon } from 'lucide-react';
import { AppSettings, BrowserExtensionState } from '../types';
import { ASynXLogo } from './ASynXLogo';
import { Tooltip } from './Tooltip';

interface NavbarProps {
  activeTab: 'matrix' | 'conflicts' | 'plex' | 'extension' | 'settings';
  setActiveTab: (tab: 'matrix' | 'conflicts' | 'plex' | 'extension' | 'settings') => void;
  conflictCount: number;
  isSyncing: boolean;
  onTriggerSync: () => void;
  settings: AppSettings;
  extensionState: BrowserExtensionState;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  conflictCount,
  isSyncing,
  onTriggerSync,
  settings,
  extensionState,
  isDarkMode,
  toggleDarkMode
}) => {
  return (
    <header className="bg-white dark:bg-[#0a0a0a]/95 border-b border-gray-200 dark:border-neutral-900 text-gray-900 dark:text-gray-100 sticky top-0 z-40 shadow-lg select-none">
      {/* Fluent Command Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & App Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center">
            <ASynXLogo className="w-10 h-10 drop-shadow-[0_0_12px_rgba(99,102,241,0.4)]" animated={isSyncing} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center space-x-1.5">
                <span className="text-gray-900 dark:text-white">ASynX</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Live System Status Badges */}
        <div className="hidden xl:flex items-center space-x-3 bg-gray-50 dark:bg-black/80 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-900 text-xs">
          {/* Simkl */}
          <Tooltip title="Simkl Tracker Status" description="Real-time connection health and sync readiness with Simkl service.">
            <div className="flex items-center space-x-1.5 cursor-help">
              <span className={`w-2 h-2 rounded-full ${settings.simkl.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="font-semibold text-gray-700 dark:text-gray-300 text-[11px]">Simkl</span>
            </div>
          </Tooltip>
          <span className="text-slate-800">|</span>

          {/* MAL */}
          <Tooltip title="MyAnimeList Status" description="Connected status for MyAnimeList account synchronization.">
            <div className="flex items-center space-x-1.5 cursor-help">
              <span className={`w-2 h-2 rounded-full ${settings.mal.connected ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="font-semibold text-gray-700 dark:text-gray-300 text-[11px]">MAL</span>
            </div>
          </Tooltip>
          <span className="text-slate-800">|</span>

          {/* AniList */}
          <Tooltip title="AniList Tracker Status" description="GraphQL API connection and active bearer token status for AniList.">
            <div className="flex items-center space-x-1.5 cursor-help">
              <span className={`w-2 h-2 rounded-full ${settings.anilist.connected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="font-semibold text-gray-700 dark:text-gray-300 text-[11px]">AniList</span>
            </div>
          </Tooltip>
          <span className="text-slate-800">|</span>

          {/* Plex Webhook */}
          <Tooltip title="Docker Sync Daemon" description="Background daemon on server running automated cross-platform sync cycles.">
            <div className="flex items-center space-x-1.5 cursor-help">
              <span className={`w-2 h-2 rounded-full ${settings.plex.connected ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="font-semibold text-gray-700 dark:text-gray-300 text-[11px]">Docker Daemon</span>
            </div>
          </Tooltip>
        </div>

        {/* Desktop Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Theme Toggle Button */}
          <Tooltip title="Appearance Theme" description="Toggle between Dark Mode and Light Mode Fluent UI theme appearance." position="bottom">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-xl bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-neutral-800 text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </Tooltip>

          {/* Extension Companion Button */}
          <Tooltip title="Browser Extension Status" description="Inspect live media playback detection and browser overlay status." position="bottom">
            <button 
              onClick={() => setActiveTab('extension')}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                extensionState.installed 
                  ? 'bg-gray-100 dark:bg-[#111]/90 border-indigo-500/30 text-indigo-500 dark:text-indigo-300 hover:bg-gray-200 dark:hover:bg-[#111]' 
                  : 'bg-gray-100 dark:bg-[#111]/40 border-gray-300 dark:border-neutral-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Chrome className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Browser Overlay</span>
              {extensionState.currentMedia?.isPlaying && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          </Tooltip>

          {/* Trigger Sync Button */}
          <Tooltip title="Instant Full Sync" description="Trigger immediate cross-platform synchronization across all accounts and server database." position="bottom">
            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:from-indigo-700 active:to-purple-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync All Now'}</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Windows 11 Fluent Tab Bar */}
      <div className="bg-gray-50 dark:bg-black/90 border-t border-gray-200 dark:border-neutral-900/80 px-4 sm:px-6 lg:px-8">
        <nav className="max-w-7xl mx-auto flex space-x-1 sm:space-x-2 overflow-x-auto py-1.5 scrollbar-none">
          <Tooltip title="Sync Matrix & Dashboard" description="View unified media progress matrix, activity analytics charts, and trigger manual overrides.">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#111]/50'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === 'matrix' ? 'max-w-[200px] ml-2 opacity-100' : 'max-w-0 opacity-0'}`}>Sync Matrix & Dashboard</span>
            </button>
          </Tooltip>

          <Tooltip title="Conflict Resolution" description="Inspect desynced episode progress across platforms and apply source of truth or custom values.">
            <button
              onClick={() => setActiveTab('conflicts')}
              className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap relative ${
                activeTab === 'conflicts'
                  ? 'bg-amber-600/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#111]/50'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === 'conflicts' ? 'max-w-[200px] ml-2 opacity-100' : 'max-w-0 opacity-0'}`}>Conflict Resolution</span>
              {conflictCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white dark:text-slate-950 text-[10px] font-extrabold animate-pulse">
                  {conflictCount}
                </span>
              )}
            </button>
          </Tooltip>

          <Tooltip title="Plex & Tautulli Automation" description="Configure Plex webhooks, Tautulli notification triggers, and test media playback matching.">
            <button
              onClick={() => setActiveTab('plex')}
              className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                activeTab === 'plex'
                  ? 'bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#111]/50'
              }`}
            >
              <Tv className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <span className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === 'plex' ? 'max-w-[200px] ml-2 opacity-100' : 'max-w-0 opacity-0'}`}>Plex & Tautulli Automation</span>
            </button>
          </Tooltip>

          <Tooltip title="Browser Overlay Companion" description="Manage browser extension integration, floating media video overlay, and scrobble triggers.">
            <button
              onClick={() => setActiveTab('extension')}
              className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                activeTab === 'extension'
                  ? 'bg-cyan-600/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#111]/50'
              }`}
            >
              <Chrome className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              <span className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === 'extension' ? 'max-w-[200px] ml-2 opacity-100' : 'max-w-0 opacity-0'}`}>Browser Overlay Companion</span>
            </button>
          </Tooltip>

          <Tooltip title="Settings & API Keys" description="Configure API keys, OAuth tokens, Docker background sync interval, and cloud backup options.">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-gray-200 dark:bg-[#111] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-neutral-800'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#111]/50'
              }`}
            >
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === 'settings' ? 'max-w-[200px] ml-2 opacity-100' : 'max-w-0 opacity-0'}`}>Settings & API Keys</span>
            </button>
          </Tooltip>
        </nav>
      </div>
    </header>
  );
};

