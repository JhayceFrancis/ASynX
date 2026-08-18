import React, { useState, useEffect } from 'react';
import { 
  LibraryItem, 
  SyncLog, 
  PlatformType, 
  WatchStatus,
  SyncAnalyticsPoint,
  AppSettings
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
  Zap,
  LayoutGrid,
  List,
  Upload,
  ArrowUpDown
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
  settings?: AppSettings;
  onOpenOverride: (item: LibraryItem) => void;
  onOpenConflictView: () => void;
  onTriggerSyncItem: (itemId: string) => void;
  onNavigateSettings?: () => void;
  onImportCSV?: (items: LibraryItem[]) => void;
  onUndoAction?: (itemId: string) => void;
}

export const SyncMatrixView: React.FC<SyncMatrixViewProps> = ({
  items,
  logs,
  settings,
  onOpenOverride,
  onOpenConflictView,
  onTriggerSyncItem,
  onNavigateSettings,
  onImportCSV,
  onUndoAction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'conflicts' | 'anime' | 'drama' | 'history'>('all');
  const [analyticsData, setAnalyticsData] = useState<SyncAnalyticsPoint[]>([]);
  const [chartMetric, setChartMetric] = useState<'frequency' | 'rates'>('frequency');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [sortCol, setSortCol] = useState<'title' | 'year' | 'episodes' | 'status'>('title');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        let importedItems: any[] = [];
        
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          importedItems = Array.isArray(parsed) ? parsed : (parsed.items || []);
        } else if (file.name.endsWith('.csv')) {
          // Improved CSV parsing (handles basic quoted commas)
          const rows = text.split('\n').filter(r => r.trim());
          if (rows.length > 0) {
            const headers = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
            importedItems = rows.slice(1).map(row => {
              // Regex to split by comma, ignoring commas inside quotes
              const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
              const obj: any = {};
              headers.forEach((h, i) => obj[h] = values[i]);
              return {
                title: obj.title || obj.name || 'Imported CSV Title',
                mediaType: (obj.type || obj.mediatype || 'anime').toLowerCase(),
                totalEpisodes: parseInt(obj.episodes) || parseInt(obj.total_episodes) || 12,
                year: parseInt(obj.year) || new Date().getFullYear(),
                genres: obj.genres ? obj.genres.split(';') : [],
                platforms: {}
              };
            });
          }
        } else if (file.name.endsWith('.html')) {
          // HTML Parsing (Basic Table Scraper)
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          const table = doc.querySelector('table');
          
          if (table) {
            const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent?.trim().toLowerCase() || '');
            // Some HTML tables might lack th, fallback could be needed but we'll assume standard <th> row.
            const rows = table.querySelectorAll('tbody tr, tr:not(:first-child)');
            
            importedItems = Array.from(rows).map(row => {
              const cells = row.querySelectorAll('td');
              const obj: any = {};
              cells.forEach((cell, i) => {
                if (headers[i]) obj[headers[i]] = cell.textContent?.trim();
              });
              
              // Guessing columns if headers aren't perfectly named
              const title = obj.title || obj.name || obj['anime title'] || 'Imported HTML Title';
              const type = (obj.type || obj.format || 'anime').toLowerCase();
              const episodes = parseInt(obj.episodes) || parseInt(obj['total episodes']) || 12;
              const year = parseInt(obj.year) || parseInt(obj.season?.split(' ')[1]) || new Date().getFullYear();
              
              return {
                title,
                mediaType: type,
                totalEpisodes: episodes,
                year: year,
                genres: [],
                platforms: {}
              };
            });
          } else {
            alert("No table found in the HTML file.");
            return;
          }
        }
        
        if (importedItems.length > 0) {
          const res = await fetch('/api/library/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: importedItems })
          });
          if (res.ok) {
            const data = await res.json();
            alert(`Successfully imported ${data.importedCount} items!`);
            window.location.reload();
          } else {
            alert("Failed to import items to the database.");
          }
        } else {
          alert("No valid items found in the file.");
        }
      } catch (err) {
        console.error("Import failed:", err);
        alert("Failed to parse file. Check console for details.");
      }
    };
    reader.readAsText(file);
    
    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  useEffect(() => {
    fetch('/api/sync/analytics')
      .then(res => res.ok ? res.json() : [])
      .then(data => setAnalyticsData(data))
      .catch(err => console.error('Failed loading analytics:', err));
  }, []);

  const sortedAndFilteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.japaneseTitle && item.japaneseTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (activeFilter === 'conflicts') return item.hasConflict;
    if (activeFilter === 'anime') return item.mediaType === 'anime';
    if (activeFilter === 'drama') return item.mediaType === 'drama';
    return true;
  }).sort((a, b) => {
    let aVal: any = a[sortCol];
    let bVal: any = b[sortCol];

    if (sortCol === 'status') {
      aVal = a.platforms?.anilist?.status || '';
      bVal = b.platforms?.anilist?.status || '';
    } else if (sortCol === 'episodes') {
      aVal = a.totalEpisodes || 0;
      bVal = b.totalEpisodes || 0;
    }

    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredItems = sortedAndFilteredItems;

  const conflictCount = items.filter(i => i.hasConflict).length;
  const syncedCount = items.filter(i => !i.hasConflict).length;

  // 5 Most Recent Sync Events for Summary Card
  const recentFiveEvents = logs.slice(0, 5);

  const renderStatusBadge = (status?: WatchStatus) => {
    if (!status) return <span className="text-gray-500 dark:text-gray-500 text-xs">Not Listed</span>;
    switch (status) {
      case 'watching':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">Watching</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium">Completed</span>;
      case 'plan_to_watch':
        return <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-[#111] text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-neutral-800 text-xs font-medium">Plan to Watch</span>;
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

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-6 my-8 shadow-sm">
        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-500/20 shadow-inner">
          <Film className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your Library is Empty</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
            You haven't tracked any anime or drama series yet, or your database hasn't synced with your connected accounts.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
          <div>
            <input 
              type="file" 
              id="csv-upload-empty"
              accept=".csv" 
              className="hidden" 
              onChange={handleImport}
            />
            <label 
              htmlFor="csv-upload-empty"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center space-x-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk Import CSV</span>
            </label>
          </div>

          {onNavigateSettings && (
            <button
              onClick={onNavigateSettings}
              className="px-6 py-2.5 bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:hover:bg-[#222] text-gray-800 dark:text-gray-200 font-semibold text-sm rounded-xl transition border border-gray-300 dark:border-neutral-800 flex items-center space-x-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Sliders className="w-4 h-4" />
              <span>Configure Connections</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Tracked Media</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{items.length}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Anime & Asian Dramas</p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Film className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Synced Parity</p>
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
          className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 hover:border-amber-500/40 cursor-pointer rounded-2xl p-4 shadow-sm relative overflow-hidden transition group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Desync Conflicts</p>
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
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Plex Auto-Scrobbles</p>
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
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Recent Sync Activity Summary</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Top 5 most recent cross-platform sync updates across your library</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 dark:bg-black text-indigo-300 border border-gray-200 dark:border-neutral-900 font-mono">
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
                className="bg-gray-50 dark:bg-black/80 p-3.5 rounded-2xl border border-gray-200 dark:border-neutral-900/80 space-y-2 flex flex-col justify-between hover:border-gray-300 dark:border-neutral-800 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">#{idx + 1} • {event.source}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      event.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      event.status === 'conflict' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-100 dark:bg-[#111] text-gray-600 dark:text-gray-400'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{event.itemTitle}</h4>
                  <p className="text-[11px] text-gray-700 dark:text-gray-300 line-clamp-1">{event.action}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-900">
                  <div className="flex items-center space-x-1 flex-wrap gap-1">
                    <span className="text-[10px] text-gray-500 dark:text-gray-500 mr-1">Platforms:</span>
                    {(event.platformsAffected || ['simkl', 'mal', 'anilist']).map(p => renderPlatformChip(p))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400 pt-0.5">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-500 dark:text-gray-500" />
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
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-900 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30 text-purple-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Cross-Platform Sync Health & Historical Analytics</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Track sync frequency volume and success rates over time (14-day history)</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-black p-1 rounded-xl border border-gray-200 dark:border-neutral-900">
            <button
              onClick={() => setChartMetric('frequency')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                chartMetric === 'frequency'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200'
              }`}
            >
              Sync Frequency Volume
            </button>
            <button
              onClick={() => setChartMetric('rates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                chartMetric === 'rates'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200'
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
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-2xl p-4 flex flex-col xl:flex-row items-center justify-between gap-4 shadow-sm">
            {/* Search Input & Import */}
            <div className="flex items-center space-x-2 w-full xl:w-auto">
              <div className="relative flex-grow sm:w-64">
                <Search className="w-4 h-4 text-gray-600 dark:text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search anime or drama title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 placeholder:text-gray-500 dark:text-gray-500"
                />
              </div>
              
              {/* Import Button */}
              <label className="flex items-center justify-center bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition">
                <Upload className="w-4 h-4 mr-1.5" />
                Import
                <input type="file" className="hidden" accept=".csv,.json,.html" onChange={handleImport} />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-end">
              {/* Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-50 dark:bg-black text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-neutral-900 hover:text-gray-800 dark:text-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('conflicts')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1 ${
                    activeFilter === 'conflicts'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-50 dark:bg-black text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-neutral-900 hover:text-gray-800 dark:text-gray-200'
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
                      : 'bg-gray-50 dark:bg-black text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-neutral-900 hover:text-gray-800 dark:text-gray-200'
                  }`}
                >
                  Anime
                </button>
                <button
                  onClick={() => setActiveFilter('drama')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeFilter === 'drama'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-50 dark:bg-black text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-neutral-900 hover:text-gray-800 dark:text-gray-200'
                  }`}
                >
                  Dramas
                </button>
                <button
                  onClick={() => setActiveFilter('history')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                    activeFilter === 'history'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-50 dark:bg-black text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-neutral-900 hover:text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Recent Changes</span>
                </button>
              </div>

              {/* View Toggles */}
              <div className="flex items-center bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200'}`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200'}`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          {activeFilter === 'history' ? (
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-2xl shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-3 mb-6 border-b border-gray-200 dark:border-neutral-800 pb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Synchronization History</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Track and revert the last 10 synchronization actions across your library.</p>
                </div>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No synchronization history available yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.slice(0, 10).map((log, idx) => (
                    <div key={log.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-neutral-900 rounded-xl hover:border-indigo-500/30 transition-colors gap-4 group">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg mt-1 shrink-0 ${
                          log.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          log.status === 'conflict' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                          'bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-neutral-700'
                        }`}>
                          {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : log.status === 'conflict' ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900 dark:text-gray-100 text-base">{log.itemTitle}</span>
                            <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 text-[10px] font-mono uppercase font-bold border border-gray-300 dark:border-neutral-700">{log.source}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{log.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-mono flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                      
                      {onUndoAction && (
                        <button 
                          onClick={() => onUndoAction(log.itemId)}
                          className="px-4 py-2 bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#222] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-neutral-800 rounded-xl text-sm font-semibold shadow-sm transition flex items-center justify-center space-x-2 w-full sm:w-auto cursor-pointer shrink-0 opacity-100 sm:opacity-50 sm:group-hover:opacity-100"
                        >
                          <ArrowUpDown className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                          <span>Undo Sync</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-2xl p-8 text-center text-gray-600 dark:text-gray-400">
              No titles match your current filter or search criteria.
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-black/50 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-900">
                  <tr>
                    <th 
                      className="px-4 py-3 font-medium cursor-pointer hover:text-gray-800 dark:text-gray-200 transition select-none"
                      onClick={() => {
                        if (sortCol === 'title') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                        else { setSortCol('title'); setSortDir('asc'); }
                      }}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Title</span>
                        <ArrowUpDown className="w-3 h-3 opacity-50" />
                      </div>
                    </th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th 
                      className="px-4 py-3 font-medium cursor-pointer hover:text-gray-800 dark:text-gray-200 transition select-none"
                      onClick={() => {
                        if (sortCol === 'year') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                        else { setSortCol('year'); setSortDir('asc'); }
                      }}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Year</span>
                        <ArrowUpDown className="w-3 h-3 opacity-50" />
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 font-medium cursor-pointer hover:text-gray-800 dark:text-gray-200 transition select-none"
                      onClick={() => {
                        if (sortCol === 'episodes') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                        else { setSortCol('episodes'); setSortDir('asc'); }
                      }}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Episodes</span>
                        <ArrowUpDown className="w-3 h-3 opacity-50" />
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 font-medium cursor-pointer hover:text-gray-800 dark:text-gray-200 transition select-none"
                      onClick={() => {
                        if (sortCol === 'status') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                        else { setSortCol('status'); setSortDir('asc'); }
                      }}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status (AniList)</span>
                        <ArrowUpDown className="w-3 h-3 opacity-50" />
                      </div>
                    </th>
                    <th className="px-4 py-3 font-medium">Conflicts</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-gray-700 dark:text-gray-300">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-100 dark:bg-[#111]/30 transition">
                      <td className="px-4 py-3 max-w-[200px] truncate font-medium text-gray-800 dark:text-gray-200">
                        {item.title}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                          item.mediaType === 'anime' 
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {item.mediaType}
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.year}</td>
                      <td className="px-4 py-3">{item.platforms.anilist?.episode || 0} / {item.totalEpisodes}</td>
                      <td className="px-4 py-3">{renderStatusBadge(item.platforms.anilist?.status)}</td>
                      <td className="px-4 py-3">
                        {item.hasConflict ? (
                          <span className="flex items-center text-amber-400 text-xs font-semibold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 w-fit">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-xs font-semibold">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onTriggerSyncItem(item.id)}
                            title="Instant Sync Item"
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 transition border border-gray-300 dark:border-neutral-800"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenOverride(item)}
                            className="px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 text-xs font-medium border border-gray-300 dark:border-neutral-800 transition flex items-center space-x-1"
                          >
                            <Sliders className="w-3 h-3 text-indigo-400" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-[#0a0a0a] border rounded-2xl p-4 shadow-sm transition hover:shadow-md ${
                    item.hasConflict 
                      ? 'border-amber-500/40 bg-amber-950/10' 
                      : 'border-gray-200 dark:border-neutral-900 hover:border-gray-300 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Cover & Title Details */}
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-14 h-20 object-cover rounded-xl shadow border border-gray-200 dark:border-neutral-900 flex-shrink-0"
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
                          <span className="text-xs text-gray-600 dark:text-gray-400">{item.year} • {item.totalEpisodes} eps</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base mt-1 line-clamp-1">
                          {item.title}
                        </h4>
                        {item.japaneseTitle && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{item.japaneseTitle}</p>
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
                        className="p-2 rounded-xl bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:text-white transition cursor-pointer border border-gray-300 dark:border-neutral-800"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenOverride(item)}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 hover:text-white text-xs font-medium border border-gray-300 dark:border-neutral-800 transition cursor-pointer flex items-center space-x-1.5"
                      >
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Override</span>
                      </button>
                    </div>
                  </div>

                  {/* Platform Sync Matrix Breakdown Row */}
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-neutral-900/80 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Simkl */}
                    <div className="bg-gray-50 dark:bg-black/60 p-2.5 rounded-xl border border-gray-200 dark:border-neutral-900/60 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Simkl</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          Ep <strong className="text-gray-900 dark:text-gray-100">{item.platforms.simkl?.episode || 0}</strong> / {item.totalEpisodes}
                        </p>
                      </div>
                      <div>{renderStatusBadge(item.platforms.simkl?.status)}</div>
                    </div>

                    {/* MAL */}
                    <div className="bg-gray-50 dark:bg-black/60 p-2.5 rounded-xl border border-gray-200 dark:border-neutral-900/60 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">MAL</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          Ep <strong className="text-gray-900 dark:text-gray-100">{item.platforms.mal?.episode || 0}</strong> / {item.totalEpisodes}
                        </p>
                      </div>
                      <div>{renderStatusBadge(item.platforms.mal?.status)}</div>
                    </div>

                    {/* AniList */}
                    <div className="bg-gray-50 dark:bg-black/60 p-2.5 rounded-xl border border-gray-200 dark:border-neutral-900/60 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">AniList</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          Ep <strong className="text-gray-900 dark:text-gray-100">{item.platforms.anilist?.episode || 0}</strong> / {item.totalEpisodes}
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
              ))}
            </div>
          )}
        </div>

        {/* Side Log / Activity Feed (1 col) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Real-Time Sync Logs</span>
              </h3>
              <span className="text-[10px] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-black px-2 py-0.5 rounded border border-gray-200 dark:border-neutral-900">
                Live Feed
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="p-3 bg-gray-50 dark:bg-black/80 rounded-xl border border-gray-200 dark:border-neutral-900/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[180px]">
                      {log.itemTitle}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-[11px] font-medium">{log.action}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-[10px] leading-relaxed line-clamp-2">{log.details}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-indigo-400/80 uppercase font-mono">{log.source}</span>
                    <span className={`px-1.5 py-0.2 rounded font-medium ${
                      log.status === 'success' ? 'text-emerald-400 bg-emerald-950/40' :
                      log.status === 'conflict' ? 'text-amber-400 bg-amber-950/40' : 'text-gray-600 dark:text-gray-400'
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
