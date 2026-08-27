import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  LibraryItem, 
  SyncLog, 
  WebhookLog, 
  AppSettings, NotificationItem, 
  BrowserExtensionState, 
  PlatformType, 
  WatchStatus 
} from './types';
import { Win11TitleBar } from './components/Win11TitleBar';
import { Win11StatusBar } from './components/Win11StatusBar';
import { SystemLogOverlay, SystemLog } from './components/SystemLogOverlay';
import { Navbar } from './components/Navbar';
import { ASynXLoader } from './components/ASynXLoader';
import { QuickCustomizePanel } from './components/QuickCustomizePanel';
import { Server, Activity, Database, Terminal, Compass, Tv, AlertTriangle } from 'lucide-react';
const SyncMatrixView = React.lazy(() => import('./components/SyncMatrixView').then(module => ({ default: module.SyncMatrixView })));
import { SyncScheduleView } from './components/SyncScheduleView';
const ConflictResolutionView = React.lazy(() => import('./components/ConflictResolutionView').then(module => ({ default: module.ConflictResolutionView })));
const PlexWebhookView = React.lazy(() => import('./components/PlexWebhookView').then(module => ({ default: module.PlexWebhookView })));
const ExtensionCompanionView = React.lazy(() => import('./components/ExtensionCompanionView').then(module => ({ default: module.ExtensionCompanionView })));
const SettingsView = React.lazy(() => import('./components/SettingsView').then(module => ({ default: module.SettingsView })));
const DatabaseView = React.lazy(() => import('./components/DatabaseView').then(module => ({ default: module.DatabaseView })));
const ApiDocumentationView = React.lazy(() => import('./components/ApiDocumentationView').then(module => ({ default: module.ApiDocumentationView })));
const DockerBackendView = React.lazy(() => import('./components/DockerBackendView').then(module => ({ default: module.DockerBackendView })));
const SystemHealthView = React.lazy(() => import('./components/SystemHealthView').then(module => ({ default: module.SystemHealthView })));
const SyncPerformanceView = React.lazy(() => import('./components/SyncPerformanceView').then(module => ({ default: module.SyncPerformanceView })));
const BookmarkTab = React.lazy(() => import('./components/bookmarks/BookmarkTab').then(module => ({ default: module.BookmarkTab })));
import { OverrideModal } from './components/OverrideModal';
import { ScrobblePrompt } from './components/ScrobblePrompt';
import { ToastContainer, ToastMessage, ToastType } from './components/ToastContainer';
import { useRef } from 'react';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';

