import React from 'react';
import { Cpu, HardDrive, Wifi, Activity, ShieldCheck, Clock } from 'lucide-react';

interface Win11StatusBarProps {
  itemCount: number;
  conflictCount: number;
}

export const Win11StatusBar: React.FC<Win11StatusBarProps> = ({
  itemCount,
  conflictCount
}) => {
  return (
    <footer className="bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 text-slate-400 px-4 py-1.5 text-[11px] font-sans flex flex-wrap items-center justify-between gap-2 select-none">
      {/* Left */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>Status: Idle</span>
        </div>
        <span className="text-slate-800">|</span>
        <div className="flex items-center space-x-1">
          <Cpu className="w-3 h-3 text-slate-500" />
          <span>CPU: 0.8%</span>
        </div>
        <span className="text-slate-800">|</span>
        <div className="flex items-center space-x-1">
          <HardDrive className="w-3 h-3 text-slate-500" />
          <span>RAM: 38.4 MB</span>
        </div>
      </div>

      {/* Center */}
      <div className="hidden sm:flex items-center space-x-2 text-slate-400">
        <Clock className="w-3 h-3 text-indigo-400" />
        <span>Auto-Sync Interval: 15m</span>
        <span className="text-slate-800">•</span>
        <span>{itemCount} Tracked Titles ({conflictCount} Desynced)</span>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-2">
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3" />
          <span>Plex & Tautulli Daemons Active</span>
        </span>
      </div>
    </footer>
  );
};
