import React, { useState, useEffect } from 'react';
import { Activity, Server, Clock, Cpu, Database, RefreshCw, CheckCircle2, WifiOff, Box } from 'lucide-react';
import { motion } from 'motion/react';
import { GridLayoutEngine } from './GridLayoutEngine';
import { ASynXLogo } from './ASynXLogo';
import { SimklLogo, MalLogo, AniListLogo, PlexLogo, KarakeepLogo } from './PlatformLogos';

// Default layout for System Health
const defaultLayout = [
  { i: 'header', x: 0, y: 0, w: 12, h: 3, type: 'HealthHeader', isStatic: true },
  { i: 'daemon', x: 0, y: 3, w: 3, h: 4, type: 'DaemonStatus' },
  { i: 'uptime', x: 3, y: 3, w: 3, h: 4, type: 'Uptime' },
  { i: 'memory', x: 6, y: 3, w: 3, h: 4, type: 'Memory' },
  { i: 'lastSync', x: 9, y: 3, w: 3, h: 4, type: 'LastSync' },
  { i: 'integrations', x: 0, y: 7, w: 12, h: 8, type: 'IntegrationsGrid' }
];

export const SystemHealthView: React.FC<{ isEditMode?: boolean }> = ({ isEditMode = false }) => {
  const [healthData, setHealthData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/daemon/health');
      if (!res.ok) throw new Error('Failed to fetch daemon health');
      const data = await res.json();
      setHealthData(data);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'operational') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (status === 'disconnected') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  if (!healthData && !error) {
    return (
      <div className="p-8 flex items-center justify-center h-[calc(100vh-80px)]">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Define widgets
  const availableWidgets = [
    {
      type: 'HealthHeader',
      name: 'Dashboard Header',
      component: ({ fetchHealth, isRefreshing, error }: any) => (
        <div className="p-6 h-full flex flex-col justify-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <ASynXLogo className="w-6 h-6 text-indigo-500" />
                <span>System Health Dashboard</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Real-time diagnostics for ASynX daemon and external integrations.
              </p>
            </div>
            <button 
              onClick={fetchHealth} 
              disabled={isRefreshing}
              className="px-4 py-2 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#222] border border-gray-200 dark:border-neutral-800 rounded-xl text-sm font-semibold text-gray-800 dark:text-gray-200 transition shadow-sm flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Health'}</span>
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm">
              {error}
            </div>
          )}
        </div>
      )
    },
    {
      type: 'DaemonStatus',
      name: 'Daemon Status',
      component: ({ healthData }: any) => (
        <div className="p-5 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Server className="w-5 h-5" />
            </div>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${healthData?.status === 'ok' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {healthData?.status === 'ok' ? 'Online' : 'Degraded'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Core API Daemon</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-1">
              {healthData?.daemonActive ? 'Active' : 'Maintenance'}
            </p>
          </div>
        </div>
      )
    },
    {
      type: 'Uptime',
      name: 'System Uptime',
      component: ({ healthData, formatUptime }: any) => (
        <div className="p-5 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">System Uptime</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-1">
              {healthData ? formatUptime(healthData.uptime) : '--'}
            </p>
          </div>
        </div>
      )
    },
    {
      type: 'Memory',
      name: 'Memory Usage',
      component: ({ healthData }: any) => (
        <div className="p-5 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Memory Usage</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-1">
              {healthData ? Math.round((healthData.memoryUsage?.heapUsed || 0) / 1024 / 1024) : 0} MB
            </p>
          </div>
        </div>
      )
    },
    {
      type: 'LastSync',
      name: 'Last Sync Time',
      component: ({ healthData }: any) => (
        <div className="p-5 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Last Remote Sync</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-1 truncate">
              {healthData?.lastSync !== 'never' ? new Date(healthData?.lastSync).toLocaleTimeString() : 'Never'}
            </p>
          </div>
        </div>
      )
    },
    {
      type: 'IntegrationsGrid',
      name: 'External Integrations',
      component: ({ healthData, getStatusColor }: any) => {
        const integrationsList = Object.entries(healthData?.integrations || {});
        return (
          <div className="p-5 h-full overflow-y-auto">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-neutral-900 pb-2">External Integrations Health</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {integrationsList.map(([key, data]: [string, any], index: number) => (
                <div key={key} className="p-3 rounded-xl border bg-gray-50 dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      {key.toLowerCase() === 'simkl' ? <SimklLogo className="w-4 h-4 text-emerald-400" /> : 
                       key.toLowerCase() === 'mal' ? <MalLogo className="w-4 h-4 text-[#2E51A2] dark:text-blue-400" /> : 
                       key.toLowerCase() === 'anilist' ? <AniListLogo className="w-4 h-4 text-[#02A9FF] dark:text-cyan-400" /> :
                       key.toLowerCase() === 'plex' ? <PlexLogo className="w-4 h-4 text-[#E5A00D]" /> :
                       key.toLowerCase() === 'karakeep' ? <KarakeepLogo className="w-4 h-4 text-pink-500" /> :
                       <Box className="w-4 h-4 text-indigo-500" />}
                      <span className="font-bold text-gray-800 dark:text-gray-200 capitalize text-xs">{key}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center space-x-1 ${getStatusColor(data.status)}`}>
                      {data.status === 'operational' ? (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Operational</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-2.5 h-2.5" />
                          <span>Disconnected</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] mt-2 pt-2 border-t border-gray-200 dark:border-neutral-800">
                    <span className="text-gray-500 dark:text-gray-400">Latency</span>
                    <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                      {data.status === 'operational' ? `${data.latencyMs}ms` : '--'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      <GridLayoutEngine 
        tabId="health"
        defaultLayout={defaultLayout}
        availableWidgets={availableWidgets}
        widgetProps={{ healthData, isRefreshing, error, fetchHealth, formatUptime, getStatusColor }}
        isEditMode={isEditMode}
      />
    </div>
  );
};
