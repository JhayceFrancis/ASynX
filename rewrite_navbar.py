import re

with open('navbar_backup.tsx', 'r') as f:
    content = f.read()

active_tab_match = re.search(r'\{\(\(\) => \{\s*switch\(activeTab\) \{.*?\}\s*\}\)\(\)\}', content, re.DOTALL)
active_tab_code = active_tab_match.group(0)

nav_buttons_match = re.search(r'<nav className="flex items-center space-x-1 flex-shrink-0">(.*?)</nav>', content, re.DOTALL)
nav_buttons_code = nav_buttons_match.group(1)

status_badges_match = re.search(r'<div className="hidden xl:flex items-center space-x-2 bg-gray-50/50 dark:bg-\[\#111\]/50 px-2 py-1 rounded-xl text-xs flex-shrink-0 backdrop-blur-md">(.*?)</div>\s*</div>\s*</div>\s*</div>\s*</header>', content, re.DOTALL)
status_badges_code = status_badges_match.group(1)

template = """import React, { useState, useEffect } from 'react';
import { RefreshCw, Radio, Compass, ShieldAlert, Cpu, Settings, Layers, AlertTriangle, Tv, CheckCircle2, Monitor, Sun, Moon, Terminal, Server, Activity, Database, ExternalLink, Bookmark, LayoutDashboard, Palette } from 'lucide-react';
import { AppSettings, BrowserExtensionState } from '../types';
import { Tooltip } from './Tooltip';
import { ASynXLogo } from './ASynXLogo';
import { AnimatedASynXBanner } from './AnimatedASynXBanner';

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

export const Navbar: React.FC<NavbarProps> = ({
  isEditMode,
  onToggleEditMode,
  isCustomizePanelOpen,
  onToggleCustomizePanel,
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
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeTabNode = (
    __ACTIVE_TAB_CODE__
  );

  const themeToggleNode = (
    <Tooltip title="Appearance Theme" description="Toggle between Dark Mode and Light Mode Fluent UI theme appearance." position="bottom-right">
      <button
        onClick={toggleDarkMode}
        className="p-1.5 rounded-xl bg-gray-100/50 dark:bg-[#111]/50 border border-gray-300/50 dark:border-neutral-800/50 text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition cursor-pointer backdrop-blur-sm flex items-center justify-center"
      >
        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </Tooltip>
  );

  const syncButtonNode = (
    <Tooltip title="Instant Full Sync" description="Trigger immediate cross-platform synchronization across all accounts and server database." position="bottom-right">
      <button
        onClick={onTriggerSync}
        disabled={isSyncing}
        className={`flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 active:from-indigo-700 active:to-purple-700 text-white font-bold shadow-md backdrop-blur-sm transition disabled:opacity-50 cursor-pointer ${isScrolled ? 'p-1.5' : 'px-4 py-1.5 text-xs'}`}
      >
        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        {!isScrolled && <span>{isSyncing ? 'Syncing...' : 'Sync All Now'}</span>}
      </button>
    </Tooltip>
  );

  return (
    <header className={`${settings?.theme?.navbarStyle === 'solid' ? 'bg-white dark:bg-[#0a0a0a]' : settings?.theme?.navbarStyle === 'transparent' ? 'bg-transparent' : 'bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl'} text-gray-900 dark:text-gray-100 sticky top-0 z-40 shadow-lg select-none transition-all duration-300`}>
      {/* Top Header / Merged Header */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 transition-all duration-300 ${isScrolled ? 'py-1.5' : 'py-2.5'}`}>
        <div className="flex items-center space-x-4">
          <ASynXLogo 
             className={`drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300 ${isScrolled ? 'w-10 h-10' : 'w-14 h-14'}`}
             isSyncing={isSyncing} size={isScrolled ? 40 : 56} 
             onClick={onTriggerSync}
             title="Click logo to trigger manual ASynX sync"
          />
          <div>
            <div className="flex items-center space-x-2">
              <AnimatedASynXBanner
                gradientColors={settings?.theme?.gradientColors}
                accentColor={settings?.theme?.accentColor}
                subheadingText={settings?.theme?.subheadingText}
                isScrolled={isScrolled}
                tabTitleNode={isScrolled ? activeTabNode : null}
                themeToggleNode={isScrolled ? themeToggleNode : null}
                syncButtonNode={isScrolled ? syncButtonNode : null}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 ml-auto">
          {!isScrolled && (
            <div className="flex items-center space-x-2.5">
              {themeToggleNode}
              {syncButtonNode}
            </div>
          )}
          
          {isScrolled && (
            <div className="flex items-center space-x-4">
              <nav className="flex items-center space-x-1 flex-shrink-0">
                __NAV_BUTTONS_CODE__
              </nav>
              <div className="hidden xl:flex items-center space-x-2 bg-gray-50/50 dark:bg-[#111]/50 px-2 py-1 rounded-xl text-xs flex-shrink-0 backdrop-blur-md">
                __STATUS_BADGES_CODE__
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Windows 11 Fluent Tab Bar (Hidden on scroll) */}
      <div 
        className={`transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-16 opacity-100 bg-transparent'}`} 
        style={settings?.theme?.subheaderColor && !isScrolled ? { backgroundColor: settings?.theme?.subheaderColor } : {}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0.5 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-2 flex-shrink-0 text-gray-900 dark:text-gray-100 font-bold text-sm select-none py-1">
             {activeTabNode}
          </div>
          <div className="flex items-center space-x-4 ml-auto">
            <nav className="flex items-center space-x-1 flex-shrink-0">
               __NAV_BUTTONS_CODE__
            </nav>
            <div className="hidden xl:flex items-center space-x-2 bg-gray-50/50 dark:bg-[#111]/50 px-2 py-1 rounded-xl text-xs flex-shrink-0 backdrop-blur-md">
              __STATUS_BADGES_CODE__
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
"""

new_content = template.replace('__ACTIVE_TAB_CODE__', active_tab_code)
new_content = new_content.replace('__NAV_BUTTONS_CODE__', nav_buttons_code)
new_content = new_content.replace('__STATUS_BADGES_CODE__', status_badges_code)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(new_content)

print("Navbar.tsx rewritten successfully.")
