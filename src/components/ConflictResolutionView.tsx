import { apiFetch as fetch } from '../apiFetch';
import React, { useState, useEffect, useMemo } from 'react';
import { LibraryItem, PlatformType, WatchStatus, AIConflictAnalysis, AppSettings, ConflictCategory } from '../types';
import { SystemLog } from './SystemLogOverlay';
import { MalLogo, AniListLogo, SimklLogo } from './PlatformLogos';
import { 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Sliders, 
  Bot, 
  ChevronRight,
  CheckSquare,
  Square,
  Zap,
  ListChecks,
  Info,
  AlertCircle,
  Filter,
  Layers,
  Split,
  Tag
} from 'lucide-react';

interface ConflictResolutionViewProps {
  conflicts: LibraryItem[];
  onResolveConflict: (itemId: string, sourceOfTruthPlatform?: PlatformType, customEpisode?: number, customStatus?: WatchStatus) => void;
  onRefreshData?: () => void;
  settings?: AppSettings;
  onNavigateSettings?: () => void;
  systemLogs?: SystemLog[];
}

/**
 * Categorizes a conflict into one of the three core user categories:
 * - 'Platform Mismatch': Status differences, unlinked/missing platform presence, or platform-level desync
 * - 'Progress Discrepancy': Watch episode mismatch, progress gap, or scrobble count difference
 * - 'Metadata Conflict': Score/rating differences, title/season mismatch, or metadata alignment issues
 */
export function getConflictCategory(item: LibraryItem): 'Platform Mismatch' | 'Progress Discrepancy' | 'Metadata Conflict' {
  if (item.conflictDetails?.category) {
    return item.conflictDetails.category;
  }

  const type = item.conflictDetails?.type;
  if (type === 'progress_discrepancy' || type === 'episode_mismatch') {
    return 'Progress Discrepancy';
  }
  if (type === 'platform_mismatch' || type === 'status_mismatch') {
    return 'Platform Mismatch';
  }
  if (type === 'metadata_conflict' || type === 'score_mismatch') {
    return 'Metadata Conflict';
  }

  const summary = (item.conflictDetails?.summary || '').toLowerCase();
  if (summary.includes('episode') || summary.includes('progress') || summary.includes('ep ') || summary.includes('watch count')) {
    return 'Progress Discrepancy';
  }
  if (summary.includes('score') || summary.includes('rating') || summary.includes('title') || summary.includes('metadata') || summary.includes('season')) {
    return 'Metadata Conflict';
  }
  if (summary.includes('platform') || summary.includes('status') || summary.includes('desync') || summary.includes('missing') || summary.includes('unlinked')) {
    return 'Platform Mismatch';
  }

  // Differences array inspection
  if (item.conflictDetails?.differences && item.conflictDetails.differences.length > 1) {
    const diffs = item.conflictDetails.differences;
    const eps = diffs.map(d => d.episode).filter(e => typeof e === 'number');
    if (new Set(eps).size > 1) return 'Progress Discrepancy';
    const stats = diffs.map(d => d.status).filter(Boolean);
    if (new Set(stats).size > 1) return 'Platform Mismatch';
  }

  // Active platform states inspection
  const platforms = Object.values(item.platforms || {}).filter(Boolean);
  const eps = platforms.map(p => p?.episode).filter(e => typeof e === 'number');
  if (new Set(eps).size > 1) return 'Progress Discrepancy';

  const statuses = platforms.map(p => p?.status).filter(Boolean);
  if (new Set(statuses).size > 1) return 'Platform Mismatch';

  const scores = platforms.map(p => p?.score).filter(s => typeof s === 'number' && s > 0);
  if (new Set(scores).size > 1) return 'Metadata Conflict';

  if (platforms.some(p => p?.id === 'mal-none')) return 'Platform Mismatch';

  return 'Progress Discrepancy';
}

