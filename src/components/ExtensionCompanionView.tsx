import { apiFetch as fetch } from '../apiFetch';
import React, { useState, useEffect } from 'react';
import { BrowserExtensionState, LibraryItem, AppSettings } from '../types';
import { 
  Play, 
  CheckCircle2, 
  Sliders, 
  Eye, 
  EyeOff, 
  Zap,
  Globe,
  Monitor,
  Settings,
  Lock,
  Link,
  Shield,
  PauseCircle,
  PlayCircle,
  Layers,
  Settings2,
  Terminal
} from 'lucide-react';
import { ASynXLogo } from './ASynXLogo';

interface ExtensionCompanionViewProps {
  state: BrowserExtensionState;
  libraryItems: LibraryItem[];
  onTriggerExtensionAction: (actionData: any) => void;
  settings?: AppSettings;
}

export const ExtensionCompanionView: React.FC<ExtensionCompanionViewProps> = ({
  state,
  libraryItems,
  onTriggerExtensionAction,
  settings
}) => {
  const [selectedSite, setSelectedSite] = useState<string>('Crunchyroll');
  const [selectedItemTitle, setSelectedItemTitle] = useState('Solo Leveling Season 2: Arise from the Shadow');
  const [testEpisode, setTestEpisode] = useState(10);
  const [testProgress, setTestProgress] = useState(88);
  const [activeTab, setActiveTab] = useState<'simulator' | 'settings'>('simulator');
  const [backendUrl, setBackendUrl] = useState(`http://localhost:${import.meta.env.VITE_PORT || 3000}`);
  const [apiKey, setApiKey] = useState('sync_key_abc123');
  const [idpSyncEnabled, setIdpSyncEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  
  // New State variables for Permissions and Scrobble Management
  const [permissionsAllowed, setPermissionsAllowed] = useState(true);
  const [autoScrobblePaused, setAutoScrobblePaused] = useState(false);
  const [multiplePlayersEnabled, setMultiplePlayersEnabled] = useState(true);

  const [isEditingMatch, setIsEditingMatch] = useState(false);
  const [editTitle, setEditTitle] = useState(state.currentMedia?.title || '');
  const [editSeason, setEditSeason] = useState(state.currentMedia?.season || 1);
  const [editEpisode, setEditEpisode] = useState(state.currentMedia?.episode || 1);

  // Active status based on settings
  const isExtensionEngineActive = settings?.extensionEnabled ?? state.installed;

  React.useEffect(() => {
    if (state.currentMedia && !isEditingMatch) {
      setEditTitle(state.currentMedia.title);
      setEditSeason(state.currentMedia.season);
      setEditEpisode(state.currentMedia.episode);
    }
  }, [state.currentMedia, isEditingMatch]);

  const handleSaveMatch = () => {
    onTriggerExtensionAction({ 
      action: 'correct_mismatch', 
      payload: { title: editTitle, season: editSeason, episode: editEpisode } 
    });
    setIsEditingMatch(false);
    setSelectedItemTitle(editTitle);
    setTestEpisode(editEpisode);
  };

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

  const testConnection = async () => {
    setConnectionStatus('connecting');
    try {
      const url = backendUrl.replace(/\/$/, '') + '/api/status';
      const res = await fetch(url);
      if (res.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (e) {
      setConnectionStatus('disconnected');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30 rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center">
              <ASynXLogo size={24} className="text-cyan-300" />
            </span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">ASynX Browser Plugin Companion</h2>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            Simulates real-time video player detection & auto-scroobling on Windows desktop apps (MPC-BE, VLC, Plex, Stremio) and web streaming portals (Crunchyroll, Netflix, HiDive).
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isExtensionEngineActive ? (
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Plugin Extension Engine Active</span>
          </span>
          ) : (
          <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30 text-xs font-semibold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span>Plugin Extension Engine Inactive</span>
          </span>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-neutral-900 pb-px">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'simulator' 
              ? 'bg-white dark:bg-[#0a0a0a] text-indigo-600 dark:text-indigo-400 border-t border-l border-r border-gray-200 dark:border-neutral-900 -mb-px' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span>Playback Simulator</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'settings' 
              ? 'bg-white dark:bg-[#0a0a0a] text-indigo-600 dark:text-indigo-400 border-t border-l border-r border-gray-200 dark:border-neutral-900 -mb-px' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Plugin Settings</span>
          </div>
        </button>
      </div>

      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-b-3xl rounded-tr-3xl p-6 shadow-sm">
          {/* Browser Extension Popup UI Mockup */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-w-[360px] mx-auto w-full">
            {/* Extension Header */}
            <div className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-neutral-800 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ASynXLogo size={20} className="text-indigo-500" />
                <span className="font-extrabold text-gray-900 dark:text-gray-100 text-sm tracking-tight">ASynX Plugin</span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings 
                  className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" 
                  onClick={() => setActiveTab('settings')}
                />
              </div>
            </div>

            {/* Extension Body */}
            <div className="p-5 space-y-5 flex-1">
              <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-4 flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-0.5">Engine Connected</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Listening for media on known streaming portals...</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider">Test Simulator</label>
                
                <div>
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                  >
                    <optgroup label="Web Portals">
                      <option value="Crunchyroll">Crunchyroll</option>
                      <option value="Netflix">Netflix Web</option>
                      <option value="HiDive">HiDive</option>
                    </optgroup>
                    <optgroup label="Native Windows Apps">
                      <option value="MPC-BE">MPC-BE (Local)</option>
                      <option value="VLC">VLC Media Player</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <select
                    value={selectedItemTitle}
                    onChange={(e) => setSelectedItemTitle(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                  >
                    {libraryItems.map(item => (
                      <option key={item.id} value={item.title}>{item.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-500 block mb-1">Episode</label>
                    <input
                      type="number"
                      value={testEpisode}
                      onChange={(e) => setTestEpisode(Number(e.target.value))}
                      className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-lg px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-500 block mb-1">Progress: {testProgress}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={testProgress}
                      onChange={(e) => setTestProgress(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Extension Footer Actions */}
            <div className="p-4 border-t border-gray-100 dark:border-neutral-900 bg-gray-50 dark:bg-[#151515] space-y-2">
              <button
                onClick={handleSimulatePlayback}
                className="w-full py-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Simulate Video Play</span>
              </button>
              
              <button
                onClick={handleSimulateScrobble}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Trigger Scrobble</span>
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
                    <ASynXLogo size={14} className="text-indigo-400" />
                    <span>ASynX Extension</span>
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
      )}

      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-b-3xl rounded-tr-3xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-900 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                <span>Remote Connection Security (GDPR Compliant)</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">Configure secure, encrypted connections to your Windows App or Docker Instance.</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 ${
              connectionStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
              connectionStatus === 'connecting' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
              'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500' : connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{connectionStatus === 'connected' ? 'Connected to Backend' : connectionStatus === 'connecting' ? 'Verifying Handshake...' : 'Disconnected'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-gray-600 dark:text-gray-400 font-medium block mb-1">Backend Target URL (Docker / Local)</label>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={backendUrl}
                    onChange={(e) => { setBackendUrl(e.target.value); setConnectionStatus('disconnected'); }}
                    className="flex-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    placeholder={`http://localhost:${import.meta.env.VITE_PORT || 3000}`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-600 dark:text-gray-400 font-medium block mb-1">API Key / Access Token</label>
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => { setApiKey(e.target.value); setConnectionStatus('disconnected'); }}
                    className="flex-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Enter your sync API key"
                  />
                </div>
              </div>
              
              <button 
                onClick={testConnection}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors"
              >
                Verify Connection Handshake
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-200 dark:border-white/10 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-medium">
                <Link className="w-5 h-5" />
                <h4>IDP Auto-Synchronization</h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Automatically sync watch states and library overrides across your browser plugin, Windows app, and Docker instance using your Identity Provider (IDP) email.
              </p>
              
              <div className="flex items-center justify-between p-3 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-neutral-800">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Enable IDP Syncing</span>
                <button
                  onClick={() => setIdpSyncEnabled(!idpSyncEnabled)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${idpSyncEnabled ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${idpSyncEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {idpSyncEnabled && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start space-x-3 text-emerald-700 dark:text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Active:</strong> Instances will auto-negotiate credentials based on your linked IDP (Google/GitHub) email. Personal data payloads are End-to-End Encrypted (E2EE) and GDPR compliant.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* New Section: Permissions & Middleware Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-neutral-900">
            {/* Scrobble & Permissions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold">Browser Permissions & Overrides</h4>
              </div>
              <p className="text-xs text-gray-500">
                Manage site access permissions and manually override auto-scrobbling when viewing media.
              </p>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/40 rounded-xl border border-gray-200 dark:border-neutral-800">
                <div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 block">Read Web Page DOM</span>
                  <span className="text-xs text-gray-500">Required to detect media titles from page structure</span>
                </div>
                <button
                  onClick={() => setPermissionsAllowed(!permissionsAllowed)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${permissionsAllowed ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${permissionsAllowed ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/40 rounded-xl border border-gray-200 dark:border-neutral-800">
                <div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 block">Pause Auto-Scrobble</span>
                  <span className="text-xs text-gray-500">Temporarily halt tracking without disabling extension</span>
                </div>
                <button
                  onClick={() => setAutoScrobblePaused(!autoScrobblePaused)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    autoScrobblePaused 
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
                      : 'bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-700'
                  }`}
                >
                  {autoScrobblePaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                  <span>{autoScrobblePaused ? 'Resume' : 'Pause'}</span>
                </button>
              </div>
            </div>

            {/* Multiple Players Middleware */}
            <div className="bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-500/10 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400">
                <Layers className="w-5 h-5" />
                <h4 className="font-bold">Multi-Player Middleware Routing</h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                If auto detection is preferred by users with multiple players (e.g. webapp Crunchyroll and locally installed MPC-BE software), this ensures both instances sync gracefully without conflicting progression events.
              </p>
              
              <div className="flex items-center justify-between p-3 bg-white dark:bg-black/60 rounded-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Middleware Daemon</span>
                </div>
                <button
                  onClick={() => setMultiplePlayersEnabled(!multiplePlayersEnabled)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${multiplePlayersEnabled ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${multiplePlayersEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {multiplePlayersEnabled && (
                <div className="pt-2">
                  <div className="p-3 bg-white dark:bg-black/40 border border-gray-200 dark:border-neutral-800 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                      <span>Primary Source</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">MPC-BE (Local)</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                      <span>Secondary Source</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Crunchyroll Web</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-100 dark:border-neutral-800">
                      <button className="text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center space-x-1">
                        <Settings2 className="w-3.5 h-3.5" />
                        <span>Configure Advanced Routing Rules</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
