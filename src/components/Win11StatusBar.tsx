import React, { useState, useEffect } from 'react';
import packageJson from '../../package.json';
import { Cpu, HardDrive, Activity, ShieldCheck, Clock, RefreshCw, Loader2, Terminal, WifiOff } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface Win11StatusBarProps {
  itemCount: number;
  conflictCount: number;
  isSyncing: boolean;
  maintenanceMode?: boolean;
  onRefresh?: () => void;
  isOffline?: boolean;
  onToggleTerminal?: () => void;
  queuedActionsCount?: number;
  onTogglePause?: () => void;
}

export const Win11StatusBar: React.FC<Win11StatusBarProps> = ({
  itemCount,
  conflictCount,
  isSyncing,
  maintenanceMode,
  onRefresh,
  isOffline,
  onToggleTerminal,
  queuedActionsCount = 0,
  onTogglePause
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
        <Tooltip title="Engine Execution State" description={isOffline ? "Connection lost. Actions are queued locally." : "Current active state of the ASynX synchronization engine."} position="top">
          <div className="flex items-center space-x-1.5 text-gray-700 dark:text-gray-300 font-medium cursor-help">
            {isOffline ? (
              <WifiOff className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            ) : isSyncing ? (
              <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            ) : (
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span className={isOffline ? "text-rose-500 font-bold" : ""}>
              Status: {isOffline ? 'Offline Mode' : isSyncing ? 'Syncing...' : 'Idle'}
            </span>
          </div>
        </Tooltip>
        
        {isOffline && queuedActionsCount > 0 && (
          <>
            <span className="text-slate-800">|</span>
            <Tooltip title="Local Action Queue" description="Sync actions are stored locally and will execute when connection is restored." position="top">
              <div className="flex items-center space-x-1 cursor-help bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 text-rose-400 font-bold">
                <RefreshCw className="w-3 h-3 animate-pulse" />
                <span>{queuedActionsCount} Queued</span>
              </div>
            </Tooltip>
          </>
        )}

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
          <Tooltip title="Global Pause Active" description="All automatic webhooks and queue processing are suspended. Click to resume." position="top">
            <button onClick={onTogglePause} className="px-2 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/20 text-[10px] font-semibold flex items-center space-x-1 transition-colors">
              <ShieldCheck className="w-3 h-3 animate-pulse" />
              <span>GLOBAL PAUSE</span>
            </button>
          </Tooltip>
        ) : (
          <Tooltip title="Daemons Active" description="Background sync webhooks and queue processing are active. Click to pause." position="top">
            <button onClick={onTogglePause} className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center space-x-1 transition-colors">
              <ShieldCheck className="w-3 h-3" />
              <span>ACTIVE DAEMONS</span>
            </button>
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
            <span className="text-[10px] text-gray-500 dark:text-gray-500 font-medium">v{packageJson.version}</span>
          </div>
        </Tooltip>
        
        {onToggleTerminal && (
          <Tooltip title="System Logs" description="View real-time backend server events and API handshake logs." position="top">
            <button 
              onClick={onToggleTerminal}
              className="flex items-center space-x-1.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity ml-2 border-l border-gray-300 dark:border-neutral-800 pl-3 text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400"
            >
              <Terminal className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        )}
      </div>
    </footer>
  );
};
