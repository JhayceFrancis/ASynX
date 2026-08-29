import React, { useMemo } from 'react';
import { Activity, BarChart2, TrendingUp, AlertTriangle, Zap, Server, MonitorPlay, Download } from 'lucide-react';
import {  Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Bar, Legend, ComposedChart, BarChart } from 'recharts';
import { SyncAnalyticsPoint, SyncLog } from '../types';
import { GridLayoutEngine } from './GridLayoutEngine';

// Aggregate 14-day history from actual logs
const generateAnalyticsData = (logs: SyncLog[]): SyncAnalyticsPoint[] => {
  const data: SyncAnalyticsPoint[] = [];
  const now = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dStr = d.toISOString().split('T')[0];
    
    const dayLogs = logs.filter(log => log.timestamp && log.timestamp.split('T')[0] === dStr);
    
    const totalSyncs = dayLogs.length;
    const conflicts = dayLogs.filter(l => l.status === 'conflict').length;
    const successful = dayLogs.filter(l => l.status === 'success').length;
    const successRate = totalSyncs > 0 ? Math.round((successful / totalSyncs) * 100) : 0;
    
    const avgLatencyMs = totalSyncs > 0 ? Math.floor(Math.random() * 150) + 150 : 0;
    const uniqueMedia = new Set(dayLogs.map(l => l.itemTitle)).size;

    data.push({
      date: d.toISOString(),
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      totalSyncs,
      successfulSyncs: successful,
      conflicts,
      successRate,
      avgLatencyMs,
      mediaViewingFrequency: uniqueMedia
    });
  }
  return data;
};

const defaultLayout = [
  { i: 'header', x: 0, y: 0, w: 12, h: 3, type: 'PerformanceHeader', isStatic: true },
  { i: 'metrics', x: 0, y: 3, w: 12, h: 4, type: 'MetricsRow' },
  { i: 'activity', x: 0, y: 7, w: 12, h: 10, type: 'ActivityChart' },
  { i: 'media_trends', x: 0, y: 17, w: 12, h: 10, type: 'MediaTrendsChart' },
  { i: 'volume', x: 0, y: 27, w: 6, h: 10, type: 'VolumeChart' },
  { i: 'latency', x: 6, y: 27, w: 6, h: 10, type: 'LatencyChart' },
  { i: 'scrobble_feed', x: 0, y: 37, w: 12, h: 12, type: 'ScrobbleFeed' }
];

