import React, { useState, useEffect } from 'react';
import { LibraryItem, PlatformType, WatchStatus, AIConflictAnalysis, AppSettings } from '../types';
import { Tooltip } from './Tooltip';
import { 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Sliders, 
  Bot, 
  RotateCcw,
  Layers,
  ChevronRight,
  CheckSquare,
  Square,
  Zap,
  ListChecks
} from 'lucide-react';

interface ConflictResolutionViewProps {
  conflicts: LibraryItem[];
  onResolveConflict: (itemId: string, sourceOfTruthPlatform?: PlatformType, customEpisode?: number, customStatus?: WatchStatus) => void;
  onRefreshData?: () => void;
  settings?: AppSettings;
}

export const ConflictResolutionView: React.FC<ConflictResolutionViewProps> = ({
  conflicts,
  onResolveConflict,
  onRefreshData,
  settings
}) => {
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(conflicts[0]?.id || null);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, AIConflictAnalysis>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Bulk Action Selection state
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);
  const initialSOT = (settings?.syncRules?.defaultSourceOfTruth || settings?.sourceOfTruth || 'anilist') as 'anilist' | 'simkl' | 'mal' | 'highest_episode';
  const [bulkStrategy, setBulkStrategy] = useState<'anilist' | 'simkl' | 'mal' | 'highest_episode'>(initialSOT);
  const [isBulkResolving, setIsBulkResolving] = useState<boolean>(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      const sot = (settings.syncRules?.defaultSourceOfTruth || settings.sourceOfTruth || 'anilist') as 'anilist' | 'simkl' | 'mal' | 'highest_episode';
      setBulkStrategy(sot);
    }
  }, [settings]);

  const selectedItem = conflicts.find(c => c.id === selectedConflictId) || conflicts[0];

  const handleToggleSelectAll = () => {
    if (bulkSelectedIds.length === conflicts.length) {
      setBulkSelectedIds([]);
    } else {
      setBulkSelectedIds(conflicts.map(c => c.id));
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

  if (conflicts.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-4 my-8">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Zero Desync Conflicts Found</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          All your tracked anime and drama progress across Simkl, MyAnimeList, and AniList are in 100% matrix synchronization. Real-time webhooks and scroobles are aligned.
        </p>
      </div>
    );
  }

  const currentAi = selectedItem ? aiAnalysis[selectedItem.id] : undefined;

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

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-xs">
            {conflicts.length} Pending {conflicts.length === 1 ? 'Conflict' : 'Conflicts'}
          </span>
        </div>
      </div>

      {/* BULK-ACTION FEATURE TOOLBAR */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-5 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 hover:border-gray-300 dark:border-neutral-800 text-gray-700 dark:text-gray-300 text-xs font-semibold cursor-pointer transition"
            >
              {bulkSelectedIds.length === conflicts.length ? (
                <CheckSquare className="w-4 h-4 text-indigo-400" />
              ) : (
                <Square className="w-4 h-4 text-gray-500 dark:text-gray-500" />
              )}
              <span>{bulkSelectedIds.length === conflicts.length ? 'Deselect All' : 'Select All Conflicts'}</span>
            </button>

            <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
              <strong className="text-indigo-300">{bulkSelectedIds.length}</strong> of {conflicts.length} Selected
            </span>
          </div>

          {/* Strategy Selector & Apply Button */}
          <div className="flex items-center space-x-2.5 w-full md:w-auto">
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-black px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-900 text-xs text-gray-700 dark:text-gray-300 w-full md:w-auto">
              <ListChecks className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap hidden sm:inline">Strategy:</span>
              <select
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
              onClick={handleApplyBulkStrategy}
              disabled={bulkSelectedIds.length === 0 || isBulkResolving}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs shadow transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0 disabled:opacity-40"
            >
              <Zap className="w-4 h-4" />
              <span>{isBulkResolving ? 'Resolving...' : 'Apply Strategy'}</span>
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 px-1">
            Flagged Items ({conflicts.length})
          </h3>
          <div className="space-y-2">
            {conflicts.map((item) => {
              const isSelected = item.id === (selectedItem?.id);
              const isBulkChecked = bulkSelectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedConflictId(item.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-900/30 border-indigo-500 shadow-md'
                      : 'bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-neutral-900 hover:border-gray-300 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button
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
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-amber-400 mt-0.5 line-clamp-1">
                        {item.conflictDetails?.summary || 'Desync detected'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Conflict Detailed Resolution Workspace (8 cols) */}
        {selectedItem && (
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
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Conflict Identified
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{selectedItem.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{selectedItem.japaneseTitle}</p>
                  <p className="text-xs text-amber-300/90 mt-1 font-medium">
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
                  <div className="bg-gray-50 dark:bg-black p-4 rounded-2xl border border-gray-200 dark:border-neutral-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Simkl</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
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
                  <div className="bg-gray-50 dark:bg-black p-4 rounded-2xl border border-gray-200 dark:border-neutral-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">MyAnimeList</span>
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
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
                  <div className="bg-gray-50 dark:bg-black p-4 rounded-2xl border border-gray-200 dark:border-neutral-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">AniList</span>
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
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
                    <span>{isAnalyzing ? 'Analyzing Matrix...' : 'Run AI Analysis'}</span>
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
          </div>
        )}
      </div>
    </div>
  );
};
