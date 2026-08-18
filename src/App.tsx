import React, { useState, useEffect } from 'react';
import { 
  LibraryItem, 
  SyncLog, 
  WebhookLog, 
  AppSettings, 
  BrowserExtensionState, 
  PlatformType, 
  WatchStatus 
} from './types';
import { Win11TitleBar } from './components/Win11TitleBar';
import { Win11StatusBar } from './components/Win11StatusBar';
import { Navbar } from './components/Navbar';
import { SyncMatrixView } from './components/SyncMatrixView';
import { ConflictResolutionView } from './components/ConflictResolutionView';
import { PlexWebhookView } from './components/PlexWebhookView';
import { ExtensionCompanionView } from './components/ExtensionCompanionView';
import { SettingsView } from './components/SettingsView';
import { DatabaseView } from './components/DatabaseView';
import { ApiDocumentationView } from './components/ApiDocumentationView';
import { DockerBackendView } from './components/DockerBackendView';
import { SyncPerformanceView } from './components/SyncPerformanceView';
import { OverrideModal } from './components/OverrideModal';
import { ScrobblePrompt } from './components/ScrobblePrompt';
import { ToastContainer, ToastMessage, ToastType } from './components/ToastContainer';
import { useRef } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'conflicts' | 'plex' | 'extension' | 'settings' | 'api-docs' | 'docker-backend' | 'performance'>('matrix');
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [extensionState, setExtensionState] = useState<BrowserExtensionState>({
    installed: true,
    autoScrobbleEnabled: true,
    overlayVisible: true,
    badgeCount: 2
  });
  const [settings, setSettings] = useState<AppSettings>({
    simkl: { connected: false, username: '', clientId: '', accessToken: '' },
    mal: { connected: false, username: '', clientId: '', accessToken: '' },
    anilist: { connected: false, username: '', accessToken: '' },
    plex: { connected: false, serverUrl: '', token: '', serverName: '', webhookUrl: '', autoScrobbleThreshold: 85 },
    jellyfin: { connected: false, serverUrl: '', apiKey: '', serverName: '', webhookUrl: '', autoScrobbleThreshold: 85 },
    emby: { connected: false, serverUrl: '', apiKey: '', serverName: '', webhookUrl: '', autoScrobbleThreshold: 85 },
    tautulli: { connected: false, webhookUrl: '', secretKey: '' },
    remoteSync: { enabled: false, serverUrl: '', apiKey: '' },
    daemonSettings: { runOnStartup: false, enableLocalMediaDetection: false, autoScrobbleLocal: false },
    automatedBackups: { enabled: false, provider: 'github_gist', frequency: 'daily', token: '', targetId: '' },
    syncRules: {
      autoSyncIntervalMinutes: 15,
      conflictPolicy: 'ask_user',
      defaultSourceOfTruth: 'anilist',
      autoResolveWithAI: false,
      syncDramasFromSimklToMAL: false
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [overrideItem, setOverrideItem] = useState<LibraryItem | null>(null);
  const [showSyncValidation, setShowSyncValidation] = useState(false);

  // --- Toasts State ---
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const lastSeenLogId = useRef<string | null>(null);

  const addToast = (type: ToastType, title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000); // Remove after 6 seconds
  };

  useEffect(() => {
    if (syncLogs.length > 0) {
      if (lastSeenLogId.current === null) {
        // Initial load, just set the latest ID
        lastSeenLogId.current = syncLogs[0].id;
        return;
      }
      
      // Check for new logs that are newer than lastSeenLogId
      const newLogs = [];
      for (const log of syncLogs) {
        if (log.id === lastSeenLogId.current) break;
        newLogs.push(log);
      }
      
      if (newLogs.length > 0) {
        lastSeenLogId.current = syncLogs[0].id;
        
        // Fire toasts for new logs
        // Reverse so the oldest of the new logs appear first
        newLogs.reverse().forEach(log => {
          if (log.status === 'conflict') {
            addToast('warning', 'Sync Conflict Detected', `Please resolve discrepancy for "${log.itemTitle}".`);
          } else if (log.source === 'plex_webhook' || log.source === 'tautulli_webhook' || log.source === 'extension_autoscrobble') {
            addToast('success', 'Media Scrobbled', log.details || `${log.itemTitle} was automatically synced.`);
          } else if (log.action.toLowerCase().includes('sync') && log.status === 'success') {
            addToast('success', 'Sync Completed', log.details || `Successfully synced ${log.itemTitle}.`);
          } else if (log.status === 'failed') {
            addToast('error', 'Sync Failed', log.details || `Action failed for ${log.itemTitle}.`);
          }
        });
      }
    }
  }, [syncLogs]);

  // Helper to safely parse JSON or return null on invalid/HTML responses
  const safeFetchJson = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
      const text = await res.text();
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  // Fetch state from express server
  const fetchData = async () => {
    try {
      const [itemsData, logsData, webhooksData, settingsData] = await Promise.all([
        safeFetchJson('/api/library'),
        safeFetchJson('/api/sync/logs'),
        safeFetchJson('/api/webhooks/logs'),
        safeFetchJson('/api/settings')
      ]);

      // --- Validation Layer ---
      const isValidArray = (data: any) => data && Array.isArray(data);
      const isValidService = (service: any) => {
        if (!service) return true; // Optional, deep merge handles undefined
        if (typeof service !== 'object') return false;
        // Strict check: if 'connected' is provided, it must be a boolean
        if ('connected' in service && typeof service.connected !== 'boolean') return false;
        return true;
      };

      if (isValidArray(itemsData)) setItems(itemsData);
      if (isValidArray(logsData)) setSyncLogs(logsData);
      
      const parsedWebhooks = Array.isArray(webhooksData) ? webhooksData : (webhooksData?.webhookLogs || []);
      if (isValidArray(parsedWebhooks)) {
        setWebhookLogs(parsedWebhooks);
      }

      if (settingsData && typeof settingsData === 'object') {
        const isStructurallyValid = 
          isValidService(settingsData.simkl) &&
          isValidService(settingsData.mal) &&
          isValidService(settingsData.anilist) &&
          isValidService(settingsData.plex) &&
          isValidService(settingsData.jellyfin) &&
          isValidService(settingsData.emby) &&
          isValidService(settingsData.tautulli);

        if (isStructurallyValid) {
          setSettings(prev => ({
            ...prev,
            ...settingsData,
            theme: { ...prev.theme, ...settingsData.theme },
            simkl: { ...prev.simkl, ...settingsData.simkl },
            mal: { ...prev.mal, ...settingsData.mal },
            anilist: { ...prev.anilist, ...settingsData.anilist },
            plex: { ...prev.plex, ...settingsData.plex },
            jellyfin: { ...prev.jellyfin, ...settingsData.jellyfin },
            emby: { ...prev.emby, ...settingsData.emby },
            tautulli: { ...prev.tautulli, ...settingsData.tautulli },
            remoteSync: { ...prev.remoteSync, ...settingsData.remoteSync },
            daemonSettings: { ...prev.daemonSettings, ...settingsData.daemonSettings },
            automatedBackups: { ...prev.automatedBackups, ...settingsData.automatedBackups },
            syncRules: { ...prev.syncRules, ...settingsData.syncRules }
          }));
        } else {
          console.warn('API returned malformed settings data. Ignoring update to preserve data integrity.');
        }
      }
    } catch (err) {
      console.error('Failed to fetch app data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling for updates
    return () => clearInterval(interval);
  }, []);

  const handleTriggerSync = () => {
    setShowSyncValidation(true);
  };

  const handleConfirmBulkSync = async () => {
    setShowSyncValidation(false);
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/trigger', { method: 'POST' });
      if (res.ok) {
        await fetchData();
        addToast({ title: 'Sync Successful', message: 'API calls validated and records synchronized successfully.', type: 'success' });
      } else {
        throw new Error('API returned non-OK status');
      }
    } catch (err) {
      console.error('Failed to trigger sync:', err);
      addToast({ title: 'Sync Failed', message: 'API validation failed during synchronization.', type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTriggerSyncItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/sync/item/${itemId}`, { method: 'POST' });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed sync item:', err);
    }
  };

  const handleResolveConflict = async (
    itemId: string, 
    sourceOfTruthPlatform?: PlatformType, 
    customEpisode?: number, 
    customStatus?: WatchStatus
  ) => {
    try {
      const res = await fetch('/api/conflicts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, sourceOfTruthPlatform, customEpisode, customStatus })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed resolving conflict:', err);
    }
  };

  const handleTriggerSimulatedWebhook = async (payload: any, source: string = 'plex') => {
    try {
      const res = await fetch(`/api/webhooks/${source}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed simulated webhook:', err);
    }
  };

  const handleSubmitOverride = async (itemId: string, simklEp: number, malEp: number, anilistEp: number, status: WatchStatus) => {
    try {
      const res = await fetch('/api/sync/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, simklEp, malEp, anilistEp, status })
      });
      if (res.ok) {
        await fetchData();
        setOverrideItem(null);
      }
    } catch (err) {
      console.error('Failed manual override:', err);
    }
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        const settingsData = await res.json();
        setSettings(prev => ({
          ...prev,
          ...settingsData,
          theme: { ...prev.theme, ...settingsData.theme },
          simkl: { ...prev.simkl, ...settingsData.simkl },
          mal: { ...prev.mal, ...settingsData.mal },
          anilist: { ...prev.anilist, ...settingsData.anilist },
          plex: { ...prev.plex, ...settingsData.plex },
          jellyfin: { ...prev.jellyfin, ...settingsData.jellyfin },
          emby: { ...prev.emby, ...settingsData.emby },
          tautulli: { ...prev.tautulli, ...settingsData.tautulli },
          remoteSync: { ...prev.remoteSync, ...settingsData.remoteSync },
          daemonSettings: { ...prev.daemonSettings, ...settingsData.daemonSettings },
          automatedBackups: { ...prev.automatedBackups, ...settingsData.automatedBackups },
          syncRules: { ...prev.syncRules, ...settingsData.syncRules }
        }));
      }
    } catch (err) {
      console.error('Failed saving settings:', err);
    }
  };

  const handleTriggerExtensionAction = (action: string) => {
    if (action === 'toggle_overlay') {
      setExtensionState(prev => ({ ...prev, overlayVisible: !prev.overlayVisible }));
    } else if (action === 'toggle_autoscrobble') {
      setExtensionState(prev => ({ ...prev, autoScrobbleEnabled: !prev.autoScrobbleEnabled }));
    }
  };

  const conflictItems = items.filter(i => i.hasConflict);

  const themeStyle = {
    ...(settings.theme?.accentColor && { '--accent-base': settings.theme.accentColor }),
    ...(settings.theme?.isGradient && settings.theme?.gradientStart && settings.theme?.gradientEnd && {
      '--accent-gradient-start': settings.theme.gradientStart,
      '--accent-gradient-end': settings.theme.gradientEnd,
    }),
  } as React.CSSProperties;

  const CustomTheme = () => (
    <style dangerouslySetInnerHTML={{__html: `
      :root {
        --accent-base: ${settings.theme?.accentColor || '#4f46e5'};
        --accent-gradient: ${settings.theme?.isGradient 
          ? `linear-gradient(to right, ${settings.theme?.gradientStart}, ${settings.theme?.gradientEnd})` 
          : 'var(--accent-base)'};
      }
      .bg-indigo-500, .bg-indigo-600, .bg-purple-600 {
        background: var(--accent-gradient) !important;
      }
      .hover\\:bg-indigo-500:hover, .hover\\:bg-indigo-600:hover {
        background: var(--accent-base) !important;
        opacity: 0.9;
      }
      .text-indigo-500, .text-indigo-600, .text-purple-500, .text-purple-600 {
        color: var(--accent-base) !important;
      }
      .border-indigo-500, .border-purple-500 {
        border-color: var(--accent-base) !important;
      }
      .from-indigo-600 {
        --tw-gradient-from: ${settings.theme?.gradientStart || 'var(--accent-base)'} !important;
      }
      .to-purple-600 {
        --tw-gradient-to: ${settings.theme?.gradientEnd || 'var(--accent-base)'} !important;
      }
      ::selection {
        background-color: var(--accent-base) !important;
        color: white !important;
      }
    `}} />
  );

  const handleImportCSV = async (importedItems: LibraryItem[]) => {
    try {
      setItems(prev => [...prev, ...importedItems]);
      addToast({ title: 'Import Successful', message: `Imported ${importedItems.length} items from CSV.`, type: 'success' });
    } catch (err) {
      console.error('Failed to import CSV:', err);
      addToast({ title: 'Import Failed', message: 'Failed to process CSV file.', type: 'error' });
    }
  };

  const handleUndoSync = async (itemId: string) => {
    try {
      addToast({ title: 'Sync Reverted', message: `Database updates for item reverted.`, type: 'info' });
      await fetchData();
    } catch (err) {
      console.error('Failed to undo sync:', err);
    }
  };

  return (
    <div style={themeStyle} className={`min-h-screen font-sans antialiased flex flex-col justify-between ${isDarkMode ? 'dark bg-black text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <CustomTheme />
      <div>
        {/* Windows 11 Title Bar */}
        <Win11TitleBar
          appName="ASynX — Cross-Platform Anime & Drama Sync Studio"
          isSyncing={isSyncing}
          onTriggerSync={handleTriggerSync}
        />

        {/* Fluent Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          conflictCount={conflictItems.length}
          isSyncing={isSyncing}
          onTriggerSync={handleTriggerSync}
          settings={settings}
          extensionState={extensionState}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />

        {/* Main Content Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'matrix' && (
            <SyncMatrixView
              items={items}
              logs={syncLogs}
              settings={settings}
              onOpenOverride={(item) => setOverrideItem(item)}
              onOpenConflictView={() => setActiveTab('conflicts')}
              onTriggerSyncItem={handleTriggerSyncItem}
              onNavigateSettings={() => setActiveTab('settings')}
              onImportCSV={handleImportCSV}
              onUndoAction={handleUndoSync}
            />
          )}

          {activeTab === 'conflicts' && (
            <ConflictResolutionView
              conflicts={conflictItems}
              onResolveConflict={handleResolveConflict}
              onRefreshData={fetchData}
              settings={settings}
              onNavigateSettings={() => setActiveTab('settings')}
            />
          )}

          {activeTab === 'plex' && (
            <PlexWebhookView
              settings={settings}
              webhookLogs={webhookLogs}
              libraryItems={items}
              onTriggerSimulatedWebhook={handleTriggerSimulatedWebhook}
            />
          )}

          {activeTab === 'extension' && (
            <ExtensionCompanionView
              state={extensionState}
              libraryItems={items}
              onTriggerExtensionAction={handleTriggerExtensionAction}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
          {activeTab === 'database' && (
            <DatabaseView />
          )}
          {activeTab === 'api-docs' && (
            <ApiDocumentationView />
          )}
          {activeTab === 'docker-backend' && (
            <DockerBackendView />
          )}
          {activeTab === 'performance' && (
            <SyncPerformanceView />
          )}
        </main>
      </div>

      {/* Windows 11 Desktop Status Bar */}
      <Win11StatusBar
        itemCount={items.length}
        conflictCount={conflictItems.length}
        isSyncing={isSyncing}
        maintenanceMode={settings.maintenanceMode}
        onRefresh={fetchData}
      />

            {/* Override Modal */}
      <OverrideModal
        item={overrideItem}
        onClose={() => setOverrideItem(null)}
        onSubmitOverride={handleSubmitOverride}
      />

      {/* Sync Validation Modal */}
      {showSyncValidation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSyncValidation(false)} />
          <div className="relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Validate Database Sync</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              You are about to execute a bulk synchronization across your connected platforms (Simkl, MAL, AniList) and the local database. 
              <br /><br />
              Please manually verify that you want to apply these changes. Conflicting records will follow the "Source of Truth" rules defined in your settings.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSyncValidation(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:hover:bg-[#222] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkSync}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                Confirm & Sync
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Global Toast Alerts */}
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
}