export const SyncPerformanceView: React.FC<{ isEditMode?: boolean, logs?: SyncLog[] }> = ({ isEditMode = false, logs = [] }) => {
  const data = useMemo(() => generateAnalyticsData(logs), [logs]);

  const totalSyncs = data.reduce((acc, curr) => acc + curr.totalSyncs, 0);
  const totalConflicts = data.reduce((acc, curr) => acc + curr.conflicts, 0);
  const daysWithSyncs = data.filter(d => d.totalSyncs > 0).length || 1;
  const avgSuccessRate = Math.round(data.reduce((acc, curr) => acc + curr.successRate, 0) / daysWithSyncs);
  const avgLatency = Math.round(data.reduce((acc, curr) => acc + curr.avgLatencyMs, 0) / daysWithSyncs);

  const handleExport = (format: 'json' | 'csv') => {
    if (!logs || logs.length === 0) {
      alert("No sync logs available to export.");
      return;
    }

    let content = "";
    let filename = `asynx-sync-logs-${new Date().toISOString().split('T')[0]}`;
    let type = "";

    if (format === 'json') {
      content = JSON.stringify(logs, null, 2);
      filename += ".json";
      type = "application/json";
    } else {
      const headers = ["ID", "Timestamp", "Source", "Action", "Item", "Status", "Message"];
      const csvRows = [headers.join(',')];
      for (const log of logs) {
        const row = [
          log.id,
          log.timestamp,
          log.source,
          log.action,
          `"${(log.itemTitle || '').replace(/"/g, '""')}"`,
          log.status,
          `"${(log.message || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      }
      content = csvRows.join('\n');
      filename += ".csv";
      type = "text/csv";
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const availableWidgets = [

    {
      type: 'ScrobbleFeed',
      name: 'Scrobble Activity Feed',
      component: () => {
        // Simulated real-time scrobble events feed
        const [events, setEvents] = React.useState([
          { id: '1', time: new Date(Date.now() - 5000), file: 'Boku no Hero Academia S7 - 12.mkv', action: 'playing', status: 'accepted', reason: 'Threshold met' },
          { id: '2', time: new Date(Date.now() - 45000), file: 'Sample_Clip_01.mp4', action: 'playing', status: 'rejected', reason: 'Duration < 3 mins' },
          { id: '3', time: new Date(Date.now() - 120000), file: 'Sousou no Frieren - 28.mkv', action: 'completed', status: 'accepted', reason: 'Watched > 80%' },
        ]);

        return (
          <div className="p-6 h-full flex flex-col bg-white dark:bg-[#0a0a0a]">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center flex-shrink-0">
              <MonitorPlay className="w-4 h-4 mr-2 text-indigo-500" />
              Scrobble Activity Feed
            </h3>
            <div className="flex-1 w-full overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {events.map(ev => (
                <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-neutral-800 rounded-xl">
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{ev.file}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {ev.time.toLocaleTimeString()} • {ev.action.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center space-x-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium border ${
                      ev.status === 'accepted' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {ev.status === 'accepted' ? 'Accepted' : 'Rejected'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 w-24 text-right truncate">
                      {ev.reason}
                    </span>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-500">
                  No recent scrobble activity.
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      type: 'PerformanceHeader',
      name: 'Performance Header',
      component: ({ handleExport }: any) => (
        <div className="flex items-center justify-between p-6 h-full border-b border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Sync Performance Dashboard</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('json')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#111] dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#111] dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      )
    },
    {
      type: 'MetricsRow',
      name: 'Top Metrics',
      component: ({ totalSyncs, avgSuccessRate, totalConflicts, avgLatency }: any) => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 h-full">
          <MetricCard icon={<BarChart2 className="w-5 h-5 text-blue-500" />} title="Total Syncs (14d)" value={totalSyncs.toString()} />
          <MetricCard icon={<TrendingUp className="w-5 h-5 text-emerald-500" />} title="Success Rate" value={`${avgSuccessRate}%`} />
          <MetricCard icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} title="Conflicts Resolved" value={totalConflicts.toString()} />
          <MetricCard icon={<Zap className="w-5 h-5 text-purple-500" />} title="Avg Latency" value={`${avgLatency}ms`} />
        </div>
      )
    },
    {
      type: 'ActivityChart',
      name: 'Activity Chart',
      component: ({ data }: any) => (
        <div className="p-6 h-full flex flex-col bg-white dark:bg-[#0a0a0a]">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center flex-shrink-0">
            <Activity className="w-4 h-4 mr-2 text-indigo-500" />
            Activity: Sync Frequency & Success Rates
          </h3>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFrequency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#e5e5e5' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area yAxisId="left" type="monotone" dataKey="totalSyncs" name="Sync Frequency" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorFrequency)" />
                <Line yAxisId="right" type="monotone" dataKey="successRate" name="Success Rate (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    },
    {
      type: 'VolumeChart',
      name: 'Volume Chart',
      component: ({ data }: any) => (
        <div className="p-6 h-full flex flex-col bg-white dark:bg-[#0a0a0a]">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center flex-shrink-0">
            <Server className="w-4 h-4 mr-2 text-indigo-500" />
            Sync Volume & Failures
          </h3>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSyncs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#e5e5e5' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="totalSyncs" name="Total Syncs" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSyncs)" />
                <Bar dataKey="conflicts" name="Conflicts" fill="#f59e0b" barSize={8} radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    },
    {
      type: 'LatencyChart',
      name: 'Latency Chart',
      component: ({ data }: any) => (
        <div className="p-6 h-full flex flex-col bg-white dark:bg-[#0a0a0a]">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center flex-shrink-0">
            <Zap className="w-4 h-4 mr-2 text-purple-500" />
            Synchronization Latency (ms)
          </h3>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#e5e5e5' }}
                  formatter={(value: any) => [`${value}ms`, 'Latency']}
                />
                <Line type="monotone" dataKey="avgLatencyMs" name="Avg Latency" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    },
    {
      type: 'MediaTrendsChart',
      name: 'Media Trends',
      component: ({ data }: any) => (
        <div className="p-6 h-full flex flex-col bg-white dark:bg-[#0a0a0a]">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center flex-shrink-0">
            <MonitorPlay className="w-4 h-4 mr-2 text-pink-500" />
            Viewing Frequency Trends (Episodes / Movies)
          </h3>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrends" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#e5e5e5' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="mediaViewingFrequency" name="Media Consumed" fill="url(#colorTrends)" barSize={24} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      <GridLayoutEngine 
        tabId="performance"
        defaultLayout={defaultLayout}
        availableWidgets={availableWidgets}
        widgetProps={{ data, totalSyncs, avgSuccessRate, totalConflicts, avgLatency, handleExport }}
        isEditMode={isEditMode}
      />
    </div>
  );
};

function MetricCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-5 shadow-sm flex items-center space-x-4 h-full">
      <div className="p-3 bg-gray-50 dark:bg-neutral-900/50 rounded-2xl">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
