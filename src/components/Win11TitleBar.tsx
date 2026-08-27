import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Wifi } from 'lucide-react';
import { ASynXLogo } from './ASynXLogo';
import { Tooltip } from './Tooltip';
import { AppSettings } from '../types';

interface Win11TitleBarProps {
  appName?: string;
  isSyncing?: boolean;
  isOffline?: boolean;
  onTriggerSync?: () => void;
  progress?: number;
  settings?: AppSettings;
  setActiveTab?: (tab: string) => void;
}

export const Win11TitleBar: React.FC<Win11TitleBarProps> = ({
  appName = "ASynX Studio",
  isSyncing = false,
  onTriggerSync,
  progress,
  settings
}) => {
  const [isMaximized, setIsMaximized] = useState(true);
  const [windowVisible, setWindowVisible] = useState(true);
  const [serverPort, setServerPort] = useState<string | number>('...');

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setServerPort(data.port))
      .catch(() => setServerPort('ERROR'));
  }, []);

  if (!windowVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-[#0a0a0a] border border-indigo-500/40 text-gray-900 dark:text-gray-100 p-3 rounded-2xl shadow-2xl flex items-center space-x-3 backdrop-blur-lg">
        <ASynXLogo size={32} isSyncing={isSyncing} className={`drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] ${isSyncing ? 'animate-spin' : ''}`} onClick={onTriggerSync} />
        <div>
          <p className="text-xs font-bold">{appName}</p>
          <p className="text-[10px] text-gray-600 dark:text-gray-400">Minimized to Windows System Tray</p>
        </div>
        <button
          onClick={() => setWindowVisible(true)}
          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition"
        >
          Restore Window
        </button>
      </div>
    );
  }

  return (
    <div className="win11-titlebar-container relative bg-gray-50 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-neutral-900/90 text-gray-700 dark:text-gray-300 select-none flex items-center justify-between px-3 py-1.5 text-xs font-sans rounded-t-2xl">
      {/* Subtle Progress Bar */}
      {isSyncing && (
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-transparent overflow-hidden rounded-b-xl z-50">
          <div 
            className="h-full bg-indigo-500 rounded-full"
            style={
              progress !== undefined 
                ? { width: `${progress}%`, transition: 'width 300ms ease-in-out' }
                : { 
                    width: '30%', 
                    position: 'relative', 
                    animation: 'asynx-indeterminate 1.5s infinite linear' 
                  }
            }
          />
          <style>{`
            @keyframes asynx-indeterminate {
              0% { left: -30%; width: 30%; }
              50% { left: 30%; width: 50%; }
              100% { left: 100%; width: 30%; }
            }
          `}</style>
        </div>
      )}

      {/* Left: Window Icon & Title */}
      <div className="flex items-center space-x-2.5">
        <Tooltip title="ASynX Logo" description="Click to trigger manual sync." position="bottom">
          <div>
            <ASynXLogo size={20} isSyncing={isSyncing} className={`drop-shadow-[0_0_4px_rgba(99,102,241,0.5)] ${isSyncing ? 'animate-spin' : ''}`} onClick={onTriggerSync} />
          </div>
        </Tooltip>
        <Tooltip title="Application Title" description={appName} position="bottom">
          <span className="font-semibold text-gray-800 dark:text-gray-200 tracking-tight text-[11px] sm:text-xs">
            {appName}
          </span>
        </Tooltip>
      </div>

      {/* Middle: Subtle Search/Drag Handle */}
      <div className="hidden lg:flex items-center space-x-2 text-[11px] text-gray-500 dark:text-gray-500 font-mono bg-white dark:bg-[#0a0a0a]/60 px-3 py-0.5 rounded-md border border-gray-200 dark:border-neutral-900/60">
        <Wifi className="w-3 h-3 text-emerald-400" />
        <span>Sync Service: {serverPort === 'ERROR' ? 'Disconnected' : `Running (localhost:${serverPort})`}</span>
      </div>

      {/* Right: Health Indicators, Platform Info & Windows Controls */}
      <div className="flex items-center space-x-3">
        {/* Windows 11 App Info */}
        <Tooltip title="Architecture Info" description="Running as a native-like Windows 11 application." position="bottom">
          <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 text-[10px] text-gray-600 dark:text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Windows 11 App • x64</span>
          </span>
        </Tooltip>

        {/* Windows Controls */}
        <div className="flex items-center space-x-1 pl-2 border-l border-gray-300 dark:border-neutral-700">
          <Tooltip title="Minimize" position="bottom-right">
            <button
              onClick={() => setWindowVisible(false)}
              className="w-8 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-[#222] text-gray-600 dark:text-gray-400 transition cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          <Tooltip title={isMaximized ? "Restore" : "Maximize"} position="bottom-right">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-8 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-[#222] text-gray-600 dark:text-gray-400 transition cursor-pointer"
            >
              <Square className="w-3 h-3" />
            </button>
          </Tooltip>
          <Tooltip title="Close" position="bottom-right">
            <button
              onClick={() => setWindowVisible(false)}
              className="w-8 h-6 flex items-center justify-center rounded hover:bg-rose-600 hover:text-white text-gray-600 dark:text-gray-400 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