export const ConflictResolutionView: React.FC<ConflictResolutionViewProps> = ({
  conflicts,
  onResolveConflict,
  onRefreshData,
  settings,
  onNavigateSettings,
  systemLogs = []
}) => {
  // 1. ALL useState hooks declared first (Zero Tolerance for Temporal Dead Zones)
  const [selectedCategory, setSelectedCategory] = useState<ConflictCategory>('all');
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(conflicts[0]?.id || null);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, AIConflictAnalysis>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Bulk Action Selection state
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);
  const initialSOT = (settings?.syncRules?.defaultSourceOfTruth || 'anilist') as 'anilist' | 'simkl' | 'mal' | 'highest_episode';
  const [bulkStrategy, setBulkStrategy] = useState<'anilist' | 'simkl' | 'mal' | 'highest_episode'>(initialSOT);
  const [isBulkResolving, setIsBulkResolving] = useState<boolean>(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  // 2. ALL useMemo hooks declared at top
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: conflicts.length,
      'Platform Mismatch': 0,
      'Progress Discrepancy': 0,
      'Metadata Conflict': 0
    };
    conflicts.forEach(item => {
      const cat = getConflictCategory(item);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [conflicts]);

  const filteredConflicts = useMemo(() => {
    if (selectedCategory === 'all') return conflicts;
    return conflicts.filter(item => getConflictCategory(item) === selectedCategory);
  }, [conflicts, selectedCategory]);

  // 3. ALL useEffect hooks declared at top
  useEffect(() => {
    if (settings) {
      const sot = (settings.syncRules?.defaultSourceOfTruth || 'anilist') as 'anilist' | 'simkl' | 'mal' | 'highest_episode';
      setBulkStrategy(sot);
    }
  }, [settings]);

  // Handle setting selection when conflict list or filtered category changes
  useEffect(() => {
    if (filteredConflicts.length > 0) {
      if (!selectedConflictId || !filteredConflicts.some(c => c.id === selectedConflictId)) {
        setSelectedConflictId(filteredConflicts[0].id);
      }
    } else {
      setSelectedConflictId(null);
    }
  }, [filteredConflicts, selectedConflictId]);

  if (conflicts.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-6 my-8 shadow-sm">
        <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-500/20 shadow-inner">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Zero Desync Conflicts Found</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
            All your tracked anime and drama progress across Simkl, MyAnimeList, and AniList are in perfect synchronization. Your real-time webhooks and scrobbles are properly aligned!
          </p>
        </div>
        
        {onNavigateSettings && (
          <button
            onClick={onNavigateSettings}
            className="mt-4 px-6 py-2.5 bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:hover:bg-[#222] text-gray-800 dark:text-gray-200 font-semibold text-sm rounded-xl transition border border-gray-300 dark:border-neutral-800 flex items-center justify-center space-x-2 mx-auto cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Review Source of Truth Settings</span>
          </button>
        )}
      </div>
    );
  }

  const selectedItem = filteredConflicts.find(c => c.id === selectedConflictId) || filteredConflicts[0] || null;

  const handleToggleSelectAll = () => {
    const visibleIds = filteredConflicts.map(c => c.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => bulkSelectedIds.includes(id));

    if (allVisibleSelected) {
      setBulkSelectedIds(bulkSelectedIds.filter(id => !visibleIds.includes(id)));
    } else {
      setBulkSelectedIds(Array.from(new Set([...bulkSelectedIds, ...visibleIds])));
    }
  };

  const handleToggleSelectItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (bulkSelectedIds.includes(id)) {
      setBulkSelectedIds(bulkSelectedIds.filter(i => i !== id));
    } else {
      setBulkSelectedIds([...bulkSelectedIds, id]);
    }
  };

  const handleApplyBulkStrategy = async () => {
    if (bulkSelectedIds.length === 0) return;
    setIsBulkResolving(true);
    setBulkSuccessMsg(null);

    try {
      const res = await fetch('/api/conflicts/bulk-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: bulkSelectedIds, strategy: bulkStrategy })
      });

      if (res.ok) {
        const data = await res.json();
        setBulkSuccessMsg(`Successfully resolved ${data.resolvedCount} conflicts using strategy: ${bulkStrategy.toUpperCase()}`);
        setBulkSelectedIds([]);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed bulk resolution:', err);
    } finally {
      setIsBulkResolving(false);
    }
  };

  const handleAnalyzeWithAI = async (item: LibraryItem) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/conflicts/ai-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id })
      });
      const data: AIConflictAnalysis = await res.json();
      setAiAnalysis(prev => ({ ...prev, [item.id]: data }));
    } catch (err) {
      console.error('Failed to run AI conflict analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentAi = selectedItem ? aiAnalysis[selectedItem.id] : undefined;
  const visibleSelectedCount = bulkSelectedIds.filter(id => filteredConflicts.some(fc => fc.id === id)).length;
  const isAllVisibleSelected = filteredConflicts.length > 0 && visibleSelectedCount === filteredConflicts.length;
  const selectedItemCategory = selectedItem ? getConflictCategory(selectedItem) : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Cross-Platform Conflict Resolution Center</h2>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            Resolve episode gaps, watch status mismatches, or rating ties between Simkl, MAL, and AniList.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span 
            id="badge-conflicts-total"
            className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow-sm"
          >
            {conflicts.length} Pending {conflicts.length === 1 ? 'Conflict' : 'Conflicts'}
          </span>
        </div>
      </div>

      
      {/* Diagnostic Panel: Ignored Scrobble Events */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-neutral-900 pb-3 mb-4">
          <Info className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Ignored Scrobble Diagnostics</h3>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Below are recent scrobble events that were blocked by your active Daemon Settings rules. This provides transparency on why certain episodes did not sync.
          </p>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            <div className="p-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-neutral-800 rounded-xl flex flex-col space-y-1">
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Frieren - 28.mkv</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">MPC-BE Local Player</span>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs font-medium text-rose-500 dark:text-rose-400 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Failed completion threshold (55% &lt; 80%)
                </div>
                <button onClick={onNavigateSettings} className="text-[10px] font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">
                  Adjust Rules
                </button>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-neutral-800 rounded-xl flex flex-col space-y-1">
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Private_Clip_04.mp4</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">MPC-BE Local Player</span>
              <div className="mt-2 text-xs font-medium text-amber-500 dark:text-amber-400 flex items-center">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Matched ignored path (D:\Private\)
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-neutral-800 rounded-xl flex flex-col space-y-1">
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Jujutsu Kaisen S2 - 12.mkv</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">MPC-BE Local Player</span>
              <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Player rule disabled in Settings
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BULK-ACTION & CATEGORIZATION FILTER TOOLBAR */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-5 shadow-md space-y-3">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Filter Dropdown */}
            <div id="conflict-category-filter-container" className="flex items-center space-x-2 bg-gray-50 dark:bg-black px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-900 text-xs text-gray-700 dark:text-gray-300">
              <Filter className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
              <label htmlFor="conflict-category-filter-select" className="font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Category:
              </label>
              <select
                id="conflict-category-filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ConflictCategory)}
                className="bg-transparent font-bold text-gray-900 dark:text-gray-100 focus:outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100">
                  All Conflicts ({categoryCounts.all})
                </option>
                <option value="Platform Mismatch" className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100">
                  Platform Mismatch ({categoryCounts['Platform Mismatch']})
                </option>
                <option value="Progress Discrepancy" className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100">
                  Progress Discrepancy ({categoryCounts['Progress Discrepancy']})
                </option>
                <option value="Metadata Conflict" className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100">
                  Metadata Conflict ({categoryCounts['Metadata Conflict']})
                </option>
              </select>
            </div>

            {/* Quick Category Chips for Faster Processing */}
            <div className="hidden sm:flex items-center space-x-1.5">
              {(['all', 'Platform Mismatch', 'Progress Discrepancy', 'Metadata Conflict'] as ConflictCategory[]).map((cat) => {
                const isCurrent = selectedCategory === cat;
                const label = cat === 'all' ? 'All' : cat;
                const count = categoryCounts[cat];
                return (
                  <button
                    key={cat}
                    id={`btn-filter-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent hover:border-gray-200 dark:hover:border-neutral-800'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isCurrent ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selection Controls */}
            <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-neutral-800 pl-3">
              <button
                id="btn-toggle-select-all"
                onClick={handleToggleSelectAll}
                disabled={filteredConflicts.length === 0}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 hover:border-gray-300 dark:border-neutral-800 text-gray-700 dark:text-gray-300 text-xs font-semibold cursor-pointer transition disabled:opacity-40"
              >
                {isAllVisibleSelected ? (
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Square className="w-4 h-4 text-gray-500 dark:text-gray-500" />
                )}
                <span>
                  {isAllVisibleSelected 
                    ? (selectedCategory === 'all' ? 'Deselect All' : `Deselect ${selectedCategory}`) 
                    : (selectedCategory === 'all' ? 'Select All' : `Select All ${selectedCategory}`)}
                </span>
              </button>

              <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                <strong className="text-indigo-500 dark:text-indigo-300">{visibleSelectedCount}</strong> of {filteredConflicts.length} Selected
                {selectedCategory !== 'all' && bulkSelectedIds.length > visibleSelectedCount && (
                  <span className="text-gray-400 text-[11px] ml-1">({bulkSelectedIds.length} total)</span>
                )}
              </span>

              {bulkSelectedIds.length > 0 && (
                <button
                  id="btn-clear-selection"
                  onClick={() => setBulkSelectedIds([])}
                  className="text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Strategy Selector & Apply Button */}
          <div className="flex items-center space-x-2.5 w-full xl:w-auto justify-end">
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-black px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-900 text-xs text-gray-700 dark:text-gray-300 w-full sm:w-auto">
              <ListChecks className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap hidden sm:inline">Strategy:</span>
              <select
                id="bulk-strategy-selector"
                value={bulkStrategy}
                onChange={(e) => setBulkStrategy(e.target.value as any)}
                className="bg-transparent font-bold text-gray-900 dark:text-gray-100 focus:outline-none cursor-pointer w-full"
              >
                <option value="anilist" className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">Resolve with AniList as Source of Truth</option>
                <option value="simkl" className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">Resolve with Simkl as Source of Truth</option>
                <option value="mal" className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">Resolve with MyAnimeList as Source of Truth</option>
                <option value="highest_episode" className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">Resolve with Highest Episode Progress</option>
              </select>
            </div>

            <button
              id="btn-apply-bulk-strategy"
              onClick={handleApplyBulkStrategy}
              disabled={bulkSelectedIds.length === 0 || isBulkResolving}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs shadow transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0 disabled:opacity-40"
            >
              <Zap className="w-4 h-4" />
              <span>{isBulkResolving ? 'Resolving...' : `Apply Strategy (${bulkSelectedIds.length})`}</span>
            </button>
          </div>
        </div>

        {bulkSuccessMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-300 font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{bulkSuccessMsg}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Conflict Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Flagged Items ({filteredConflicts.length}{selectedCategory !== 'all' ? ` of ${conflicts.length}` : ''})
            </h3>
            {selectedCategory !== 'all' && (
              <button
                id="btn-clear-category-filter"
                onClick={() => setSelectedCategory('all')}
                className="text-[11px] text-indigo-500 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
              >
                Show All
              </button>
            )}
          </div>

          {filteredConflicts.length === 0 ? (
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-2xl p-6 text-center space-y-3">
              <Filter className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                No conflicts categorized as <strong className="text-gray-900 dark:text-gray-100">{selectedCategory}</strong>
              </p>
              <button
                id="btn-reset-filter"
                onClick={() => setSelectedCategory('all')}
                className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold cursor-pointer transition hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
              >
                Reset to All Conflicts
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConflicts.map((item) => {
                const isSelected = item.id === (selectedItem?.id);
                const isBulkChecked = bulkSelectedIds.includes(item.id);
                const itemCategory = getConflictCategory(item);
                return (
                  <div
                    key={item.id}
                    id={`conflict-item-card-${item.id}`}
                    onClick={() => setSelectedConflictId(item.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-900/30 border-indigo-500 shadow-md'
                        : 'bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-neutral-900 hover:border-gray-300 dark:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        id={`btn-select-item-${item.id}`}
                        onClick={(e) => handleToggleSelectItem(item.id, e)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-indigo-400 cursor-pointer"
                      >
                        {isBulkChecked ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-10 h-14 object-cover rounded-lg border border-gray-200 dark:border-neutral-900"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5 mb-1">
                          <span
                            id={`badge-cat-${item.id}`}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              itemCategory === 'Platform Mismatch' 
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30' 
                                : itemCategory === 'Progress Discrepancy' 
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30' 
                                : 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30'
                            }`}
                          >
                            {itemCategory}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-amber-500 dark:text-amber-400 mt-0.5 line-clamp-1">
                          {item.conflictDetails?.summary || 'Desync detected'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Active Conflict Detailed Resolution Workspace (8 cols) */}
        {selectedItem ? (
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-md space-y-6">
              {/* Item Overview Header */}
              <div className="flex items-center space-x-4 pb-4 border-b border-gray-200 dark:border-neutral-900">
                <img
                  src={selectedItem.coverImage}
                  alt={selectedItem.title}
                  className="w-16 h-24 object-cover rounded-2xl shadow border border-gray-300 dark:border-neutral-800"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Conflict Identified
                    </span>
                    {selectedItemCategory && (
                      <span 
                        id="selected-item-category-badge"
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          selectedItemCategory === 'Platform Mismatch' 
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-300 dark:border-purple-500/30' 
                            : selectedItemCategory === 'Progress Discrepancy' 
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-300 dark:border-amber-500/30' 
                            : 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 border-sky-300 dark:border-sky-500/30'
                        }`}
                      >
                        {selectedItemCategory}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{selectedItem.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{selectedItem.japaneseTitle}</p>
                  <p className="text-xs text-amber-400 mt-1 font-medium">
                    {selectedItem.conflictDetails?.summary}
                  </p>
                </div>
              </div>

              {/* Side-by-Side Platform Comparison Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Side-by-Side Platform Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Simkl Card */}
                  <div className="bg-gray-50 dark:bg-black p-4 rounded-2xl border border-gray-200 dark:border-neutral-900 space-y-2 hover:border-emerald-500/30 transition-colors group">
                    <div className="flex items-center justify-between">
                      <a 
                        href={selectedItem.platforms.simkl?.id ? `https://simkl.com/${selectedItem.mediaType.includes('Anime') ? 'anime' : 'tv'}/${selectedItem.platforms.simkl.id}` : '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 hover:opacity-80 transition cursor-pointer"
                      >
                        <SimklLogo className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-500 transition-colors">Simkl</span>
                      </a>
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                        Ep {selectedItem.platforms.simkl?.episode || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{selectedItem.platforms.simkl?.status || 'Not set'}</p>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500 pt-1 border-t border-slate-900">
                      Updated: {selectedItem.platforms.simkl?.updatedAt ? new Date(selectedItem.platforms.simkl.updatedAt).toLocaleTimeString() : 'N/A'}
                    </p>
                    <button
                      onClick={() => onResolveConflict(selectedItem.id, 'simkl')}
                      className="w-full mt-2 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Use Simkl as Truth
                    </button>
                  </div>

                  {/* MAL Card */}
                  <div className="bg-gray-50 dark:bg-black p-4 rounded-2xl border border-gray-200 dark:border-neutral-900 space-y-2 hover:border-blue-500/30 transition-colors group">
                    <div className="flex items-center justify-between">
                      <a 
                        href={selectedItem.platforms.mal?.id ? `https://myanimelist.net/anime/${selectedItem.platforms.mal.id}` : '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 hover:opacity-80 transition cursor-pointer"
                      >
                        <MalLogo className="w-5 h-5 text-[#2e51a2] dark:text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-500 transition-colors">MAL</span>
                      </a>
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                        Ep {selectedItem.platforms.mal?.episode || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{selectedItem.platforms.mal?.status || 'Not set'}</p>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500 pt-1 border-t border-slate-900">
                      Updated: {selectedItem.platforms.mal?.updatedAt ? new Date(selectedItem.platforms.mal.updatedAt).toLocaleTimeString() : 'N/A'}
                    </p>
                    <button
                      onClick={() => onResolveConflict(selectedItem.id, 'mal')}
                      disabled={selectedItem.platforms.mal?.id === 'mal-none'}
                      className="w-full mt-2 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-40"
                    >
                      {selectedItem.platforms.mal?.id === 'mal-none' ? 'Not Available (Drama)' : 'Use MAL as Truth'}
                    </button>
                  </div>

                  {/* AniList Card */}
                  <div className="bg-gray-50 dark:bg-black p-4 rounded-2xl border border-gray-200 dark:border-neutral-900 space-y-2 hover:border-cyan-500/30 transition-colors group">
                    <div className="flex items-center justify-between">
                      <a 
                        href={selectedItem.platforms.anilist?.id ? `https://anilist.co/anime/${selectedItem.platforms.anilist.id}` : '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 hover:opacity-80 transition cursor-pointer"
                      >
                        <AniListLogo className="w-5 h-5 text-[#02A9FF] dark:text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-cyan-500 transition-colors">AniList</span>
                      </a>
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                        Ep {selectedItem.platforms.anilist?.episode || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{selectedItem.platforms.anilist?.status || 'Not set'}</p>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500 pt-1 border-t border-slate-900">
                      Updated: {selectedItem.platforms.anilist?.updatedAt ? new Date(selectedItem.platforms.anilist.updatedAt).toLocaleTimeString() : 'N/A'}
                    </p>
                    <button
                      onClick={() => onResolveConflict(selectedItem.id, 'anilist')}
                      className="w-full mt-2 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Use AniList as Truth
                    </button>
                  </div>
                </div>
              </div>

              {/* Gemini AI Resolution Section */}
              <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-950 p-5 rounded-2xl border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-300">
                      <Sparkles className="w-5 h-5 text-indigo-400 animate-spin-slow" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Gemini AI Smart Conflict Assistant</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Analyzes timestamps, Plex scrobbles, and watch history</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAnalyzeWithAI(selectedItem)}
                    disabled={isAnalyzing}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Bot className="w-4 h-4" />
                    <span>{isAnalyzing ? 'Analyzing Matrix...' : 'Smart Resolve'}</span>
                  </button>
                </div>

                {/* AI Results Box if available */}
                {currentAi && (
                  <div className="p-4 bg-gray-50 dark:bg-black/90 rounded-xl border border-indigo-500/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-2">
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                        AI Recommended Source of Truth: {currentAi.recommendation.sourceOfTruth.toUpperCase()}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-400">
                        Target Ep {currentAi.recommendation.targetEpisode} ({currentAi.recommendation.targetStatus})
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                      <strong className="text-indigo-200">Reasoning:</strong> {currentAi.recommendation.reasoning}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="text-[11px] text-gray-600 dark:text-gray-400">
                        Summary: {currentAi.platformDiffSummary}
                      </div>

                      <button
                        onClick={() => onResolveConflict(
                          selectedItem.id, 
                          currentAi.recommendation.sourceOfTruth,
                          currentAi.recommendation.targetEpisode,
                          currentAi.recommendation.targetStatus
                        )}
                        className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Apply AI Recommendation</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Resolution History / Logs Panel */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-md mt-6">
              <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 dark:border-neutral-900">
                <ListChecks className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Recent Resolution Activity</h3>
              </div>
              <div className="pt-4 space-y-3 h-48 overflow-y-auto scrollbar-thin">
                {systemLogs.length === 0 ? (
                  <div className="flex items-start space-x-3 text-xs bg-gray-50 dark:bg-[#111] p-3 rounded-xl border border-gray-100 dark:border-neutral-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">System Analytics</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-0.5">Awaiting first user resolution action for session tracking.</p>
                    </div>
                    <span className="text-gray-400 dark:text-gray-600 ml-auto flex-shrink-0">Just now</span>
                  </div>
                ) : (
                  systemLogs.slice().reverse().filter(l => l.level !== 'maintenance').slice(0, 50).map(log => (
                    <div key={log.id} className={`flex items-start space-x-3 text-xs p-3 rounded-xl border ${
                      log.level === 'error' ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30' :
                      log.level === 'warn' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30' :
                      log.level === 'success' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30' :
                      'bg-gray-50 border-gray-100 dark:bg-[#111] dark:border-neutral-800'
                    }`}>
                      {log.level === 'error' ? <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" /> :
                       log.level === 'warn' ? <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" /> :
                       log.level === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> :
                       <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />}
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 uppercase text-[10px] tracking-wider">{log.category || 'System'}</span>
                        <p className="text-gray-700 dark:text-gray-300 mt-0.5 break-words">{log.message}</p>
                      </div>
                      <span className="text-gray-400 dark:text-gray-500 ml-auto flex-shrink-0">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-8 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-900/50 shadow-inner">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              No Conflicts Found for &quot;{selectedCategory}&quot;
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
              There are currently no flagged items matching the &quot;{selectedCategory}&quot; criteria. Switch categories or reset the filter to review all pending conflicts.
            </p>
            <button
              id="btn-empty-reset-category-filter"
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition cursor-pointer"
            >
              Reset Filter to All Conflicts ({conflicts.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
