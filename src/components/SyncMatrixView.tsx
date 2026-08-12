import React, { useState, useEffect } from 'react';
import { 
  LibraryItem, 
  SyncLog, 
  PlatformType, 
  WatchStatus,
  SyncAnalyticsPoint 
} from '../types';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Tv, 
  Sliders, 
  Sparkles, 
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Film,
  Activity,
  BarChart2,
  TrendingUp,
  Layers,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  Bar
} from 'recharts';

interface SyncMatrixViewProps {
  items: LibraryItem[];
  logs: SyncLog[];
  onOpenOverride: (item: LibraryItem) => void;
  onOpenConflictView: () => void;
  onTriggerSyncItem: (itemId: string) => void;
}

export const SyncMatrixView: React.FC<SyncMatrixViewProps> = ({
  items,
  logs,
  onOpenOverride,
  onOpenConflictView,
  onTriggerSyncItem
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'conflicts' | 'anime' | 'drama'>('all');
  const [analyticsData, setAnalyticsData] = useState<SyncAnalyticsPoint[]>([]);
  const [chartMetric, setChartMetric] = useState<'frequency' | 'rates'>('frequency');

  useEffect(() => {
    fetch('/api/sync/analytics')
      .then(res => res.ok ? res.json() : [])
      .then(data => setAnalyticsData(data))
      .catch(err => console.error('Failed loading analytics:', err));
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.japaneseTitle && item.japaneseTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (activeFilter === 'conflicts') return item.hasConflict;
    if (activeFilter === 'anime') return item.mediaType === 'anime';
    if (activeFilter === 'drama') return item.mediaType === 'drama';
    return true;
  });

  const conflictCount = items.filter(i => i.hasConflict).length;
  const syncedCount = items.filter(i => !i.hasConflict).length;

  // 5 Most Recent Sync Events for Summary Card
  const recentFiveEvents = logs.slice(0, 5);

  const renderStatusBadge = (status?: WatchStatus) => {
    if (!status) return <span className="text-slate-500 text-xs">Not Listed</span>;
    switch (status) {
      case 'watching':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">Watching</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium">Completed</span>;
      case 'plan_to_watch':
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-xs font-medium">Plan to Watch</span>;
      case 'paused':
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">Paused</span>;
      case 'dropped':
        return <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-medium">Dropped</span>;
    }
  };

  const renderPlatformChip = (p: PlatformType | string) => {
    switch (p) {
      case 'simkl':
        return <span key={p} className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">Simkl</span>;
      case 'mal':
        return <span key={p} className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase">MAL</span>;
      case 'anilist':
        return <span key={p} className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase">AniList</span>;
      default:
        return <span key={p} className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase">{p}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Tracked Media</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1">{items.length}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Anime & Asian Dramas</p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Film className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Synced Parity</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{syncedCount}</h3>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                {Math.round((syncedCount / (items.length || 1)) * 100)}% Matrix Alignment
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={onOpenConflictView}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 cursor-pointer rounded-2xl p-4 shadow-sm relative overflow-hidden transition group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Desync Conflicts</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{conflictCount}</h3>
              <p className="text-xs text-amber-300 mt-0.5 group-hover:underline flex items-center">
                Review in Resolution Center <ArrowRight className="w-3 h-3 ml-1" />
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Plex Auto-Scrobbles</p>
              <h3 className="text-2xl font-bold text-purple-400 mt-1">100%</h3>
              <p className="text-xs text-purple-300 mt-0.5">Webhook Active & Ready</p>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Tv className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY CARD: 5 Most Recent Sync Events */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Recent Sync Activity Summary</h3>
              <p className="text-xs text-slate-400">Top 5 most recent cross-platform sync updates across your library</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-950 text-indigo-300 border border-slate-800 font-mono">
            5 Most Recent Events
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {recentFiveEvents.map((event, idx) => {
            const timeAgo = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = new Date(event.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
            return (
              <div 
                key={event.id || idx}
                className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-2 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">#{idx + 1} • {event.source}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      event.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      event.status === 'conflict' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{event.itemTitle}</h4>
                  <p className="text-[11px] text-slate-300 line-clamp-1">{event.action}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-900">
                  <div className="flex items-center space-x-1 flex-wrap gap-1">
                    <span className="text-[10px] text-slate-500 mr-1">Platforms:</span>
                    {(event.platformsAffected || ['simkl', 'mal', 'anilist']).map(p => renderPlatformChip(p))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{dateStr} {timeAgo}</span>
                    </span>
                    <span className="text-emerald-400 font-semibold">Updated</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DASHBOARD VISUALIZATION: Historical Sync Frequency & Success Rates (Recharts) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30 text-purple-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Cross-Platform Sync Health & Historical Analytics</h3>
              <p className="text-xs text-slate-400">Track sync frequency volume and success rates over time (14-day history)</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setChartMetric('frequency')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                chartMetric === 'frequency'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sync Frequency Volume
            </button>
            <button
              onClick={() => setChartMetric('rates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                chartMetric === 'rates'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Success Rate %
            </button>
          </div>
        </div>

        {/* Recharts Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="syncArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="successRateArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#020617', 
                  borderColor: '#334155', 
                  borderRadius: '12px', 
                  color: '#f8fafc',
                  fontSize: '12px'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />

              {chartMetric === 'frequency' ? (
                <>
                  <Area type="monotone" dataKey="totalSyncs" name="Total Syncs" stroke="#6366f1" fillOpacity={1} fill="url(#syncArea)" />
                  <Bar dataKey="successfulSyncs" name="Successful Scrobbles" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="conflicts" name="Desync Conflicts" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={12} />
                </>
              ) : (
                <>
                  <Area type="monotone" dataKey="successRate" name="Success Rate (%)" stroke="#10b981" fillOpacity={1} fill="url(#successRateArea)" />
                  <Line type="monotone" dataKey="successRate" name="Trend Rate" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Grid & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Table / Grid (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search anime or drama title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('conflicts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1 ${
                  activeFilter === 'conflicts'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>Conflicts</span>
                {conflictCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                    {conflictCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveFilter('anime')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeFilter === 'anime'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                Anime
              </button>
              <button
                onClick={() => setActiveFilter('drama')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeFilter === 'drama'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                Dramas
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                No titles match your current filter or search criteria.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-slate-900 border rounded-2xl p-4 shadow-sm transition hover:shadow-md ${
                    item.hasConflict 
                      ? 'border-amber-500/40 bg-amber-950/10' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Cover & Title Details */}
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-14 h-20 object-cover rounded-xl shadow border border-slate-800 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                            item.mediaType === 'anime' 
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {item.mediaType}
                          </span>
                          <span className="text-xs text-slate-400">{item.year} • {item.totalEpisodes} eps</span>
                        </div>
                        <h4 className="font-semibold text-slate-100 text-sm sm:text-base mt-1 line-clamp-1">
                          {item.title}
                        </h4>
                        {item.japaneseTitle && (
                          <p className="text-xs text-slate-400 line-clamp-1">{item.japaneseTitle}</p>
                        )}

                        {/* Plex Filename Tag */}
                        {item.plexMatch && (
                          <div className="mt-1.5 flex items-center space-x-1 text-[11px] text-purple-300/80 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40 max-w-md truncate">
                            <Tv className="w-3 h-3 text-purple-400 flex-shrink-0" />
                            <span className="truncate">Plex: {item.plexMatch.filename}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => onTriggerSyncItem(item.id)}
                        title="Instant Sync Item"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenOverride(item)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition cursor-pointer flex items-center space-x-1.5"
                      >
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Override</span>
                      </button>
                    </div>
                  </div>

                  {/* Platform Sync Matrix Breakdown Row */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Simkl */}
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-xs font-semibold text-slate-300">Simkl</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Ep <strong className="text-slate-100">{item.platforms.simkl?.episode || 0}</strong> / {item.totalEpisodes}
                        </p>
                      </div>
                      <div>{renderStatusBadge(item.platforms.simkl?.status)}</div>
                    </div>

                    {/* MAL */}
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="text-xs font-semibold text-slate-300">MAL</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Ep <strong className="text-slate-100">{item.platforms.mal?.episode || 0}</strong> / {item.totalEpisodes}
                        </p>
                      </div>
                      <div>{renderStatusBadge(item.platforms.mal?.status)}</div>
                    </div>

                    {/* AniList */}
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span className="text-xs font-semibold text-slate-300">AniList</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Ep <strong className="text-slate-100">{item.platforms.anilist?.episode || 0}</strong> / {item.totalEpisodes}
                        </p>
                      </div>
                      <div>{renderStatusBadge(item.platforms.anilist?.status)}</div>
                    </div>
                  </div>

                  {/* Conflict Notice if present */}
                  {item.hasConflict && (
                    <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-amber-200">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
                        <span>{item.conflictDetails?.summary}</span>
                      </div>
                      <button
                        onClick={onOpenConflictView}
                        className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition cursor-pointer flex-shrink-0"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Side Log / Activity Feed (1 col) */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Real-Time Sync Logs</span>
              </h3>
              <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Live Feed
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate max-w-[180px]">
                      {log.itemTitle}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-medium">{log.action}</p>
                  <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-2">{log.details}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-indigo-400/80 uppercase font-mono">{log.source}</span>
                    <span className={`px-1.5 py-0.2 rounded font-medium ${
                      log.status === 'success' ? 'text-emerald-400 bg-emerald-950/40' :
                      log.status === 'conflict' ? 'text-amber-400 bg-amber-950/40' : 'text-slate-400'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
