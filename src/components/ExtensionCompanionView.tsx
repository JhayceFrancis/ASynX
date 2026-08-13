import React, { useState } from 'react';
import { BrowserExtensionState, LibraryItem } from '../types';
import { 
  Compass, 
  Play, 
  Pause, 
  CheckCircle2, 
  Sliders, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Radio, 
  RefreshCw, 
  Zap,
  Globe,
  Monitor
} from 'lucide-react';

interface ExtensionCompanionViewProps {
  state: BrowserExtensionState;
  libraryItems: LibraryItem[];
  onTriggerExtensionAction: (actionData: any) => void;
}

export const ExtensionCompanionView: React.FC<ExtensionCompanionViewProps> = ({
  state,
  libraryItems,
  onTriggerExtensionAction
}) => {
  const [selectedSite, setSelectedSite] = useState<'Crunchyroll' | 'Netflix' | 'HiDive' | 'Aniwave'>('Crunchyroll');
  const [selectedItemTitle, setSelectedItemTitle] = useState('Solo Leveling Season 2: Arise from the Shadow');
  const [testEpisode, setTestEpisode] = useState(10);
  const [testProgress, setTestProgress] = useState(88);

  const handleSimulatePlayback = () => {
    onTriggerExtensionAction({
      action: 'detect_video',
      mediaTitle: selectedItemTitle,
      episode: testEpisode,
      progressPercent: testProgress,
      site: selectedSite
    });
  };

  const handleSimulateScrobble = () => {
    onTriggerExtensionAction({
      action: 'scrobble',
      mediaTitle: selectedItemTitle,
      episode: testEpisode,
      site: selectedSite
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30 rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">AniSync Matrix Browser Plugin Companion</h2>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            Simulates real-time video player detection & auto-scroobling on Crunchyroll, Netflix, HiDive, and web streaming portals.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Plugin Extension Engine Active</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Extension Popup Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 px-1">
            Simulated Browser Extension Popup Preview
          </h3>

          {/* Chrome Extension Mock Popup Window */}
          <div className="bg-gray-50 dark:bg-black border border-gray-300 dark:border-neutral-800 rounded-3xl p-4 shadow-2xl space-y-4 max-w-sm mx-auto">
            {/* Window Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-neutral-900">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-slate-950 font-black text-xs">
                  A
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">AniSync Matrix Helper</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                Connected
              </span>
            </div>

            {/* Current Active Stream Detector Box */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-3 border border-gray-200 dark:border-neutral-900 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-600 dark:text-gray-400 font-medium flex items-center space-x-1">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Site: {state.activeSite || 'Crunchyroll'}</span>
                </span>
                <span className="text-emerald-400 font-bold animate-pulse">● Live Stream</span>
              </div>

              <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                {state.currentMedia?.title}
              </h4>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400">
                  <span>Season {state.currentMedia?.season} • Episode {state.currentMedia?.episode}</span>
                  <span className="text-cyan-300 font-semibold">{state.currentMedia?.progressPercent}% watched</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-50 dark:bg-black rounded-full h-2 overflow-hidden border border-gray-200 dark:border-neutral-900">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${state.currentMedia?.progressPercent || 85}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Extension Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSimulateScrobble}
                className="py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1 shadow"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Force Scrobble</span>
              </button>
              <button
                onClick={() => onTriggerExtensionAction({ action: 'toggle_overlay' })}
                className="py-2 bg-white dark:bg-[#0a0a0a] hover:bg-gray-100 dark:bg-[#111] text-gray-800 dark:text-gray-200 rounded-xl text-xs font-semibold border border-gray-300 dark:border-neutral-800 transition cursor-pointer flex items-center justify-center space-x-1"
              >
                {state.overlayVisible ? <EyeOff className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{state.overlayVisible ? 'Hide HUD' : 'Show HUD'}</span>
              </button>
            </div>

            {/* Matrix Status Footer inside popup */}
            <div className="pt-2 border-t border-gray-200 dark:border-neutral-900/80 flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400">
              <span>Auto-Sync: Simkl • MAL • AniList</span>
              <span className="text-indigo-400 font-bold">100% Synced</span>
            </div>
          </div>
        </div>

        {/* Right Controls & Web Player Overlay Demo (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Controls to simulate streaming page */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-indigo-400" />
              <span>Simulate Video Playback on Streaming Portal</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Select Streaming Portal</label>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value as any)}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  <option value="Crunchyroll">Crunchyroll</option>
                  <option value="Netflix">Netflix</option>
                  <option value="HiDive">HiDive</option>
                  <option value="Aniwave">Aniwave Portal</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Select Anime / Drama Title</label>
                <select
                  value={selectedItemTitle}
                  onChange={(e) => setSelectedItemTitle(e.target.value)}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  {libraryItems.map(item => (
                    <option key={item.id} value={item.title}>{item.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Episode Number</label>
                <input
                  type="number"
                  value={testEpisode}
                  onChange={(e) => setTestEpisode(Number(e.target.value))}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Playback Watch Progress (%): {testProgress}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={testProgress}
                  onChange={(e) => setTestProgress(Number(e.target.value))}
                  className="w-full mt-2 accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleSimulatePlayback}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Simulate Active Video Stream ({selectedSite})</span>
              </button>

              <button
                onClick={handleSimulateScrobble}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Trigger Auto-Scrobble to Matrix</span>
              </button>
            </div>
          </div>

          {/* Simulated Web Video Player Screen with Overlay HUD */}
          <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-neutral-900 shadow-2xl bg-black aspect-video flex items-center justify-center group">
            {/* Fake Video Player Background */}
            <img
              src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&q=80"
              alt="Video Background"
              className="w-full h-full object-cover opacity-40 blur-xs"
            />

            {/* On-Screen Center Play Indicator */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-[#0a0a0a]/80 text-white flex items-center justify-center border border-gray-300 dark:border-neutral-800 shadow-2xl">
                <Play className="w-8 h-8 text-cyan-400 ml-1" />
              </div>
            </div>

            {/* Video Player Header Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs text-white bg-gray-50 dark:bg-black/80 px-4 py-2 rounded-2xl border border-gray-200 dark:border-neutral-900/80 backdrop-blur-md">
              <span className="font-bold flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span>Streaming on {selectedSite}</span>
              </span>
              <span className="text-gray-700 dark:text-gray-300 font-mono">1080p Full HD</span>
            </div>

            {/* Plugin On-Screen Corner HUD Widget Overlay (if visible) */}
            {state.overlayVisible && (
              <div className="absolute bottom-16 right-4 bg-gray-50 dark:bg-black/90 border border-indigo-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md max-w-xs space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-indigo-300 flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AniSync Plugin HUD</span>
                  </span>
                  <span className="text-emerald-400 font-bold text-[10px]">Synced</span>
                </div>
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{state.currentMedia?.title}</p>
                <div className="flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400">
                  <span>Episode {state.currentMedia?.episode}</span>
                  <span className="text-cyan-300 font-semibold">{state.currentMedia?.progressPercent}%</span>
                </div>
              </div>
            )}

            {/* Video Controls Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent space-y-2">
              <div className="w-full bg-gray-100 dark:bg-[#111] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full" 
                  style={{ width: `${testProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
                <span>{state.currentMedia?.title} - Episode {testEpisode}</span>
                <span>20:10 / 23:40</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
