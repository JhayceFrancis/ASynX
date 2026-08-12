import React, { useState } from 'react';
import { Minus, Square, X, RefreshCw, Layers, Shield, Wifi } from 'lucide-react';

interface Win11TitleBarProps {
  appName?: string;
  isSyncing?: boolean;
  onTriggerSync?: () => void;
}

export const Win11TitleBar: React.FC<Win11TitleBarProps> = ({
  appName = "AniSync Matrix Studio",
  isSyncing = false,
  onTriggerSync
}) => {
  const [isMaximized, setIsMaximized] = useState(true);
  const [windowVisible, setWindowVisible] = useState(true);

  if (!windowVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-indigo-500/40 text-slate-100 p-3 rounded-2xl shadow-2xl flex items-center space-x-3 backdrop-blur-lg">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <RefreshCw className="w-4 h-4 text-white animate-spin-slow" />
        </div>
        <div>
          <p className="text-xs font-bold">{appName}</p>
          <p className="text-[10px] text-slate-400">Minimized to Windows System Tray</p>
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
    <div className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/90 text-slate-300 select-none flex items-center justify-between px-3 py-1.5 text-xs font-sans rounded-t-2xl">
      {/* Left: Window Icon & Title */}
      <div className="flex items-center space-x-2.5">
        <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
          <RefreshCw className="w-3 h-3 text-white" />
        </div>
        <span className="font-semibold text-slate-200 tracking-tight text-[11px] sm:text-xs">
          {appName}
        </span>
        <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Windows 11 App • x64</span>
        </span>
      </div>

      {/* Middle: Subtle Search/Drag Handle */}
      <div className="hidden lg:flex items-center space-x-2 text-[11px] text-slate-500 font-mono bg-slate-900/60 px-3 py-0.5 rounded-md border border-slate-800/60">
        <Wifi className="w-3 h-3 text-emerald-400" />
        <span>Sync Service: Running (127.0.0.1:3000)</span>
      </div>

      {/* Right: Windows Controls */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => setWindowVisible(false)}
          title="Minimize to System Tray"
          className="w-8 h-6 flex items-center justify-center rounded hover:bg-slate-800/80 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setIsMaximized(!isMaximized)}
          title={isMaximized ? "Restore Window" : "Maximize Window"}
          className="w-8 h-6 flex items-center justify-center rounded hover:bg-slate-800/80 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={() => setWindowVisible(false)}
          title="Close (Minimize to Tray)"
          className="w-8 h-6 flex items-center justify-center rounded hover:bg-rose-600 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
