import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap, Compass, Settings, Calendar, Layers, AlertTriangle, Tv, Sun, Moon, Terminal, Server, Activity, Database, Bookmark, LayoutDashboard, Palette } from 'lucide-react';
import { AppSettings, BrowserExtensionState, NotificationItem } from '../types';
import NotificationTicker from './NotificationTicker';
import { Tooltip } from './Tooltip';
import { ASynXLogo } from './ASynXLogo';
import { LogoBanner } from './LogoBanner';


interface NavbarProps {
  isEditMode?: boolean;
  onSaveSettings?: (settings: AppSettings) => Promise<void>;
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
  notifications?: NotificationItem[];
}

export const Navbar: React.FC<NavbarProps> = ({

  isEditMode,
  onToggleEditMode,
  onSaveSettings,
  isCustomizePanelOpen,
  onToggleCustomizePanel,
  activeTab,
  setActiveTab,
  conflictCount,
  isSyncing,
  onTriggerSync,
  settings,
  isDarkMode,
  toggleDarkMode,
  notifications = [],
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [animPhase, setAnimPhase] = useState<'idle' | 'flying-right' | 'returning' | 'dropped'>('idle');
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeTabNode = (
    <>
      {(() => {
                switch(activeTab) {
                  case 'matrix': return <><Layers className="w-5 h-5 text-indigo-500" /><span>Sync Matrix</span></>;
                  case 'conflicts': return <><AlertTriangle className="w-5 h-5 text-amber-500" /><span>Conflict Resolution</span></>;
                  
                  case 'plex': return <><Tv className="w-5 h-5 text-purple-500" /><span>Plex & Tautulli Automation</span></>;
                  case 'extension': return <><Compass className="w-5 h-5 text-cyan-500" /><span>Extension / Webhook State</span></>;
                  case 'schedule': return <><Calendar className="w-5 h-5 text-fuchsia-500" /><span>Sync Schedule</span></>;
                  case 'settings': return <><Settings className="w-5 h-5 text-gray-500" /><span>Settings</span></>;
                  case 'database': return <><Database className="w-5 h-5 text-gray-900 dark:text-gray-100" /><span>Database Viewer</span></>;
                  case 'docker-backend': return <><Server className="w-5 h-5 text-blue-500" /><span>Docker Backend</span></>;
                  case 'health': return <><Activity className="w-5 h-5 text-emerald-500" /><span>System Health & Performance</span></>;
                  case 'bookmarks': return <><Bookmark className="w-5 h-5 text-pink-500" /><span>{settings?.nexusTabName || 'Bookmarks'}</span></>;
                  case 'api-docs': return <><Terminal className="w-5 h-5 text-emerald-500" /><span>API Documentation</span></>;
                  default: return null;
                }
             })()}
    </>
  );


  const toggleQuickSync = () => {
    if (onSaveSettings && settings) {
      onSaveSettings({
        ...settings,
        daemonSettings: {
          runOnStartup: settings.daemonSettings?.runOnStartup ?? false,
          autoScrobbleLocal: settings.daemonSettings?.autoScrobbleLocal ?? false,
          enableLocalMediaDetection: !settings.daemonSettings?.enableLocalMediaDetection
        }
      });
    }
  };

  const quickSyncEnabled = settings?.daemonSettings?.enableLocalMediaDetection;

  const quickSyncNode = (
    <motion.div layoutId="quickSyncNode" className="flex items-center">
      <Tooltip title="Quick Sync Daemon" description={quickSyncEnabled ? "Background Auto-Sync Active. Click to pause." : "Background Auto-Sync Paused. Click to resume."} position="bottom-right">
        <button 
          onClick={toggleQuickSync}
          className={`relative flex items-center justify-center p-1.5 rounded-xl transition cursor-pointer border ${quickSyncEnabled ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/20' : 'bg-gray-100/50 dark:bg-[#111]/50 border-gray-300/50 dark:border-neutral-800/50 text-gray-500 dark:text-gray-400 hover:text-cyan-500'}`}
        >
          <Zap className={`w-4 h-4 ${quickSyncEnabled ? 'fill-current animate-pulse' : ''}`} />
          {!isScrolled && (
            <span className="ml-1.5 text-xs font-semibold whitespace-nowrap overflow-hidden">
              {quickSyncEnabled ? 'Active' : 'Paused'}
            </span>
          )}
        </button>
      </Tooltip>
    </motion.div>
  );

  const themeToggleNode = (
    <motion.div layoutId="themeToggleNode" className="flex items-center">

    <Tooltip title="Appearance Theme" description="Toggle between Dark Mode and Light Mode Fluent UI theme appearance." position="bottom-right">
      <button
        onClick={toggleDarkMode}
        className="p-1.5 rounded-xl bg-gray-100/50 dark:bg-[#111]/50 border border-gray-300/50 dark:border-neutral-800/50 text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition cursor-pointer backdrop-blur-sm flex items-center justify-center"
      >
        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
               </Tooltip>
    </motion.div>
  );

  const isIconMode = isScrolled || animPhase === 'returning' || animPhase === 'dropped';
  const syncButtonNode = (
    <motion.div layoutId="syncButtonNode" className="flex items-center">

    <Tooltip title="Instant Full Sync" description="Trigger immediate cross-platform synchronization across all accounts and server database." position="bottom-right">
      <button
        onClick={onTriggerSync}
        disabled={isSyncing}
        className={`flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 active:from-indigo-700 active:to-purple-700 text-white font-bold shadow-md backdrop-blur-sm transition disabled:opacity-50 cursor-pointer ${isIconMode ? 'p-1.5' : 'px-4 py-1.5 text-xs'}`}
      >
        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        {!isIconMode && <span>{isSyncing ? 'Syncing...' : 'Sync All Now'}</span>}
      </button>
               </Tooltip>
    </motion.div>
  );

  return (
    <header className={`${settings?.theme?.navbarStyle === 'solid' ? 'bg-white dark:bg-[#0a0a0a]' : settings?.theme?.navbarStyle === 'transparent' ? 'bg-transparent' : 'bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl'} text-gray-900 dark:text-gray-100 sticky top-0 z-40 shadow-lg select-none transition-all duration-300`}>
      {/* Top Header / Merged Header */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 transition-all duration-300 ${(isScrolled && animPhase === 'dropped') ? 'py-1.5' : 'py-2.5'}`}>
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center space-x-2">
              <ASynXLogo size={64} isSyncing={isSyncing} onClick={() => window.location.reload()} />
              <Tooltip title="ASynX Dashboard" description="Cross-Platform Anime & Drama Sync Studio. Manage your connected integrations." position="bottom">
                <div>
                                    <LogoBanner
                    gradientColors={settings?.theme?.gradientColors}
                    accentColor={settings?.theme?.accentColor}
                    isScrolled={isScrolled}
                    isSyncing={isSyncing}
                    onAnimationPhaseChange={setAnimPhase}
                  />
                </div>
              </Tooltip>
              <AnimatePresence>
                {(isScrolled && (animPhase === 'returning' || animPhase === 'dropped')) && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                    transition={{ duration: 0.6, delay: animPhase === 'returning' ? 0.2 : 0 }}
                    className="flex items-center space-x-2 text-gray-900 dark:text-gray-100 font-bold ml-4 hidden sm:flex"
                  >
                    <span className="w-px h-6 bg-gray-200 dark:bg-neutral-800 mx-2 hidden sm:block"></span>
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center space-x-2">{activeTabNode}</div>
                      <NotificationTicker notifications={notifications} isScrolled={true} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 ml-auto">
          <AnimatePresence>
            {(!isScrolled || animPhase === 'flying-right' || animPhase === 'returning') && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2.5"
              >
                {quickSyncNode}
                
                {syncButtonNode}
              </motion.div>
            )}
          </AnimatePresence>
          
          
          {(isScrolled && animPhase === 'dropped') && (
            <div className="flex items-center space-x-4">
                          <nav className="flex items-center space-x-1 flex-shrink-0">

                
               <motion.button layoutId="tab-matrix" onClick={() => setActiveTab('matrix')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'matrix' ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Layers className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Sync Matrix'}
  </span>
</motion.button>

               <motion.button layoutId="tab-schedule" onClick={() => setActiveTab('schedule')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'schedule' ? 'bg-fuchsia-600/20 text-fuchsia-600 dark:text-fuchsia-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Calendar className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Sync Schedule'}
  </span>
</motion.button>
               <motion.button layoutId="tab-conflicts" onClick={() => setActiveTab('conflicts')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'conflicts' ? 'bg-amber-600/20 text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {conflictCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Conflict Resolution'}
  </span>
</motion.button>
               
               <motion.button layoutId="tab-plex" onClick={() => setActiveTab('plex')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'plex' ? 'bg-purple-600/20 text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Tv className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Plex & Tautulli Automation'}
  </span>
</motion.button>
               <motion.button layoutId="tab-extension" onClick={() => setActiveTab('extension')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'extension' ? 'bg-cyan-600/20 text-cyan-600 dark:text-cyan-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Compass className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Extension / Webhook State'}
  </span>
</motion.button>
               <motion.button layoutId="tab-settings" onClick={() => setActiveTab('settings')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'settings' ? 'bg-gray-200/80 dark:bg-[#111]/80 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Settings className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Settings'}
  </span>
</motion.button>
               <motion.button layoutId="tab-database" onClick={() => setActiveTab('database')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'database' ? 'bg-gray-200/80 dark:bg-[#111]/80 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Database className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Database'}
  </span>
</motion.button>
               <motion.button layoutId="tab-docker-backend" onClick={() => setActiveTab('docker-backend')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'docker-backend' ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Server className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Docker Backend'}
  </span>
</motion.button>
               <motion.button layoutId="tab-health" onClick={() => setActiveTab('health')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'health' ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Activity className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'System Health & Performance'}
  </span>
</motion.button>
               <motion.button layoutId="tab-bookmarks" onClick={() => setActiveTab('bookmarks')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'bookmarks' ? 'bg-pink-600/20 text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Bookmark className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {settings?.nexusTabName || 'Bookmarks'}
  </span>
</motion.button>
               <motion.button layoutId="tab-api-docs" onClick={() => setActiveTab('api-docs')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'api-docs' ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Terminal className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'API Documentation'}
  </span>
</motion.button>
            
               {onToggleEditMode && (activeTab === 'matrix' || activeTab === 'health') && (
                 <motion.button layoutId="tab" onClick={onToggleEditMode} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${isEditMode ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {isEditMode ? "Exit Layout Edit Mode" : "Customize Tab Layout"}
  </span>
</motion.button>
               )}
               {onToggleCustomizePanel && (
                 <motion.button layoutId="tab" onClick={onToggleCustomizePanel} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${isCustomizePanelOpen ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Palette className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Quick Appearance Customizer'}
  </span>
</motion.button>
               )}
            
              
            </nav>
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-300 dark:border-neutral-700">
              {quickSyncNode}
              
              {syncButtonNode}
            </div>

              
            </div>
          )}
        </div>
      </div>

      {/* Windows 11 Fluent Tab Bar (Hidden on scroll) */}
      <div 
        className={`transition-all duration-300 overflow-hidden ${(isScrolled && animPhase === 'dropped') ? 'max-h-0 opacity-0' : 'max-h-16 opacity-100 bg-transparent'}`} 
        style={settings?.theme?.subheaderColor && !isScrolled ? { backgroundColor: settings?.theme?.subheaderColor } : {}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <div className="flex flex-col justify-center space-y-0 text-gray-900 dark:text-gray-100 font-bold text-sm select-none">
             <div className="flex items-center space-x-2">{activeTabNode}</div>
             <NotificationTicker notifications={notifications} isScrolled={false} />
          </div>
          <div className="flex items-center space-x-4 ml-auto">
                      {!(isScrolled && animPhase === 'dropped') && (<>
                      <nav className="flex items-center space-x-1 flex-shrink-0">

               
               <motion.button layoutId="tab-matrix" onClick={() => setActiveTab('matrix')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'matrix' ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Layers className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Sync Matrix'}
  </span>
</motion.button>
               <motion.button layoutId="tab-conflicts" onClick={() => setActiveTab('conflicts')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'conflicts' ? 'bg-amber-600/20 text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {conflictCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Conflict Resolution'}
  </span>
</motion.button>
               
               <motion.button layoutId="tab-plex" onClick={() => setActiveTab('plex')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'plex' ? 'bg-purple-600/20 text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Tv className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Plex & Tautulli Automation'}
  </span>
</motion.button>
               <motion.button layoutId="tab-extension" onClick={() => setActiveTab('extension')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'extension' ? 'bg-cyan-600/20 text-cyan-600 dark:text-cyan-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Compass className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Extension / Webhook State'}
  </span>
</motion.button>
               <motion.button layoutId="tab-settings" onClick={() => setActiveTab('settings')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'settings' ? 'bg-gray-200/80 dark:bg-[#111]/80 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Settings className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Settings'}
  </span>
</motion.button>
               <motion.button layoutId="tab-database" onClick={() => setActiveTab('database')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'database' ? 'bg-gray-200/80 dark:bg-[#111]/80 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Database className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Database'}
  </span>
</motion.button>
               <motion.button layoutId="tab-docker-backend" onClick={() => setActiveTab('docker-backend')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'docker-backend' ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Server className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Docker Backend'}
  </span>
</motion.button>
               <motion.button layoutId="tab-health" onClick={() => setActiveTab('health')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'health' ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Activity className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'System Health & Performance'}
  </span>
</motion.button>
               <motion.button layoutId="tab-bookmarks" onClick={() => setActiveTab('bookmarks')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'bookmarks' ? 'bg-pink-600/20 text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Bookmark className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {settings?.nexusTabName || 'Bookmarks'}
  </span>
</motion.button>
               <motion.button layoutId="tab-api-docs" onClick={() => setActiveTab('api-docs')} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${activeTab === 'api-docs' ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Terminal className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'API Documentation'}
  </span>
</motion.button>
            
               {onToggleEditMode && (activeTab === 'matrix' || activeTab === 'health') && (
                 <motion.button layoutId="tab" onClick={onToggleEditMode} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${isEditMode ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {isEditMode ? "Exit Layout Edit Mode" : "Customize Tab Layout"}
  </span>
</motion.button>
               )}
               {onToggleCustomizePanel && (
                 <motion.button layoutId="tab" onClick={onToggleCustomizePanel} className={`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${isCustomizePanelOpen ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}`}>
  <Palette className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Quick Appearance Customizer'}
  </span>
</motion.button>
               )}
            
            
            </nav>

           </>)}
          </div>
        </div>
      </div>
    </header>
  );
};