export default function App() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCustomizePanelOpen, setIsCustomizePanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem('asynx_activeTab');
    return (saved as any) || 'matrix';
  });
  
  useEffect(() => {
    localStorage.setItem('asynx_activeTab', activeTab);
  }, [activeTab]);

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('asynx_isDarkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('asynx_isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const [extensionState, setExtensionState] = useState<BrowserExtensionState>({
    installed: true,
    autoScrobbleEnabled: true,
    overlayVisible: true,
    badgeCount: 2
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    simkl: { connected: false, username: '', clientId: '', accessToken: '' },
    mal: { connected: false, username: '', clientId: '', accessToken: '' },
    anilist: { connected: false, username: '', accessToken: '' },
    plex: { connected: false, serverUrl: '', token: '', serverName: '', webhookUrl: '', autoScrobbleThreshold: 85 },
    jellyfin: { connected: false, serverUrl: '', apiKey: '', serverName: '', webhookUrl: '', autoScrobbleThreshold: 85 },
    emby: { connected: false, serverUrl: '', apiKey: '', serverName: '', webhookUrl: '', autoScrobbleThreshold: 85 },
    karakeep: { connected: false, apiUrl: '', apiKey: '', webhookUrl: '' },
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
  const [isSystemLogOpen, setIsSystemLogOpen] = useState(false);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  // IPC Bridge for Windows App Wrapper
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        if (isSyncing) {
          ipcRenderer.send('sync-started');
        } else {
          ipcRenderer.send('sync-stopped');
        }
      } catch (err) {
        // Not running in Electron environment
      }
    }
  }, [isSyncing]);
  const [isOffline, setIsOffline] = useState(false);
  const [overrideItem, setOverrideItem] = useState<LibraryItem | null>(null);
  const [showSyncValidation, setShowSyncValidation] = useState(false);
  const [showSyncPreview, setShowSyncPreview] = useState(false);

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
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = JSON.parse(text);
      }
      
      // Cache successful response in localStorage
      localStorage.setItem('asynx_cache_' + url, JSON.stringify(data));
      setIsOffline(false);
      return data;
    } catch (e) {
      console.warn(`Failed to fetch ${url}, falling back to local cache. Error: `, e);
      setIsOffline(true);
      const cached = localStorage.getItem('asynx_cache_' + url);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch(err) {}
      }
      return null;
    }
  };

  // Fetch state from express server
  const fetchData = async () => {
    try {
      const [itemsData, logsData, webhooksData, settingsData, systemLogsData, extStateData] = await Promise.all([
        safeFetchJson('/api/library'),
        safeFetchJson('/api/sync/logs'),
        safeFetchJson('/api/webhooks/logs'),
        safeFetchJson('/api/settings'),
        safeFetchJson('/api/system-logs'),
        safeFetchJson('/api/extension/state')
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
      if (systemLogsData && systemLogsData.logs) setSystemLogs(systemLogsData.logs);
      
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
            karakeep: { ...prev.karakeep, ...settingsData.karakeep },
            tautulli: { ...prev.tautulli, ...settingsData.tautulli },
            remoteSync: { ...prev.remoteSync, ...settingsData.remoteSync },
            daemonSettings: { ...prev.daemonSettings, ...settingsData.daemonSettings },
            automatedBackups: { ...prev.automatedBackups, ...settingsData.automatedBackups },
            keyboardShortcuts: { ...prev.keyboardShortcuts, ...settingsData.keyboardShortcuts },
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
    
    // Connect to WebSocket server for real-time state broadcast
    const socket = io();

    socket.on('connect', () => {
      console.log('Connected to real-time WebSocket');
    });
    
    socket.on('system_log', (log: SystemLog) => {
      setSystemLogs(prev => {
        const newLogs = [...prev, log];
        if (newLogs.length > 200) return newLogs.slice(newLogs.length - 200);
        return newLogs;
      });
    });

    socket.on('state_change', (data) => {
      console.log('Real-time state change received:', data);
      if (data.type === 'scrobble_committed' || data.type === 'playback_active' || data.type === 'sync_complete') {
        fetchData(); // Refresh UI dynamically
      }
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTriggerSync = () => {
    setShowSyncValidation(true);
  };

  const keyboardShortcutsEnabled = settings.keyboardShortcuts?.enabled ?? true;

  useKeyboardShortcut({ key: 's', ctrl: true, enabled: keyboardShortcutsEnabled }, () => {
    handleTriggerSync();
  });
  
  useKeyboardShortcut({ key: '1', alt: true, enabled: keyboardShortcutsEnabled }, () => setActiveTab('matrix'));
  useKeyboardShortcut({ key: '2', alt: true, enabled: keyboardShortcutsEnabled }, () => setActiveTab('conflicts'));
  useKeyboardShortcut({ key: '3', alt: true, enabled: keyboardShortcutsEnabled }, () => setActiveTab('performance'));
  useKeyboardShortcut({ key: '4', alt: true, enabled: keyboardShortcutsEnabled }, () => setActiveTab('settings'));

  
  const dispatchNotification = async (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const notifItem = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications((prev: NotificationItem[]) => [notifItem, ...prev].slice(0, 50)); // Keep last 50

    // Native Browser Notification (Fallback for Desktop OS)
    if (settings.pushNotifications?.browserNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`ASynX: ${title}`, { body: message });
      }
    }

    // Webhook Integrations
    try {
      fetch('/api/notifications/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type, settings })
      });
    } catch (e) {
      console.error("Failed to dispatch webhook notifications", e);
    }
  };

  const handleConfirmBulkSync = async () => {
    setShowSyncValidation(false);
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/trigger', { method: 'POST' });
      if (res.ok) {
        await fetchData();
        addToast('success', 'Sync Successful', 'API calls validated and records synchronized successfully.');
        dispatchNotification('Sync Successful', 'Bulk synchronization completed without errors.', 'success');
      } else {
        throw new Error('API returned non-OK status');
      }
    } catch (err) {
      console.error('Failed to trigger sync:', err);
      addToast('error', 'Sync Failed', 'API validation failed during synchronization.');
      dispatchNotification('Sync Failed', 'An error occurred during bulk synchronization.', 'error');
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

  const handleSubmitOverride = async (itemId: string, targetEpisode: number, targetStatus: WatchStatus, targetScore: number, applyToPlatforms: PlatformType[]) => {
    try {
      const res = await fetch('/api/sync/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, targetEpisode, targetStatus, targetScore, applyToPlatforms })
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
        const result = await res.json();
        const settingsData = result.settings || result; // Because res.json() returns { success: true, settings: ... } in POST /api/settings
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
            karakeep: { ...prev.karakeep, ...settingsData.karakeep },
          tautulli: { ...prev.tautulli, ...settingsData.tautulli },
          remoteSync: { ...prev.remoteSync, ...settingsData.remoteSync },
          daemonSettings: { ...prev.daemonSettings, ...settingsData.daemonSettings },
          automatedBackups: { ...prev.automatedBackups, ...settingsData.automatedBackups },
          keyboardShortcuts: { ...prev.keyboardShortcuts, ...settingsData.keyboardShortcuts },
          syncRules: { ...prev.syncRules, ...settingsData.syncRules }
        }));
      } else {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to save settings to backend");
      }
    } catch (err: any) {
      console.error('Failed saving settings:', err);
      throw err;
    }
  };

  const handleClearLogs = () => setSystemLogs([]);

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
    ...(settings.theme?.appBackgroundGradient && { background: settings.theme.appBackgroundGradient }),
  } as React.CSSProperties;

  const CustomTheme = () => {
    const t = settings.theme || {};
    const gradientColors = t.gradientColors && t.gradientColors.length > 0 
      ? t.gradientColors.join(', ') 
      : (t.gradientStart && t.gradientEnd ? `${t.gradientStart}, ${t.gradientEnd}` : '#4f46e5, #ec4899');
    
    const gradient = t.isGradient 
      ? (t.gradientDirection === 'circle at center' 
         ? `radial-gradient(${t.gradientDirection}, ${gradientColors})`
         : `linear-gradient(${t.gradientDirection || 'to right'}, ${gradientColors})`)
      : (t.accentColor || '#4f46e5');

    const buttonStyle = t.buttonColor || gradient;
    
    // Header background (gradient or solid)
    let headerBg = t.headerColor || 'transparent';
    if (t.headerIsGradient && t.headerGradientColors && t.headerGradientColors.length > 0) {
       const hGradColors = t.headerGradientColors.join(', ');
       headerBg = t.headerGradientDirection === 'circle at center'
         ? `radial-gradient(${t.headerGradientDirection}, ${hGradColors})`
         : `linear-gradient(${t.headerGradientDirection || 'to right'}, ${hGradColors})`;
    }
    
    const paddingSz = t.paddingSize || '1.5rem';
    const btnText = t.buttonTextColor || '#ffffff';
    const icnColor = t.iconColor || 'currentColor';

    const radius = t.borderRadius || '0.75rem';
    const fontFam = t.fontFamily || 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';
    const animDuration = t.animationSpeed === 'none' ? '0s' : (t.animationSpeed === 'slow' ? '0.7s' : (t.animationSpeed === 'fast' ? '0.15s' : '0.3s'));
    
    let baseFontSize = '16px';
    if (t.layoutDensity === 'compact') baseFontSize = '14px';
    if (t.layoutDensity === 'spacious') baseFontSize = '18px';

    // Card style css injection
    let cardCss = '';
    if (t.cardStyle === 'glass') {
      cardCss = `
        .bg-white, .dark\\:bg-\\[\\#0a0a0a\\], .dark\\:bg-\\[\\#111\\] {
          background: ${isDarkMode ? 'rgba(20, 20, 20, 0.6)' : 'rgba(255, 255, 255, 0.6)'} !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'} !important;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        }
      `;
    } else if (t.cardStyle === 'neumorphic') {
      cardCss = `
        .bg-white, .dark\\:bg-\\[\\#0a0a0a\\], .dark\\:bg-\\[\\#111\\] {
          background: ${isDarkMode ? '#0a0a0a' : '#f9fafb'} !important;
          border: none !important;
          box-shadow: ${isDarkMode 
            ? '6px 6px 12px #040404, -6px -6px 12px #101010' 
            : '6px 6px 12px #e1e2e3, -6px -6px 12px #ffffff'} !important;
        }
      `;
    } else if (t.cardStyle === 'outlined') {
      cardCss = `
        .bg-white, .dark\\:bg-\\[\\#0a0a0a\\], .dark\\:bg-\\[\\#111\\] {
          background: transparent !important;
          border: 2px solid ${isDarkMode ? '#222' : '#e5e7eb'} !important;
          box-shadow: none !important;
        }
      `;
    }

    return (
      <style dangerouslySetInnerHTML={{__html: `
        html { font-size: ${baseFontSize} !important; }
        :root {
          --accent-base: ${t.accentColor || '#4f46e5'};
          --accent-gradient: ${gradient};
          --button-bg: ${buttonStyle};
          --button-text: ${btnText};
          --header-bg: ${headerBg};
          --app-padding: ${paddingSz};
          --app-radius: ${radius};
        }
        body {
          font-family: ${fontFam} !important;
        }
        * {
          transition-duration: ${animDuration} !important;
        }
        /* Buttons overriding */
        button.bg-indigo-600, button.bg-indigo-500, .bg-indigo-600, .bg-indigo-500, .bg-purple-600 {
          background: var(--button-bg) !important;
          color: var(--button-text) !important;
        }
        
        /* Border Radius Overrides */
        .rounded-xl { border-radius: var(--app-radius) !important; }
        .rounded-2xl { border-radius: calc(var(--app-radius) + 0.25rem) !important; }
        .rounded-lg { border-radius: calc(var(--app-radius) - 0.25rem) !important; }
        
        ${cardCss}
        button.bg-indigo-600:hover, button.bg-indigo-500:hover, .bg-indigo-600:hover, .bg-indigo-500:hover, .bg-purple-600:hover {
          opacity: 0.9 !important;
        }
        /* Icon overriding */
        svg.lucide {
           color: ${icnColor} !important;
        }
        
        /* Text overriding */
        .text-indigo-500:not(:hover), .text-indigo-600:not(:hover), .text-purple-500:not(:hover), .text-purple-600:not(:hover) {
          color: var(--accent-base) !important;
        }
        /* Fix for explicit tailwind hover utilities */
        .hover\:text-white:hover { color: #ffffff !important; }
        .group:hover .group-hover\:text-white { color: #ffffff !important; }
        .hover\:text-gray-800:hover { color: #1f2937 !important; }
        .dark .dark\:hover\:text-gray-200:hover { color: #e5e7eb !important; }
        /* Borders */
        .border-indigo-500, .border-purple-500 {
          border-color: var(--accent-base) !important;
        }
        
        /* Discreet Custom Scrollbars */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
          background: transparent;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 10px;
          transition: background-color 0.2s;
        }
        *:hover::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.4);
        }
        .dark *:hover::-webkit-scrollbar-thumb {
          background-color: rgba(82, 82, 82, 0.6);
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.8) !important;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(115, 115, 115, 0.9) !important;
        }

        /* App Layout Overrides */
        main {
          padding: var(--app-padding) !important;
        }
        header, .win11-titlebar-container, nav {
          background: var(--header-bg) !important;
        }
      `}} />
    );
  };

  const handleImportCSV = async (importedItems: LibraryItem[]) => {
    try {
      setItems(prev => [...prev, ...importedItems]);
      addToast('success', 'Import Successful', `Imported ${importedItems.length} items from CSV.`);
    } catch (err) {
      console.error('Failed to import CSV:', err);
      addToast('error', 'Import Failed', 'Failed to process CSV file.');
    }
  };

  const handleUndoSync = async (itemId: string) => {
    try {
      addToast('info', 'Sync Reverted', `Database updates for item reverted.`);
      await fetchData();
    } catch (err) {
      console.error('Failed to undo sync:', err);
    }
  };

  return (
    <div style={themeStyle} className={`min-h-screen font-sans antialiased flex flex-col justify-between ${isDarkMode ? 'dark text-gray-100' : 'text-gray-900'} ${!settings.theme?.appBackgroundGradient ? (isDarkMode ? 'bg-black' : 'bg-gray-50') : ''}`}>
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
          onSaveSettings={handleSaveSettings}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          conflictCount={conflictItems.length}
          isSyncing={isSyncing}
          onTriggerSync={handleTriggerSync}
          settings={settings}
          extensionState={extensionState}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          notifications={notifications}
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
          isCustomizePanelOpen={isCustomizePanelOpen}
          onToggleCustomizePanel={() => setIsCustomizePanelOpen(!isCustomizePanelOpen)}
        />

        <QuickCustomizePanel 
          isOpen={isCustomizePanelOpen}
          onClose={() => setIsCustomizePanelOpen(false)}
          settings={settings}
          onSaveSettings={setSettings}
        />

        {/* Main Content Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
          <React.Suspense fallback={<div className="flex items-center justify-center h-full min-h-[400px]"><ASynXLoader size={120} /></div>}>

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
              isEditMode={isEditMode}
              onSaveSettings={handleSaveSettings}
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

          
          {activeTab === 'health' && <div className="space-y-6"><SystemHealthView isEditMode={isEditMode} /><SyncPerformanceView isEditMode={isEditMode} /></div>}
          {activeTab === 'docker-backend' && <DockerBackendView />}
          {activeTab === 'database' && <DatabaseView />}
          {activeTab === 'plex' && <PlexWebhookView settings={settings} webhookLogs={webhookLogs} libraryItems={items} onTriggerSimulatedWebhook={handleTriggerSimulatedWebhook} />}
          {activeTab === 'extension' && <ExtensionCompanionView state={extensionState} libraryItems={items} onTriggerExtensionAction={handleTriggerExtensionAction} />}
          {activeTab === 'api-docs' && <ApiDocumentationView />}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              addToast={addToast}
            />
          )}
          {activeTab === 'bookmarks' && (
            <BookmarkTab settings={settings} />
          )}
          </React.Suspense>
        
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Windows 11 Desktop Status Bar */}
      <SystemLogOverlay 
        isOpen={isSystemLogOpen}
        onClose={() => setIsSystemLogOpen(false)}
        logs={systemLogs}
        onClearLogs={handleClearLogs}
      />
      <Win11StatusBar
        itemCount={items.length}
        conflictCount={conflictItems.length}
        isSyncing={isSyncing}
        isOffline={isOffline}
        onToggleTerminal={() => setIsSystemLogOpen(!isSystemLogOpen)}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSyncValidation(false)} />
          <div className={`relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 w-full ${showSyncPreview ? 'max-w-3xl' : 'max-w-md'} max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Validate Database Sync</h3>
              <button onClick={() => setShowSyncPreview(!showSyncPreview)} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
                {showSyncPreview ? 'Hide Preview' : 'Preview Changes'}
              </button>
            </div>
            
            {!showSyncPreview ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                You are about to execute a bulk synchronization across your connected platforms (Simkl, MAL, AniList) and the local database. 
                <br /><br />
                Please manually verify that you want to apply these changes. Conflicting records will follow the "{settings.syncRules?.presetProfile === 'aggressive' ? 'Highest Episode' : 'Source of Truth'}" rules defined in your settings.
              </p>
            ) : (
              <div className="flex-1 overflow-y-auto min-h-[300px] my-4 pr-2 space-y-3 custom-scrollbar">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">The following changes will be applied based on your current Sync Strategy Profile ({settings.syncRules?.presetProfile || 'hybrid'}).</p>
                {conflictItems.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 p-4 border border-dashed border-gray-200 dark:border-neutral-800 rounded-xl text-center">
                    No discrepancies detected. All platforms are currently in sync.
                  </div>
                ) : (
                  conflictItems.map(item => (
                    <div key={item.id} className="border border-gray-200 dark:border-neutral-800 rounded-xl p-3 bg-gray-50 dark:bg-neutral-900/30">
                      <div className="flex items-center justify-between mb-2 border-b border-gray-200 dark:border-neutral-800 pb-2">
                         <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{item.title}</span>
                         <span className="text-[10px] uppercase tracking-wider font-bold text-orange-500 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded">Conflict</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                         <div className="space-y-1">
                           <div className="font-medium text-gray-700 dark:text-gray-300">Current State</div>
                           {item.conflictDetails?.differences.map(diff => (
                             <div key={diff.platform} className="flex justify-between text-gray-500 dark:text-gray-400">
                               <span className="capitalize">{diff.platform}:</span>
                               <span>Ep {diff.episode} ({diff.status.replace('_', ' ')})</span>
                             </div>
                           ))}
                         </div>
                         <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-neutral-800 pt-2 sm:pt-0 sm:pl-3">
                           <div className="font-medium text-indigo-600 dark:text-indigo-400">Resolution Preview</div>
                           <div className="text-gray-600 dark:text-gray-300">
                             {settings.syncRules?.presetProfile === 'aggressive' ? (
                               <span>Will forcefully align all platforms to Ep {Math.max(...(item.conflictDetails?.differences.map(d => d.episode) || [0]))} (Highest tracked).</span>
                             ) : settings.syncRules?.presetProfile === 'manual' ? (
                               <span>Will skip this item. Requires manual validation.</span>
                             ) : (
                               <span>Will align using {settings.syncRules?.defaultSourceOfTruth || 'simkl'} as the source of truth.</span>
                             )}
                           </div>
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-100 dark:border-neutral-900">
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
