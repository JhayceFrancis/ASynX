import React from 'react';
import { RefreshCw, Radio, Compass, ShieldAlert, Cpu, Settings, Layers, AlertTriangle, Tv, CheckCircle2, Monitor, Sun, Moon, Terminal, Server, Activity, Database } from 'lucide-react';
import { AppSettings, BrowserExtensionState } from '../types';
import { ASynXLogo } from './ASynXLogo';
import { Tooltip } from './Tooltip';

interface NavbarProps {
  activeTab: 'matrix' | 'conflicts' | 'plex' | 'extension' | 'settings' | 'api-docs' | 'docker-backend' | 'performance' | 'database';
  setActiveTab: (tab: 'matrix' | 'conflicts' | 'plex' | 'extension' | 'settings' | 'api-docs' | 'docker-backend' | 'performance' | 'database') => void;
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
    <header className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-gray-200 dark:border-neutral-900/80 text-gray-900 dark:text-gray-100 sticky top-0 z-40 shadow-lg select-none transition-colors duration-300">
      {/* Fluent Command Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & App Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center">
            <ASynXLogo 
              className="w-10 h-10 drop-shadow-[0_0_12px_rgba(99,102,241,0.4)]" 
              animated={isSyncing} 
              onClick={onTriggerSync}
              title="Click logo to trigger manual ASynX sync"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center space-x-1.5">
                <span className="text-gray-900 dark:text-white">ASynX</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="flex items-center space-x-2.5 ml-auto">
          {/* Theme Toggle Button */}
          <Tooltip title="Appearance Theme" description="Toggle between Dark Mode and Light Mode Fluent UI theme appearance." position="bottom">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-xl bg-gray-100/50 dark:bg-[#111]/50 border border-gray-300/50 dark:border-neutral-800/50 text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition cursor-pointer backdrop-blur-sm"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </Tooltip>

          {/* Extension Companion Button */}
          <Tooltip title="Browser Extension Status" description="Inspect live media playback detection and browser overlay status." position="bottom">
            <button 
              onClick={() => setActiveTab('extension')}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer backdrop-blur-sm ${
                extensionState.installed 
                  ? 'bg-gray-100/50 dark:bg-[#111]/80 border-indigo-500/30 text-indigo-500 dark:text-indigo-300 hover:bg-gray-200/50 dark:hover:bg-[#111]' 
                  : 'bg-gray-100/30 dark:bg-[#111]/30 border-gray-300/50 dark:border-neutral-800/50 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
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
              className="flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 active:from-indigo-700 active:to-purple-700 text-white font-bold text-xs shadow-md backdrop-blur-sm transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync All Now'}</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Windows 11 Fluent Tab Bar */}
      <div className="border-t border-gray-200 dark:border-neutral-900/50 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-1.5 gap-4 overflow-x-auto scrollbar-none">
          <nav className="flex items-center space-x-2 flex-shrink-0">
            {/* --- GROUP 1: Core Sync & Conflicts --- */}
            <div className="flex items-center space-x-1 sm:space-x-2 border-r border-gray-300 dark:border-neutral-800 pr-2 sm:pr-3">
              <Tooltip title="Sync Matrix & Dashboard" description="View unified media progress matrix, activity analytics charts, and trigger manual overrides.">
                <button
                  onClick={() => setActiveTab('matrix')}
                  className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    activeTab === 'matrix'
                      ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-[#111]/50'
                  }`}
                >
                  <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === 'matrix' ? 'max-w-[200px] ml-2 opacity-100' : 'max-w-0 opacity-0'}`}>Sync Matrix</span>
                </button>
              </Tooltip>

              <Tooltip title="Conflict Resolution" description="Resolve metadata mismatches and playback progress conflicts between external trackers.">
                <button
                  onClick={() => setActiveTab('conflicts')}
                  className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap relative ${
                    activeTab === 'conflicts'
                      ? 'bg-amber-600/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-[#111]/50'
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

              <Tooltip title="Sync Performance" description="Visualize synchronization latency, success rates, and failure history over time.">
                <button
                  onClick={() => setActiveTab('performance')}
                  className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    activeTab === 'performance'
                      ? 'bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-[#111]/50'
                  }`}
                >
                  <Activity className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  <span className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === 'performance' ? 'max-w-[200px] ml-2 opacity-100' : 'max-w-0 opacity-0'}`}>Sync Performance</span>
                </button>
              </Tooltip>
            </div>

