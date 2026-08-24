import React, { useMemo } from 'react';
import { Activity, BarChart2, TrendingUp, AlertTriangle, Zap, Server } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Legend, ComposedChart } from 'recharts';
import { SyncAnalyticsPoint } from '../types';
import { GridLayoutEngine } from './GridLayoutEngine';

// Generate mock 14-day history
const generateMockData = (): SyncAnalyticsPoint[] => {
  const data: SyncAnalyticsPoint[] = [];
  const now = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    
    const baseSyncs = Math.floor(Math.random() * 40) + 10;
    const conflicts = Math.floor(Math.random() * (baseSyncs * 0.15));
    const successful = baseSyncs - conflicts;
    
    data.push({
      date: d.toISOString(),
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      totalSyncs: baseSyncs,
      successfulSyncs: successful,
      conflicts: conflicts,
      successRate: Math.round((successful / baseSyncs) * 100),
      avgLatencyMs: Math.floor(Math.random() * 1200) + 300
    });
  }
  return data;
};

const defaultLayout = [
  { i: 'header', x: 0, y: 0, w: 12, h: 3, type: 'PerformanceHeader', isStatic: true },
  { i: 'metrics', x: 0, y: 3, w: 12, h: 4, type: 'MetricsRow' },
  { i: 'activity', x: 0, y: 7, w: 12, h: 10, type: 'ActivityChart' },
  { i: 'volume', x: 0, y: 17, w: 6, h: 10, type: 'VolumeChart' },
  { i: 'latency', x: 6, y: 17, w: 6, h: 10, type: 'LatencyChart' }
];

export const SyncPerformanceView: React.FC<{ isEditMode?: boolean }> = ({ isEditMode = false }) => {
  const data = useMemo(() => generateMockData(), []);

  const totalSyncs = data.reduce((acc, curr) => acc + curr.totalSyncs, 0);
  const totalConflicts = data.reduce((acc, curr) => acc + curr.conflicts, 0);
  const avgSuccessRate = Math.round(data.reduce((acc, curr) => acc + curr.successRate, 0) / data.length);
  const avgLatency = Math.round(data.reduce((acc, curr) => acc + curr.avgLatencyMs, 0) / data.length);

  const availableWidgets = [
    {
      type: 'PerformanceHeader',
      name: 'Performance Header',
      component: () => (
        <div className="flex items-center space-x-3 p-6 h-full border-b border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a]">
          <div className="p-2 bg-indigo-500/10 rounded-xl">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Sync Performance Dashboard</h2>
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
    }
  ];

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      <GridLayoutEngine 
        tabId="performance"
        defaultLayout={defaultLayout}
        availableWidgets={availableWidgets}
        widgetProps={{ data, totalSyncs, avgSuccessRate, totalConflicts, avgLatency }}
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
