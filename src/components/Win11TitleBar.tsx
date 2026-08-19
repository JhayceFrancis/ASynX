import React, { useState } from 'react';
import { Minus, Square, X, RefreshCw, Layers, Shield, Wifi } from 'lucide-react';
import { ASynXLogo } from './ASynXLogo';

interface Win11TitleBarProps {
  appName?: string;
  isSyncing?: boolean;
  onTriggerSync?: () => void;
  progress?: number;
}

export const Win11TitleBar: React.FC<Win11TitleBarProps> = ({
  appName = "ASynX Studio",
  isSyncing = false,
  onTriggerSync,
  progress
}) => {
  const [isMaximized, setIsMaximized] = useState(true);
  const [windowVisible, setWindowVisible] = useState(true);

  if (!windowVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-[#0a0a0a] border border-indigo-500/40 text-gray-900 dark:text-gray-100 p-3 rounded-2xl shadow-2xl flex items-center space-x-3 backdrop-blur-lg">
        <ASynXLogo className="w-8 h-8 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" animated={isSyncing} onClick={onTriggerSync} />
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
        <ASynXLogo className="w-5 h-5 drop-shadow-[0_0_4px_rgba(99,102,241,0.5)]" animated={isSyncing} onClick={onTriggerSync} />
        <span className="font-semibold text-gray-800 dark:text-gray-200 tracking-tight text-[11px] sm:text-xs">
          {appName}
        </span>
        <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 text-[10px] text-gray-600 dark:text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Windows 11 App • x64</span>
        </span>
      </div>

      {/* Middle: Subtle Search/Drag Handle */}
      <div className="hidden lg:flex items-center space-x-2 text-[11px] text-gray-500 dark:text-gray-500 font-mono bg-white dark:bg-[#0a0a0a]/60 px-3 py-0.5 rounded-md border border-gray-200 dark:border-neutral-900/60">
        <Wifi className="w-3 h-3 text-emerald-400" />
        <span>Sync Service: Running (127.0.0.1:3000)</span>
      </div>

      {/* Right: Windows Controls */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => setWindowVisible(false)}
          title="Minimize to System Tray"
          className="w-8 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:bg-[#111]/80 text-gray-600 dark:text-gray-400 hover:text-white transition cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setIsMaximized(!isMaximized)}
          title={isMaximized ? "Restore Window" : "Maximize Window"}
          className="w-8 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:bg-[#111]/80 text-gray-600 dark:text-gray-400 hover:text-white transition cursor-pointer"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={() => setWindowVisible(false)}
          title="Close (Minimize to Tray)"
          className="w-8 h-6 flex items-center justify-center rounded hover:bg-rose-600 text-gray-600 dark:text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
