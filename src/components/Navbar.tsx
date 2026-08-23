import React from 'react';
import { RefreshCw, Radio, Compass, ShieldAlert, Cpu, Settings, Layers, AlertTriangle, Tv, CheckCircle2, Monitor, Sun, Moon, Terminal, Server, Activity, Database, ExternalLink, Bookmark } from 'lucide-react';
import { AppSettings, BrowserExtensionState } from '../types';
import { Tooltip } from './Tooltip';
import { ASynXLogo } from './ASynXLogo';

interface NavbarProps {
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  isCustomizePanelOpen?: boolean;
  onToggleCustomizePanel?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  conflictCount: number;
  isSyncing: boolean;
  onTriggerSync: () => void;
  settings: AppSettings;
  extensionState: BrowserExtensionState;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

import { LayoutDashboard, Palette } from 'lucide-react';
export 
const Navbar: React.FC<NavbarProps> = ({ isEditMode, onToggleEditMode, isCustomizePanelOpen, onToggleCustomizePanel,
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
    <header className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl text-gray-900 dark:text-gray-100 sticky top-0 z-40 shadow-lg select-none transition-colors duration-300">
      {/* Fluent Command Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & App Info */}
        <div className="flex items-center space-x-3">
          <ASynXLogo 
            className="w-10 h-10 drop-shadow-[0_0_12px_rgba(99,102,241,0.4)]" 
            isSyncing={isSyncing} size={40} 
            onClick={onTriggerSync}
            title="Click logo to trigger manual ASynX sync"
          />
          <div>
            <div className="flex items-center space-x-2">
              <div className="flex flex-col">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center space-x-1.5">
                  <span className="text-gray-900 dark:text-white">ASynX</span>
                </h1>
                {settings.theme?.subheadingText && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                    {settings.theme.subheadingText}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="flex items-center space-x-2.5 ml-auto">
          

          {/* Theme Toggle Button */}
          <Tooltip title="Appearance Theme" description="Toggle between Dark Mode and Light Mode Fluent UI theme appearance." position="bottom-right">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-xl bg-gray-100/50 dark:bg-[#111]/50 border border-gray-300/50 dark:border-neutral-800/50 text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition cursor-pointer backdrop-blur-sm"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </Tooltip>

          

          {/* Trigger Sync Button */}
          <Tooltip title="Instant Full Sync" description="Trigger immediate cross-platform synchronization across all accounts and server database." position="bottom-right">
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
      <div className="bg-transparent" style={settings.theme?.subheaderColor ? { backgroundColor: settings.theme.subheaderColor } : {}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0.5 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          
          {/* Active Tab Display (Left aligned) */}
          <div className="flex items-center space-x-2 flex-shrink-0 text-gray-900 dark:text-gray-100 font-bold text-sm select-none py-1">
             {(() => {
                switch(activeTab) {
                  case 'matrix': return <><Layers className="w-5 h-5 text-indigo-500" /><span>Sync Matrix</span></>;
                  case 'conflicts': return <><AlertTriangle className="w-5 h-5 text-amber-500" /><span>Conflict Resolution</span></>;
                  case 'performance': return <><Activity className="w-5 h-5 text-purple-500" /><span>Sync Performance</span></>;
                  case 'plex': return <><Tv className="w-5 h-5 text-purple-500" /><span>Plex & Tautulli Automation</span></>;
                  case 'extension': return <><Compass className="w-5 h-5 text-cyan-500" /><span>Extension / Webhook State</span></>;
                  case 'settings': return <><Settings className="w-5 h-5 text-gray-500" /><span>Settings</span></>;
                  case 'database': return <><Database className="w-5 h-5 text-gray-900 dark:text-gray-100" /><span>Database Viewer</span></>;
                  case 'docker-backend': return <><Server className="w-5 h-5 text-blue-500" /><span>Docker Backend</span></>;
                  case 'health': return <><Activity className="w-5 h-5 text-emerald-500" /><span>System Health</span></>;
                  case 'bookmarks': return <><Bookmark className="w-5 h-5 text-pink-500" /><span>{settings?.nexusTabName || 'Bookmarks'}</span></>;
                  case 'api-docs': return <><Terminal className="w-5 h-5 text-emerald-500" /><span>API Documentation</span></>;
                  default: return null;
                }
             })()}
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            {/* Nav Buttons (Right aligned, icons only) */}
            <nav className="flex items-center space-x-1 flex-shrink-0">
               <Tooltip title="Sync Matrix" position="bottom">
                  <button onClick={() => setActiveTab('matrix')} className={`p-1.5 rounded-xl transition cursor-pointer ${activeTab === 'matrix' ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}><Layers className="w-4 h-4" /></button>
               </Tooltip>
               <Tooltip title="Conflict Resolution" position="bottom">
                  <button onClick={() => setActiveTab('conflicts')} className={`relative p-1.5 rounded-xl transition cursor-pointer ${activeTab === 'conflicts' ? 'bg-amber-600/20 text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
                    <AlertTriangle className="w-4 h-4" />
                    {conflictCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                  </button>
               </Tooltip>
               <Tooltip title="Sync Performance" position="bottom">
                  <button onClick={() => setActiveTab('performance')} className={`p-1.5 rounded-xl transition cursor-pointer ${activeTab === 'performance' ? 'bg-purple-600/20 text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}><Activity className="w-4 h-4" /></button>
               </Tooltip>
               <Tooltip title="Plex & Tautulli Automation" position="bottom">
                  <button onClick={() => setActiveTab('plex')} className={`p-1.5 rounded-xl transition cursor-pointer ${activeTab === 'plex' ? 'bg-purple-600/20 text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}><Tv className="w-4 h-4" /></button>
               </Tooltip>
               <Tooltip title="Extension / Webhook State" position="bottom">
                  <button onClick={() => setActiveTab('extension')} className={`p-1.5 rounded-xl transition cursor-pointer ${activeTab === 'extension' ? 'bg-cyan-600/20 text-cyan-600 dark:text-cyan-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}><Compass className="w-4 h-4" /></button>
               </Tooltip>
               <Tooltip title="Settings" position="bottom">
                  <button onClick={() => setActiveTab('settings')} className={`p-1.5 rounded-xl transition cursor-pointer ${activeTab === 'settings' ? 'bg-gray-200/80 dark:bg-[#111]/80 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}><Settings className="w-4 h-4" /></button>
               </Tooltip>
               <Tooltip title="Database" position="bottom">
                  <button onClick={() => setActiveTab('database')} className={`p-1.5 rounded-xl transition cursor-pointer ${activeTab === 'database' ? 'bg-gray-200/80 dark:bg-[#111]/80 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}><Database className="w-4 h-4" /></button>
               </Tooltip>
               <Tooltip title="Docker Backend" position="bottom">
                  <button onClick={() => setActiveTab('docker-backend')} className={`p-1.5 rounded-xl transition cursor-pointer ${activeTab === 'docker-backend' ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}><Server className="w-4 h-4" /></button>
               </Tooltip>
               <Tooltip title="System Health" position="bottom">
                  <button onClick={() => setActiveTab('health')} className={`p-1.5 rounded-xl transition cursor-pointer ${activeTab === 'health' ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}><Activity className="w-4 h-4" /></button>
               </Tooltip>
               <Tooltip title={settings?.nexusTabName || 'Bookmarks'} position="bottom">
                  <button onClick={() => setActiveTab('bookmarks')} className={`p-1.5 rounded-xl transition cursor-pointer ${activeTab === 'bookmarks' ? 'bg-pink-600/20 text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}><Bookmark className="w-4 h-4" /></button>
               </Tooltip>
               <Tooltip title="API Documentation" position="bottom">
                  <button onClick={() => setActiveTab('api-docs')} className={`p-1.5 rounded-xl transition cursor-pointer ${activeTab === 'api-docs' ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}><Terminal className="w-4 h-4" /></button>
               </Tooltip>
            
               {onToggleEditMode && (activeTab === 'matrix' || activeTab === 'health' || activeTab === 'performance') && (
                 <Tooltip title={isEditMode ? "Exit Layout Edit Mode" : "Customize Tab Layout"} position="bottom">
                    <button 
                      onClick={onToggleEditMode} 
                      className={`p-1.5 rounded-xl transition cursor-pointer ${isEditMode ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                    </button>
                 </Tooltip>
               )}
               {onToggleCustomizePanel && (
                 <Tooltip title="Quick Appearance Customizer" position="bottom">
                    <button 
                      onClick={onToggleCustomizePanel} 
                      className={`p-1.5 rounded-xl transition cursor-pointer ${isCustomizePanelOpen ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}
                    >
                      <Palette className="w-4 h-4" />
                    </button>
                 </Tooltip>
               )}
            </nav>

            {/* Live System Status Badges */}
            <div className="hidden xl:flex items-center space-x-2 bg-gray-50/50 dark:bg-[#111]/50 px-2 py-1 rounded-xl text-xs flex-shrink-0 backdrop-blur-md">
              {/* Simkl */}
              <div className="flex items-center space-x-1">
                <Tooltip title="Simkl Tracker Status" description="Real-time connection health. Click to view API requests dashboard." position="bottom-right">
                  <button 
                    onClick={() => setActiveTab('performance')}
                    className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors focus:outline-none"
                  >
                    <span className={`w-2 h-2 rounded-full ${settings?.simkl?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                  </button>
                </Tooltip>
                <a href="https://simkl.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors" title="Visit Simkl.com">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L22 20H2L12 2Z" fill="#FACC15" />
                  </svg>
                </a>
              </div>
              <span className="text-gray-300 dark:text-neutral-700">|</span>
              {/* MAL */}
              <div className="flex items-center space-x-1">
                <Tooltip title="MyAnimeList Status" description="Connected status for MyAnimeList. Click to view API requests dashboard." position="bottom-right">
                  <button 
                    onClick={() => setActiveTab('performance')}
                    className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors focus:outline-none"
                  >
                    <span className={`w-2 h-2 rounded-full ${settings?.mal?.connected ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
                  </button>
                </Tooltip>
                <a href="https://myanimelist.net" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors" title="Visit MyAnimeList.net">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#2E51A2" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="4" />
                    <text x="12" y="16" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">MAL</text>
                  </svg>
                </a>
              </div>
              <span className="text-gray-300 dark:text-neutral-700">|</span>
              {/* AniList */}
              <div className="flex items-center space-x-1">
                <Tooltip title="AniList Tracker Status" description="GraphQL API connection status for AniList. Click to view API requests dashboard." position="bottom-right">
                  <button 
                    onClick={() => setActiveTab('performance')}
                    className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors focus:outline-none"
                  >
                    <span className={`w-2 h-2 rounded-full ${settings?.anilist?.connected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                  </button>
                </Tooltip>
                <a href="https://anilist.co" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors" title="Visit AniList.co">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#02A9FF" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L22 22H17L15 17H9L7 22H2L12 2Z" />
                  </svg>
                </a>
              </div>
              <span className="text-gray-300 dark:text-neutral-700">|</span>
              {/* Plex Webhook */}
              <div className="flex items-center space-x-1">
                <Tooltip title="Docker Sync Daemon" description="Background daemon on server running automated cross-platform sync. Click to view API requests dashboard." position="bottom-right">
                  <button 
                    onClick={() => setActiveTab('performance')}
                    className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors focus:outline-none"
                  >
                    <span className={`w-2 h-2 rounded-full ${settings?.plex?.connected ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'}`} />
                  </button>
                </Tooltip>
                <a href="https://plex.tv" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors" title="Visit Plex.tv">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#E5A00D" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L22 7V17L12 22L2 17V7L12 2Z" />
                    <path d="M15 12L10 8V16L15 12Z" fill="#282A2D" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
