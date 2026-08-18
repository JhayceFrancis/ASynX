import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Wifi, Activity, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface Win11StatusBarProps {
  itemCount: number;
  conflictCount: number;
  isSyncing: boolean;
  maintenanceMode?: boolean;
  onRefresh?: () => void;
}

export const Win11StatusBar: React.FC<Win11StatusBarProps> = ({
  itemCount,
  conflictCount,
  isSyncing,
  maintenanceMode,
  onRefresh
}) => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (!isSyncing) {
      setLastUpdated(new Date());
    }
  }, [isSyncing]);

  return (
    <footer className="bg-gray-50 dark:bg-black/90 backdrop-blur-md border-t border-gray-200 dark:border-neutral-900/80 text-gray-600 dark:text-gray-400 px-4 py-1.5 text-[11px] font-sans flex flex-wrap items-center justify-between gap-2 select-none">
      {/* Left */}
      <div className="flex items-center space-x-3">
        <Tooltip title="Engine Execution State" description="Current active state of the ASynX synchronization engine." position="top">
          <div className="flex items-center space-x-1.5 text-gray-700 dark:text-gray-300 font-medium cursor-help">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Status: {isSyncing ? 'Syncing...' : 'Idle'}</span>
          </div>
        </Tooltip>
        <span className="text-slate-800">|</span>
        <Tooltip title="Background CPU Load" description="Processing resource allocation for background sync loops and local scrobble detection." position="top">
          <div className="flex items-center space-x-1 cursor-help">
            <Cpu className="w-3 h-3 text-gray-500 dark:text-gray-500" />
            <span>CPU: 0.8%</span>
          </div>
        </Tooltip>
        <span className="text-slate-800">|</span>
        <Tooltip title="Memory Allocation" description="RAM used by encrypted local state cache and WebSocket events." position="top">
          <div className="flex items-center space-x-1 cursor-help">
            <HardDrive className="w-3 h-3 text-gray-500 dark:text-gray-500" />
            <span>RAM: 38.4 MB</span>
          </div>
        </Tooltip>
      </div>
      
      {/* Center */}
      <div className="hidden sm:flex items-center space-x-2 text-gray-600 dark:text-gray-400">
        <Tooltip title="Docker Daemon Interval" description="Interval at which the backend Docker container executes automatic background syncs even if the browser is closed." position="top">
          <div className="flex items-center space-x-1.5 cursor-help">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>Docker Sync Daemon: Active (15m)</span>
          </div>
        </Tooltip>
        <span className="text-slate-800">•</span>
        <Tooltip title="Tracked Library Statistics" description="Total anime & drama series in matrix, alongside count of items requiring conflict resolution." position="top">
          <span className="cursor-help">{itemCount} Tracked Titles ({conflictCount} Desynced)</span>
        </Tooltip>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-3">
        {maintenanceMode ? (
          <Tooltip title="Maintenance Override" description="All automatic webhooks and local media detection are currently paused." position="top">
            <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 text-[10px] font-semibold flex items-center space-x-1 animate-pulse cursor-help">
              <ShieldCheck className="w-3 h-3" />
              <span>MAINTENANCE MODE ACTIVE</span>
            </span>
          </Tooltip>
        ) : (
          <Tooltip title="Media Webhook Daemon" description="Listens for incoming Plex scrobble webhooks and Tautulli media play notifications." position="top">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center space-x-1 cursor-help">
              <ShieldCheck className="w-3 h-3" />
              <span>Plex & Tautulli Daemons Active</span>
            </span>
          </Tooltip>
        )}
        
        <Tooltip title="Last Updated" description="Timestamp of the last successful data synchronization. Click to manually refresh." position="top">
          <button 
            onClick={onRefresh}
            className={`flex items-center space-x-1.5 px-2 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-[#111] transition-colors cursor-pointer ${isSyncing ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
            <span className={`text-[10px] font-medium ${isSyncing ? 'text-indigo-400 animate-pulse' : 'text-gray-500 dark:text-gray-400'}`}>
              {isSyncing ? 'Fetching...' : `Last Updated: ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </span>
          </button>
        </Tooltip>

        <Tooltip title="ASynX Release Build" description="Windows 11 desktop companion build and Docker container version." position="top">
          <div className="flex items-center space-x-1.5 cursor-help opacity-70 hover:opacity-100 transition-opacity ml-2 border-l border-gray-300 dark:border-neutral-800 pl-3">
            <span className="text-[10px] text-gray-500 dark:text-gray-500 font-medium">v2.4.0-beta.1</span>
          </div>
        </Tooltip>
      </div>
    </footer>
  );
};
