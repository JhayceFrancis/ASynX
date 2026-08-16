import React, { useState, useEffect } from 'react';
import { Activity, BarChart2, TrendingUp, AlertTriangle, Zap, Server } from 'lucide-react';
import { SyncAnalyticsPoint } from '../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';

export function SyncPerformanceView() {
  const [data, setData] = useState<SyncAnalyticsPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sync/analytics')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load analytics', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Activity className="w-6 h-6 animate-spin mr-3 text-indigo-500" />
        Loading analytics...
      </div>
    );
  }

  // Calculate summary metrics
  const totalSyncs = data.reduce((acc, pt) => acc + pt.totalSyncs, 0);
  const totalConflicts = data.reduce((acc, pt) => acc + pt.conflicts, 0);
  const avgLatency = Math.round(data.reduce((acc, pt) => acc + pt.avgLatencyMs, 0) / (data.length || 1));
  const successRate = Math.round(((totalSyncs - totalConflicts) / totalSyncs) * 100) || 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-xl">
          <Activity className="w-5 h-5 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Sync Performance Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard icon={<BarChart2 className="w-5 h-5 text-blue-500" />} title="Total Syncs (14d)" value={totalSyncs.toString()} />
        <MetricCard icon={<TrendingUp className="w-5 h-5 text-emerald-500" />} title="Success Rate" value={`${successRate}%`} />
        <MetricCard icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} title="Conflicts Resolved" value={totalConflicts.toString()} />
        <MetricCard icon={<Zap className="w-5 h-5 text-purple-500" />} title="Avg Latency" value={`${avgLatency}ms`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Sync Volume & Conflicts Area Chart */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
            <Server className="w-4 h-4 mr-2 text-indigo-500" />
            Sync Volume & Failures
          </h3>
          <div className="h-64 w-full">
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

        {/* Sync Latency Line Chart */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-purple-500" />
            Synchronization Latency (ms)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#e5e5e5' }}
                  formatter={(value: number) => [`${value}ms`, 'Latency']}
                />
                <Line type="monotone" dataKey="avgLatencyMs" name="Avg Latency" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-5 shadow-sm flex items-center space-x-4">
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
