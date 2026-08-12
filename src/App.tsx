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
import { OverrideModal } from './components/OverrideModal';
import { ScrobblePrompt } from './components/ScrobblePrompt';
import { ToastContainer, ToastMessage, ToastType } from './components/ToastContainer';
import { useRef } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'conflicts' | 'plex' | 'extension' | 'settings'>('matrix');
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
    simkl: { connected: true, username: 'OtakuMatrix_2026', clientId: '' },
    mal: { connected: true, username: 'MatrixAnimeMaster' },
    anilist: { connected: true, username: 'MatrixOtaku' },
    plex: { connected: true, serverIp: '192.168.1.100', port: 32400, autoScrobbleThreshold: 85 },
    tautulli: { connected: true, url: 'http://192.168.1.100:8181', apiKey: '' },
    syncIntervalMinutes: 15,
    autoResolveConflicts: false,
    sourceOfTruth: 'anilist'
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [overrideItem, setOverrideItem] = useState<LibraryItem | null>(null);

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

      if (itemsData && Array.isArray(itemsData)) setItems(itemsData);
      if (logsData && Array.isArray(logsData)) setSyncLogs(logsData);
      if (webhooksData) {
        setWebhookLogs(Array.isArray(webhooksData) ? webhooksData : (webhooksData.webhookLogs || []));
      }
      if (settingsData && typeof settingsData === 'object') setSettings(settingsData);
    } catch (err) {
      console.error('Failed to fetch app data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling for updates
    return () => clearInterval(interval);
  }, []);

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/trigger', { method: 'POST' });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to trigger sync:', err);
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

  const handleTriggerSimulatedWebhook = async (payload: any) => {
    try {
      const res = await fetch('/api/webhooks/plex', {
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
        setSettings(await res.json());
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

  return (
    <div className={`min-h-screen font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col justify-between ${isDarkMode ? 'dark bg-black text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
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
            />
          )}

          {activeTab === 'conflicts' && (
            <ConflictResolutionView
              conflicts={conflictItems}
              onResolveConflict={handleResolveConflict}
              onRefreshData={fetchData}
              settings={settings}
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
        </main>
      </div>

      {/* Windows 11 Desktop Status Bar */}
      <Win11StatusBar
        itemCount={items.length}
        conflictCount={conflictItems.length}
        isSyncing={isSyncing}
        maintenanceMode={settings.maintenanceMode}
      />

            {/* Override Modal */}
      <OverrideModal
        item={overrideItem}
        onClose={() => setOverrideItem(null)}
        onSubmitOverride={handleSubmitOverride}
      />
      
      {/* Global Toast Alerts */}
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
}
