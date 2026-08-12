import React from 'react';
import { RefreshCw, Radio, Chrome, ShieldAlert, Cpu, Settings, Layers, AlertTriangle, Tv, CheckCircle2, Monitor } from 'lucide-react';
import { AppSettings, BrowserExtensionState } from '../types';

interface NavbarProps {
  activeTab: 'matrix' | 'conflicts' | 'plex' | 'extension' | 'settings';
  setActiveTab: (tab: 'matrix' | 'conflicts' | 'plex' | 'extension' | 'settings') => void;
  conflictCount: number;
  isSyncing: boolean;
  onTriggerSync: () => void;
  settings: AppSettings;
  extensionState: BrowserExtensionState;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  conflictCount,
  isSyncing,
  onTriggerSync,
  settings,
  extensionState
}) => {
  return (
    <header className="bg-slate-900/95 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-lg select-none">
      {/* Fluent Command Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & App Info */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center space-x-1.5">
                <span>AniSync Matrix</span>
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                Win11 App v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Simkl • MyAnimeList • AniList • Plex • Tautulli Local Companion
            </p>
          </div>
        </div>

        {/* Live System Status Badges */}
        <div className="hidden xl:flex items-center space-x-3 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          {/* Simkl */}
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${settings.simkl.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="font-semibold text-slate-300 text-[11px]">Simkl</span>
          </div>
          <span className="text-slate-800">|</span>

          {/* MAL */}
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${settings.mal.connected ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="font-semibold text-slate-300 text-[11px]">MAL</span>
          </div>
          <span className="text-slate-800">|</span>

          {/* AniList */}
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${settings.anilist.connected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="font-semibold text-slate-300 text-[11px]">AniList</span>
          </div>
          <span className="text-slate-800">|</span>

          {/* Plex Webhook */}
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${settings.plex.connected ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="font-semibold text-slate-300 text-[11px]">Plex Daemon</span>
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Extension Companion Button */}
          <button 
            onClick={() => setActiveTab('extension')}
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              extensionState.installed 
                ? 'bg-slate-800/90 border-indigo-500/30 text-indigo-300 hover:bg-slate-800' 
                : 'bg-slate-800/40 border-slate-700 text-slate-400'
            }`}
          >
            <Chrome className="w-3.5 h-3.5 text-indigo-400" />
            <span>Browser Overlay</span>
            {extensionState.currentMedia?.isPlaying && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          {/* Trigger Sync Button */}
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:from-indigo-700 active:to-purple-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync All Now'}</span>
          </button>
        </div>
      </div>

      {/* Windows 11 Fluent Tab Bar */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <nav className="max-w-7xl mx-auto flex space-x-1 sm:space-x-2 overflow-x-auto py-1.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Sync Matrix & Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('conflicts')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap relative ${
              activeTab === 'conflicts'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Conflict Resolution</span>
            {conflictCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold animate-pulse">
                {conflictCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('plex')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'plex'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Tv className="w-4 h-4 text-purple-400" />
            <span>Plex & Tautulli Automation</span>
          </button>

          <button
            onClick={() => setActiveTab('extension')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'extension'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Chrome className="w-4 h-4 text-cyan-400" />
            <span>Browser Overlay Companion</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-slate-100 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings & API Keys</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