            {/* --- GROUP 2: Automations --- */}
            <div className="flex items-center space-x-1 sm:space-x-2 border-r border-gray-300 dark:border-neutral-800 pr-2 sm:pr-3">
              <Tooltip title="Plex & Tautulli Automation" description="Configure Plex webhooks, Tautulli notification triggers, and test media playback matching.">
                <button
                  onClick={() => setActiveTab('plex')}
                  className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    activeTab === 'plex'
                      ? 'bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-[#111]/50'
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
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-[#111]/50'
                  }`}
                >
                  <Compass className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                  <span className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === 'extension' ? 'max-w-[200px] ml-2 opacity-100' : 'max-w-0 opacity-0'}`}>Browser Overlay Companion</span>
                </button>
              </Tooltip>
            </div>

            {/* --- GROUP 3: Settings & System --- */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Tooltip title="Settings & API Keys" description="Configure API keys, OAuth tokens, Docker background sync interval, and cloud backup options.">
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    activeTab === 'settings'
                      ? 'bg-gray-200/80 dark:bg-[#111]/80 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-neutral-700'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-[#111]/50'
                  }`}
                >
                  <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === 'settings' ? 'max-w-[200px] ml-2 opacity-100' : 'max-w-0 opacity-0'}`}>Settings</span>
                </button>
              </Tooltip>

              <Tooltip title="Database Viewer" description="View raw data in a read-only SQLite-style table viewer.">
                <button
                  onClick={() => setActiveTab('database')}
                  className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    activeTab === 'database'
                      ? 'bg-gray-200/80 dark:bg-[#111]/80 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-neutral-700'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-[#111]/50'
                  }`}
                >
                  <Database className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === 'database' ? 'max-w-[200px] ml-2 opacity-100' : 'max-w-0 opacity-0'}`}>Database</span>
                </button>
              </Tooltip>

              <Tooltip title="API Documentation" description="Integrate custom scripts and view ASynX endpoints for external connectivity.">
                <button
                  onClick={() => setActiveTab('api-docs')}
                  className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    activeTab === 'api-docs'
                      ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-[#111]/50'
                  }`}
                >
                  <Terminal className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === 'api-docs' ? 'max-w-[200px] ml-2 opacity-100' : 'max-w-0 opacity-0'}`}>API Documentation</span>
                </button>
              </Tooltip>

              <Tooltip title="Docker Backend" description="Monitor the self-hosted Express server, Node telemetry, and daemon cycles.">
                <button
                  onClick={() => setActiveTab('docker-backend')}
                  className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    activeTab === 'docker-backend'
                      ? 'bg-blue-600/20 text-blue-600 dark:text-blue-300 border border-blue-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-[#111]/50'
                  }`}
                >
                  <Server className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === 'docker-backend' ? 'max-w-[200px] ml-2 opacity-100' : 'max-w-0 opacity-0'}`}>Docker Backend</span>
                </button>
              </Tooltip>
            </div>
          </nav>

          {/* Live System Status Badges (Moved here) */}
          <div className="hidden xl:flex items-center space-x-3 bg-gray-50/50 dark:bg-[#111]/50 px-3 py-1.5 rounded-xl border border-gray-200/50 dark:border-neutral-800/50 text-xs flex-shrink-0 backdrop-blur-md ml-4">
            {/* Simkl */}
            <Tooltip title="Simkl Tracker Status" description="Real-time connection health and sync readiness with Simkl service. Click to view API requests dashboard.">
              <button 
                onClick={() => setActiveTab('performance')}
                className="flex items-center space-x-1.5 cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 px-1.5 py-0.5 rounded transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${settings.simkl.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-[11px]">Simkl</span>
              </button>
            </Tooltip>
            <span className="text-gray-300 dark:text-neutral-700">|</span>

            {/* MAL */}
            <Tooltip title="MyAnimeList Status" description="Connected status for MyAnimeList account synchronization. Click to view API requests dashboard.">
              <button 
                onClick={() => setActiveTab('performance')}
                className="flex items-center space-x-1.5 cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 px-1.5 py-0.5 rounded transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${settings.mal.connected ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-[11px]">MAL</span>
              </button>
            </Tooltip>
            <span className="text-gray-300 dark:text-neutral-700">|</span>

            {/* AniList */}
            <Tooltip title="AniList Tracker Status" description="GraphQL API connection and active bearer token status for AniList. Click to view API requests dashboard.">
              <button 
                onClick={() => setActiveTab('performance')}
                className="flex items-center space-x-1.5 cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 px-1.5 py-0.5 rounded transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${settings.anilist.connected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-[11px]">AniList</span>
              </button>
            </Tooltip>
            <span className="text-gray-300 dark:text-neutral-700">|</span>

            {/* Plex Webhook */}
            <Tooltip title="Docker Sync Daemon" description="Background daemon on server running automated cross-platform sync cycles. Click to view API requests dashboard.">
              <button 
                onClick={() => setActiveTab('performance')}
                className="flex items-center space-x-1.5 cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 px-1.5 py-0.5 rounded transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${settings.plex.connected ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-[11px]">Docker Daemon</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
};
