import React, { useState } from 'react';
import { LibraryItem, PlatformType, WatchStatus } from '../types';
import { X, Sliders, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface OverrideModalProps {
  item: LibraryItem | null;
  onClose: () => void;
  onSubmitOverride: (
    itemId: string,
    targetEpisode: number,
    targetStatus: WatchStatus,
    targetScore: number,
    applyToPlatforms: PlatformType[]
  ) => void;
}

export const OverrideModal: React.FC<OverrideModalProps> = ({
  item,
  onClose,
  onSubmitOverride
}) => {
  const [targetEpisode, setTargetEpisode] = useState<number>(
    Math.max(
      item?.platforms.simkl?.episode || 0,
      item?.platforms.mal?.episode || 0,
      item?.platforms.anilist?.episode || 0
    )
  );
  const [targetStatus, setTargetStatus] = useState<WatchStatus>('watching');
  const [targetScore, setTargetScore] = useState<number>(9);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(['simkl', 'mal', 'anilist']);

  if (!item) return null;

  const togglePlatform = (p: PlatformType) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(x => x !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitOverride(item.id, targetEpisode, targetStatus, targetScore, selectedPlatforms);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-50 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-gray-200 dark:border-neutral-900 pb-3">
          <div className="flex items-center space-x-3">
            <img
              src={item.coverImage}
              alt={item.title}
              className="w-12 h-16 object-cover rounded-xl shadow border border-gray-200 dark:border-neutral-900"
            />
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                Manual Override
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-1 mt-0.5">{item.title}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{item.mediaType.toUpperCase()} • Total {item.totalEpisodes} episodes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-white bg-gray-100 dark:bg-[#111] rounded-xl hover:bg-gray-200 dark:bg-[#1a1a1a] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Episode */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-gray-700 dark:text-gray-300">Set Episode Progress</label>
              <span className="text-indigo-400 font-bold">Max: {item.totalEpisodes}</span>
            </div>
            <input
              type="number"
              min="0"
              max={item.totalEpisodes}
              value={targetEpisode}
              onChange={(e) => setTargetEpisode(Number(e.target.value))}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100 font-bold focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Target Status */}
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Set Watch Status</label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as WatchStatus)}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="plan_to_watch">Plan to Watch</option>
              <option value="paused">Paused</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          {/* Rating Score */}
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Rating Score (1 - 10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Target Platforms Checkboxes */}
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-2">Apply Override to Platforms</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => togglePlatform('simkl')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                  selectedPlatforms.includes('simkl')
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-gray-50 dark:bg-black text-gray-500 dark:text-gray-500 border-gray-200 dark:border-neutral-900'
                }`}
              >
                <span>Simkl</span>
                {selectedPlatforms.includes('simkl') && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => togglePlatform('mal')}
                disabled={item.platforms.mal?.id === 'mal-none'}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                  selectedPlatforms.includes('mal')
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                    : 'bg-gray-50 dark:bg-black text-gray-500 dark:text-gray-500 border-gray-200 dark:border-neutral-900'
                } disabled:opacity-30`}
              >
                <span>MAL</span>
                {selectedPlatforms.includes('mal') && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => togglePlatform('anilist')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                  selectedPlatforms.includes('anilist')
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-gray-50 dark:bg-black text-gray-500 dark:text-gray-500 border-gray-200 dark:border-neutral-900'
                }`}
              >
                <span>AniList</span>
                {selectedPlatforms.includes('anilist') && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 rounded-xl font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold transition shadow cursor-pointer flex items-center justify-center space-x-1"
            >
              <Sliders className="w-4 h-4" />
              <span>Apply Override</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
