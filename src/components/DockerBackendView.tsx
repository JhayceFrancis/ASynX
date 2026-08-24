import React, { useEffect, useState } from 'react';
import { Server, Activity, Database, Cpu, MemoryStick, Clock, Settings, ArrowRight, ShieldCheck, Terminal, Play, Square, RefreshCcw } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { ASynXLogo } from './ASynXLogo';

export function DockerBackendView() {
  const [info, setInfo] = useState<any>(null);
  const [daemonStatus, setDaemonStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInfo = async () => {
    setIsLoading(true);
    try {
      const [infoRes, daemonRes] = await Promise.all([
        fetch('/api/docker/info'),
        fetch('/api/daemon/status')
      ]);
      if (infoRes.ok) setInfo(await infoRes.json());
      if (daemonRes.ok) setDaemonStatus(await daemonRes.json());
    } catch (err) {
      console.error("Failed to fetch docker info", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
    const interval = setInterval(fetchInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const formatMemory = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const handleRunDaemon = async () => {
    try {
      await fetch('/api/daemon/sync-now', { method: 'POST' });
      fetchInfo();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-5 dark:opacity-10 pointer-events-none">
          <ASynXLogo size={256} className="text-indigo-500" />
        </div>
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <ASynXLogo size={28} className="text-indigo-500" />
            <span>Docker Backend Dashboard</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor the self-hosted Express server, view Node.js telemetry, and manage the continuous sync daemon.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 relative z-10 flex items-center space-x-3">
          <button 
            onClick={fetchInfo}
            className="p-2 bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:hover:bg-[#222] rounded-xl text-gray-600 dark:text-gray-400 transition"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Container Status */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Container Status</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                {info?.dockerEnv ? 'Docker' : 'Local'} 
                <span className="w-2 h-2 rounded-full bg-emerald-500 ml-2 animate-pulse" />
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{info?.nodeEnv}</p>
            </div>
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Server Uptime</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {info ? formatUptime(info.uptime) : '--'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Since Last Restart</p>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Memory Allocation</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {info ? formatMemory(info.memoryUsage.rss) : '--'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Resident Set Size</p>
            </div>
          </div>
        </div>

        {/* Daemon Cycles */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Database className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Daemon Cycles</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {daemonStatus?.cycleCount ?? '--'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Completed Syncs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Details */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-indigo-500" />
            Environment Variables
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-900">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Node.js Version</span>
              <span className="text-sm font-mono bg-gray-100 dark:bg-[#111] px-2 py-0.5 rounded text-gray-800 dark:text-gray-300">{info?.nodeVersion || '--'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-900">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Architecture / Platform</span>
              <span className="text-sm font-mono bg-gray-100 dark:bg-[#111] px-2 py-0.5 rounded text-gray-800 dark:text-gray-300">{info ? `${info.arch} / ${info.platform}` : '--'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-900">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Process ID</span>
              <span className="text-sm font-mono bg-gray-100 dark:bg-[#111] px-2 py-0.5 rounded text-gray-800 dark:text-gray-300">{info?.pid || '--'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-900">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Reverse Proxy Trust</span>
              <span className="text-sm font-mono bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-400 flex items-center">
                {info?.trustProxy ? 'Enabled (1)' : 'Disabled'} <ShieldCheck className="w-3 h-3 ml-1" />
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">V8 Heap Total</span>
              <span className="text-sm font-mono bg-gray-100 dark:bg-[#111] px-2 py-0.5 rounded text-gray-800 dark:text-gray-300">{info ? formatMemory(info.memoryUsage.heapTotal) : '--'}</span>
            </div>
          </div>
        </div>

        {/* Sync Daemon Controls */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Terminal className="w-5 h-5 mr-2 text-indigo-500" />
            Background Sync Daemon
          </h3>
          <div className="flex-grow flex flex-col justify-center space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-neutral-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">Daemon Status</span>
                {daemonStatus?.active ? (
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full flex items-center uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" /> Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-full flex items-center uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-1.5" /> Paused (Maintenance)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                The continuous sync daemon runs in the Node.js background loop, executing a full cross-platform reconciliation cycle every <span className="font-bold text-gray-700 dark:text-gray-300">{daemonStatus?.intervalMinutes || 15} minutes</span>.
              </p>
              
              <div className="flex space-x-3">
                <button 
                  onClick={handleRunDaemon}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center"
                >
                  <Play className="w-4 h-4 mr-1.5 fill-current" /> Trigger Manual Cycle
                </button>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center px-2">
              <span>Last Sync Run:</span>
              <span className="font-mono bg-gray-100 dark:bg-black px-1.5 py-0.5 rounded border border-gray-200 dark:border-neutral-800">
                {daemonStatus?.lastSyncTimestamp ? new Date(daemonStatus.lastSyncTimestamp).toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
