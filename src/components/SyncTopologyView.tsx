import React, { useState, useRef, useMemo, useEffect } from 'react';
import * as d3 from 'd3';
import { 
  Network, 
  Play, 
  Pause, 
  RefreshCw, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Shield, 
  Server, 
  Tv, 
  Compass, 
  Layers, 
  Activity, 
  Info, 
  ExternalLink, 
  Filter, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Zap,
  Globe,
  Radio,
  X
} from 'lucide-react';
import { AppSettings, LibraryItem, SyncLog, WebhookLog, BrowserExtensionState, PlatformType } from '../types';
import { apiFetch as fetch } from '../apiFetch';
import { io } from 'socket.io-client';

export interface TopologyNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  subtitle: string;
  category: 'source' | 'hub' | 'target' | 'relay';
  color: string;
  badgeColor: string;
  connected: boolean;
  endpoint: string;
  statusLabel: string;
  scopes?: string[];
  metrics: {
    itemsSynced: number;
    pendingCount: number;
    lastSyncTime?: string;
    latencyMs: number;
    errorCount: number;
  };
}

export interface TopologyLink extends d3.SimulationLinkDatum<TopologyNode> {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  protocol: string;
  status: 'active' | 'pending' | 'idle' | 'disconnected' | 'error';
  direction: 'unidirectional' | 'bidirectional';
  lastActivity?: string;
  flowCount: number;
  pendingItems: number;
}

interface SyncTopologyViewProps {
  settings: AppSettings;
  items: LibraryItem[];
  logs: SyncLog[];
  webhookLogs: WebhookLog[];
  extensionState?: BrowserExtensionState;
  isSyncing: boolean;
  onTriggerSync: () => void;
  onNavigateSettings?: () => void;
  addToast?: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const SyncTopologyView: React.FC<SyncTopologyViewProps> = ({
  settings,
  items,
  logs,
  webhookLogs,
  extensionState,
  isSyncing,
  onTriggerSync,
  onNavigateSettings,
  addToast
}) => {
  // 1. ALL React Hooks declared at the absolute top (Zero Tolerance for Temporal Dead Zones)
  const [layoutMode, setLayoutMode] = useState<'pipeline' | 'radial' | 'force'>('pipeline');
  const [filterState, setFilterState] = useState<'all' | 'active' | 'pending' | 'connected'>('all');
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<TopologyLink | null>(null);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const [activePathsSet, setActivePathsSet] = useState<Set<string>>(new Set());
  const [isBurstActive, setIsBurstActive] = useState(false);
  const [isSyncingPath, setIsSyncingPath] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 1000, height: 600 });
  const [recentEvents, setRecentEvents] = useState<Array<{ id: string; time: string; text: string; type: 'sync' | 'webhook' | 'conflict' | 'info' }>>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Array<{ linkId: string; progress: number; speed: number; color: string }>>([]);

  // Compute metrics and build node topology definition
  const rawNodes: TopologyNode[] = useMemo(() => {
    // Media Source Nodes
    const plexConnected = !!settings.plex?.connected;
    const jellyfinConnected = !!settings.jellyfin?.connected;
    const embyConnected = !!settings.emby?.connected;
    const tautulliConnected = !!settings.tautulli?.connected;
    const extensionInstalled = !!extensionState?.installed;

    // Target Tracker Nodes
    const simklConnected = !!settings.simkl?.connected;
    const malConnected = !!settings.mal?.connected;
    const anilistConnected = !!settings.anilist?.connected;
    const karakeepConnected = !!settings.karakeep?.connected;
    const remoteSyncConnected = !!settings.remoteSync?.enabled;

    // Conflicts count
    const totalConflicts = items.filter(i => i.hasConflict).length;
    const syncedCount = items.filter(i => !i.hasConflict).length;

    // Count synced per platform
    const simklSynced = items.filter(i => i.platforms.simkl?.synced).length;
    const malSynced = items.filter(i => i.platforms.mal?.synced).length;
    const anilistSynced = items.filter(i => i.platforms.anilist?.synced).length;
    const karakeepSynced = items.filter(i => i.platforms.karakeep?.synced).length;

    // Recent webhook timestamps
    const lastPlexWebhook = webhookLogs.find(w => w.source === 'plex')?.timestamp;
    const lastJellyfinWebhook = webhookLogs.find(w => w.source === 'jellyfin')?.timestamp;
    const lastEmbyWebhook = webhookLogs.find(w => w.source === 'emby')?.timestamp;
    const lastTautulliWebhook = webhookLogs.find(w => w.source === 'tautulli')?.timestamp;

    return [
      // Ingestion Sources
      {
        id: 'plex',
        name: 'Plex Media Server',
        subtitle: settings.plex?.serverName || 'Port 32400',
        category: 'source',
        color: '#e5a00d',
        badgeColor: '#f59e0b',
        connected: plexConnected,
        endpoint: settings.plex?.serverUrl || 'http://localhost:32400',
        statusLabel: plexConnected ? 'Webhook Active' : 'Disconnected',
        metrics: {
          itemsSynced: webhookLogs.filter(w => w.source === 'plex').length,
          pendingCount: 0,
          lastSyncTime: lastPlexWebhook,
          latencyMs: 42,
          errorCount: 0
        }
      },
      {
        id: 'jellyfin',
        name: 'Jellyfin Server',
        subtitle: settings.jellyfin?.serverName || 'Port 8096',
        category: 'source',
        color: '#aa5cc3',
        badgeColor: '#a855f7',
        connected: jellyfinConnected,
        endpoint: settings.jellyfin?.serverUrl || 'http://localhost:8096',
        statusLabel: jellyfinConnected ? 'Webhook Active' : 'Disconnected',
        metrics: {
          itemsSynced: webhookLogs.filter(w => w.source === 'jellyfin').length,
          pendingCount: 0,
          lastSyncTime: lastJellyfinWebhook,
          latencyMs: 38,
          errorCount: 0
        }
      },
      {
        id: 'emby',
        name: 'Emby Server',
        subtitle: settings.emby?.serverName || 'Port 8096',
        category: 'source',
        color: '#52b54b',
        badgeColor: '#22c55e',
        connected: embyConnected,
        endpoint: settings.emby?.serverUrl || 'http://localhost:8096',
        statusLabel: embyConnected ? 'Webhook Active' : 'Disconnected',
        metrics: {
          itemsSynced: webhookLogs.filter(w => w.source === 'emby').length,
          pendingCount: 0,
          lastSyncTime: lastEmbyWebhook,
          latencyMs: 45,
          errorCount: 0
        }
      },
      {
        id: 'tautulli',
        name: 'Tautulli Scrobbler',
        subtitle: 'Activity Monitor',
        category: 'source',
        color: '#ea580c',
        badgeColor: '#f97316',
        connected: tautulliConnected,
        endpoint: settings.tautulli?.serverUrl || 'http://localhost:8181',
        statusLabel: tautulliConnected ? 'Active' : 'Unlinked',
        metrics: {
          itemsSynced: webhookLogs.filter(w => w.source === 'tautulli').length,
          pendingCount: 0,
          lastSyncTime: lastTautulliWebhook,
          latencyMs: 35,
          errorCount: 0
        }
      },
      {
        id: 'extension',
        name: 'Browser Extension',
        subtitle: extensionState?.activeSite || 'Desktop Scrobbler',
        category: 'source',
        color: '#0891b2',
        badgeColor: '#06b6d4',
        connected: extensionInstalled,
        endpoint: 'Native Messaging / WebSocket',
        statusLabel: extensionInstalled ? 'Linked' : 'Not Detected',
        metrics: {
          itemsSynced: webhookLogs.filter(w => w.source === 'karakeep').length,
          pendingCount: 0,
          lastSyncTime: logs.find(l => l.source.includes('extension'))?.timestamp,
          latencyMs: 15,
          errorCount: 0
        }
      },

      // Central Hub
      {
        id: 'asynx',
        name: 'ASynX Core Hub',
        subtitle: 'SQLite & Conflict Engine',
        category: 'hub',
        color: '#6366f1',
        badgeColor: '#4f46e5',
        connected: true,
        endpoint: 'sqlite://asynx_db.sqlite',
        statusLabel: totalConflicts > 0 ? `${totalConflicts} Pending Desyncs` : 'Synchronized',
        metrics: {
          itemsSynced: syncedCount,
          pendingCount: totalConflicts,
          lastSyncTime: logs[0]?.timestamp,
          latencyMs: 8,
          errorCount: logs.filter(l => l.status === 'failed').length
        }
      },

      // Target Trackers
      {
        id: 'simkl',
        name: 'Simkl Tracker',
        subtitle: settings.simkl?.username || 'OAuth 2.0 API',
        category: 'target',
        color: '#2563eb',
        badgeColor: '#3b82f6',
        connected: simklConnected,
        endpoint: 'https://api.simkl.com',
        statusLabel: simklConnected ? 'Connected' : 'Offline',
        scopes: settings.simkl?.scopes || ['history', 'watchlist'],
        metrics: {
          itemsSynced: simklSynced,
          pendingCount: items.filter(i => i.hasConflict && i.conflictDetails?.differences.some(d => d.platform === 'simkl')).length,
          lastSyncTime: logs.find(l => l.platformsAffected?.includes('simkl'))?.timestamp,
          latencyMs: 110,
          errorCount: 0
        }
      },
      {
        id: 'mal',
        name: 'MyAnimeList',
        subtitle: settings.mal?.username || 'OAuth PKCE API',
        category: 'target',
        color: '#1d4ed8',
        badgeColor: '#2e51a2',
        connected: malConnected,
        endpoint: 'https://api.myanimelist.net/v2',
        statusLabel: malConnected ? 'Connected' : 'Offline',
        scopes: settings.mal?.scopes || ['read:users', 'write:users'],
        metrics: {
          itemsSynced: malSynced,
          pendingCount: items.filter(i => i.hasConflict && i.conflictDetails?.differences.some(d => d.platform === 'mal')).length,
          lastSyncTime: logs.find(l => l.platformsAffected?.includes('mal'))?.timestamp,
          latencyMs: 165,
          errorCount: 0
        }
      },
      {
        id: 'anilist',
        name: 'AniList',
        subtitle: settings.anilist?.username || 'GraphQL API',
        category: 'target',
        color: '#0284c7',
        badgeColor: '#0ea5e9',
        connected: anilistConnected,
        endpoint: 'https://graphql.anilist.co',
        statusLabel: anilistConnected ? 'Connected' : 'Offline',
        scopes: settings.anilist?.scopes || ['media:read', 'media:write'],
        metrics: {
          itemsSynced: anilistSynced,
          pendingCount: items.filter(i => i.hasConflict && i.conflictDetails?.differences.some(d => d.platform === 'anilist')).length,
          lastSyncTime: logs.find(l => l.platformsAffected?.includes('anilist'))?.timestamp,
          latencyMs: 95,
          errorCount: 0
        }
      },
      {
        id: 'karakeep',
        name: 'KaraKeep',
        subtitle: settings.karakeep?.username || 'Self-Hosted',
        category: 'target',
        color: '#db2777',
        badgeColor: '#ec4899',
        connected: karakeepConnected,
        endpoint: settings.karakeep?.apiUrl || 'http://localhost:7878',
        statusLabel: karakeepConnected ? 'Active' : 'Not Configured',
        metrics: {
          itemsSynced: karakeepSynced,
          pendingCount: 0,
          lastSyncTime: logs.find(l => l.platformsAffected?.includes('karakeep'))?.timestamp,
          latencyMs: 60,
          errorCount: 0
        }
      },

      // Relay / Remote
      {
        id: 'remote_sync',
        name: 'Remote Sync Relay',
        subtitle: settings.remoteSync?.serverUrl ? 'TLS Cloud Relay' : 'Disabled',
        category: 'relay',
        color: '#059669',
        badgeColor: '#10b981',
        connected: remoteSyncConnected,
        endpoint: settings.remoteSync?.serverUrl || 'https://sync.asynx.cloud',
        statusLabel: remoteSyncConnected ? 'Standby Relay' : 'Disabled',
        metrics: {
          itemsSynced: remoteSyncConnected ? syncedCount : 0,
          pendingCount: 0,
          lastSyncTime: settings.remoteSync?.lastSync,
          latencyMs: 140,
          errorCount: 0
        }
      }
    ];
  }, [settings, items, logs, webhookLogs, extensionState]);

  // Compute links and determine active/pending/idle state
  const rawLinks: TopologyLink[] = useMemo(() => {
    const nodeMap = new Map(rawNodes.map(n => [n.id, n]));

    const linkDefs: Array<{
      id: string;
      sourceId: string;
      targetId: string;
      label: string;
      protocol: string;
      direction?: 'unidirectional' | 'bidirectional';
    }> = [
      // Ingestion links (Sources -> Hub)
      { id: 'plex-asynx', sourceId: 'plex', targetId: 'asynx', label: 'Media Scrobble', protocol: 'Webhook (HMAC SHA-256)' },
      { id: 'jellyfin-asynx', sourceId: 'jellyfin', targetId: 'asynx', label: 'Playback Events', protocol: 'Webhook (REST JSON)' },
      { id: 'emby-asynx', sourceId: 'emby', targetId: 'asynx', label: 'Session Updates', protocol: 'Webhook (REST JSON)' },
      { id: 'tautulli-asynx', sourceId: 'tautulli', targetId: 'asynx', label: 'Activity Logs', protocol: 'HTTP POST Hook' },
      { id: 'extension-asynx', sourceId: 'extension', targetId: 'asynx', label: 'DOM Scrobble', protocol: 'WebSocket Bridge' },

      // Outbound sync links (Hub -> Target Trackers)
      { id: 'asynx-simkl', sourceId: 'asynx', targetId: 'simkl', label: 'Cross-Sync (Anime/Drama)', protocol: 'REST OAuth 2.0' },
      { id: 'asynx-mal', sourceId: 'asynx', targetId: 'mal', label: 'Anime List Sync', protocol: 'REST OAuth 2.0 PKCE' },
      { id: 'asynx-anilist', sourceId: 'asynx', targetId: 'anilist', label: 'GraphQL Mutator', protocol: 'GraphQL Bearer Auth' },
      { id: 'asynx-karakeep', sourceId: 'asynx', targetId: 'karakeep', label: 'Local Scrobble', protocol: 'API Token Key' },
      { id: 'asynx-remote_sync', sourceId: 'asynx', targetId: 'remote_sync', label: 'Backup Mirror', protocol: 'TLS Encrypted Sync' },

      // Cross-tracker links (Based on sync rules)
      { id: 'simkl-mal', sourceId: 'simkl', targetId: 'mal', label: 'Drama / Anime Bridge', protocol: 'Direct ID Mapping', direction: 'bidirectional' }
    ];

    // Append any scheduled rules configured by user
    if (settings.syncRules?.scheduledRules) {
      settings.syncRules.scheduledRules.forEach(rule => {
        if (rule.enabled && nodeMap.has(rule.source) && nodeMap.has(rule.target)) {
          const ruleLinkId = `${rule.source}-${rule.target}`;
          if (!linkDefs.some(l => l.id === ruleLinkId)) {
            linkDefs.push({
              id: ruleLinkId,
              sourceId: rule.source,
              targetId: rule.target,
              label: `Schedule (${rule.time || 'interval'})`,
              protocol: 'Rule Automation'
            });
          }
        }
      });
    }

    return linkDefs.map(def => {
      const srcNode = nodeMap.get(def.sourceId);
      const tgtNode = nodeMap.get(def.targetId);

      const isSrcConnected = !!srcNode?.connected;
      const isTgtConnected = !!tgtNode?.connected;

      // Pending conflicts affecting this link
      const pendingItems = (tgtNode?.metrics.pendingCount || 0) + (srcNode?.metrics.pendingCount || 0);

      // Status determination
      let status: 'active' | 'pending' | 'idle' | 'disconnected' | 'error' = 'idle';

      if (!isSrcConnected || !isTgtConnected) {
        status = 'disconnected';
      } else if (activePathsSet.has(def.id) || (isSyncing && isSrcConnected && isTgtConnected)) {
        status = 'active';
      } else if (pendingItems > 0) {
        status = 'pending';
      } else {
        status = 'idle';
      }

      return {
        ...def,
        source: def.sourceId,
        target: def.targetId,
        direction: def.direction || 'unidirectional',
        status,
        flowCount: (tgtNode?.metrics.itemsSynced || 0) + (srcNode?.metrics.itemsSynced || 0),
        pendingItems
      };
    });
  }, [rawNodes, activePathsSet, isSyncing, settings.syncRules?.scheduledRules]);

  // Filter nodes & links based on user filter
  const { filteredNodes, filteredLinks } = useMemo(() => {
    if (filterState === 'all') {
      return { filteredNodes: rawNodes, filteredLinks: rawLinks };
    }
    if (filterState === 'active') {
      const links = rawLinks.filter(l => l.status === 'active');
      const nodeIds = new Set<string>();
      links.forEach(l => { nodeIds.add(l.sourceId); nodeIds.add(l.targetId); });
      return { filteredNodes: rawNodes.filter(n => nodeIds.has(n.id)), filteredLinks: links };
    }
    if (filterState === 'pending') {
      const links = rawLinks.filter(l => l.status === 'pending');
      const nodeIds = new Set<string>();
      links.forEach(l => { nodeIds.add(l.sourceId); nodeIds.add(l.targetId); });
      return { filteredNodes: rawNodes.filter(n => nodeIds.has(n.id) || n.metrics.pendingCount > 0), filteredLinks: links };
    }
    // Connected only
    const nodes = rawNodes.filter(n => n.connected);
    const nodeIds = new Set(nodes.map(n => n.id));
    const links = rawLinks.filter(l => nodeIds.has(l.sourceId) && nodeIds.has(l.targetId));
    return { filteredNodes: nodes, filteredLinks: links };
  }, [rawNodes, rawLinks, filterState]);

  // Summary Metrics
  const metricsSummary = useMemo(() => {
    const totalNodes = rawNodes.length;
    const connectedNodes = rawNodes.filter(n => n.connected).length;
    const activePaths = rawLinks.filter(l => l.status === 'active').length;
    const pendingPaths = rawLinks.filter(l => l.status === 'pending').length;
    const totalPendingItems = rawNodes.reduce((acc, n) => acc + n.metrics.pendingCount, 0);

    return {
      totalNodes,
      connectedNodes,
      activePaths,
      pendingPaths,
      totalPendingItems
    };
  }, [rawNodes, rawLinks]);

  // ResizeObserver on the container element (Standard Architecture Guideline)
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setDimensions({ width: clientWidth, height: clientHeight });
        }
      }
    };

    updateSize();
    const observer = new ResizeObserver(() => {
      // Debounce with requestAnimationFrame
      window.requestAnimationFrame(updateSize);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // WebSocket real-time event listener
  useEffect(() => {
    const socket = io();

    socket.on('state_change', (data: any) => {
      if (!data) return;
      const nowStr = new Date().toLocaleTimeString();

      if (data.type === 'path_sync') {
        const pathId = `${data.source}-${data.target}`;
        setActivePathsSet(prev => {
          const next = new Set(prev);
          next.add(pathId);
          return next;
        });
        setRecentEvents(prev => [
          { id: Math.random().toString(), time: nowStr, text: `Sync flushed along ${data.source} ➔ ${data.target}`, type: 'sync' },
          ...prev.slice(0, 15)
        ]);

        // Auto-fade active path after 4 seconds
        setTimeout(() => {
          setActivePathsSet(prev => {
            const next = new Set(prev);
            next.delete(pathId);
            return next;
          });
        }, 4000);
      } else if (data.type === 'playback_active' || data.type === 'scrobble_committed') {
        // Light up source -> asynx path
        const sourceId = data.sessionKey?.includes('plex') ? 'plex' : 'asynx-simkl';
        setActivePathsSet(prev => new Set(prev).add('plex-asynx'));
        setRecentEvents(prev => [
          { id: Math.random().toString(), time: nowStr, text: `Scrobble event captured from media player (${data.type})`, type: 'webhook' },
          ...prev.slice(0, 15)
        ]);
        setTimeout(() => {
          setActivePathsSet(prev => {
            const next = new Set(prev);
            next.delete('plex-asynx');
            return next;
          });
        }, 4500);
      } else if (data.type === 'sync_complete') {
        setRecentEvents(prev => [
          { id: Math.random().toString(), time: nowStr, text: `Cross-platform sync complete (${data.affected || 0} items)`, type: 'sync' },
          ...prev.slice(0, 15)
        ]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Trigger burst simulation to demonstrate real-time packet flow
  const handleTriggerBurst = () => {
    setIsBurstActive(true);
    const connectedLinkIds = rawLinks.filter(l => l.status !== 'disconnected').map(l => l.id);
    setActivePathsSet(new Set(connectedLinkIds));

    if (addToast) {
      addToast('info', 'Sync Burst Initiated', 'Simulating live cross-platform packet flow through all connected topology paths.');
    }

    setRecentEvents(prev => [
      { id: Math.random().toString(), time: new Date().toLocaleTimeString(), text: 'Sync Burst initiated: High-throughput packet flow active across all channels.', type: 'sync' },
      ...prev.slice(0, 15)
    ]);

    setTimeout(() => {
      setIsBurstActive(false);
      setActivePathsSet(new Set());
    }, 6000);
  };

  // Trigger sync on a specific path
  const handleTriggerSpecificPath = async (link: TopologyLink) => {
    setIsSyncingPath(true);
    try {
      const res = await fetch('/api/sync/topology/trigger-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: link.sourceId, target: link.targetId })
      });
      const data = await res.json();
      if (data.success) {
        setActivePathsSet(prev => new Set(prev).add(link.id));
        if (addToast) {
          addToast('success', 'Path Synchronized', `Data flow along ${link.sourceId} ➔ ${link.targetId} completed successfully.`);
        }
        setTimeout(() => {
          setActivePathsSet(prev => {
            const next = new Set(prev);
            next.delete(link.id);
            return next;
          });
        }, 4000);
      } else {
        if (addToast) {
          addToast('error', 'Path Sync Error', data.error || 'Failed to trigger sync on path.');
        }
      }
    } catch (err: any) {
      if (addToast) {
        addToast('error', 'Network Error', err.message || 'Failed to communicate with sync endpoint.');
      }
    } finally {
      setIsSyncingPath(false);
    }
  };

  // Reset Zoom & Pan
  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(600)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  // =========================================================================
  // D3 Render & Simulation Logic
  // =========================================================================
  useEffect(() => {
    if (!svgRef.current || dimensions.width <= 0 || dimensions.height <= 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawing

    const { width, height } = dimensions;

    // Create main container group for pan/zoom
    const g = svg.append('g').attr('class', 'topology-main-group');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Definitions (Arrowheads, Gradients, Glow filters)
    const defs = svg.append('defs');

    // Drop shadow filter for nodes
    const filter = defs.append('filter')
      .attr('id', 'node-shadow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    filter.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '4')
      .attr('stdDeviation', '6')
      .attr('flood-opacity', '0.18')
      .attr('flood-color', '#000000');

    // Glow filter for active links
    const glowFilter = defs.append('filter')
      .attr('id', 'link-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arrow markers for links
    const markerColors = [
      { id: 'marker-idle', color: '#94a3b8' },
      { id: 'marker-active', color: '#38bdf8' },
      { id: 'marker-pending', color: '#f59e0b' },
      { id: 'marker-disconnected', color: '#64748b' }
    ];

    markerColors.forEach(({ id, color }) => {
      defs.append('marker')
        .attr('id', id)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 18)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-4L9,0L0,4')
        .attr('fill', color);
    });

    // Clone nodes and links for D3 simulation to prevent direct state mutation
    const nodesData: TopologyNode[] = filteredNodes.map(d => ({ ...d }));
    const nodeById = new Map<string, TopologyNode>();
    nodesData.forEach(d => nodeById.set(d.id, d));

    const linksData: Array<TopologyLink & { sourceNode: TopologyNode; targetNode: TopologyNode }> = [];
    filteredLinks.forEach(l => {
      const src = nodeById.get(l.sourceId);
      const tgt = nodeById.get(l.targetId);
      if (src && tgt) {
        linksData.push({
          ...l,
          source: src,
          target: tgt,
          sourceNode: src,
          targetNode: tgt
        });
      }
    });

    // -------------------------------------------------------------
    // Node Position Calculations by Layout Mode
    // -------------------------------------------------------------
    if (layoutMode === 'pipeline') {
      // 4-Column Left-to-Right Horizontal Data Pipeline
      const colX = [
        width * 0.12,  // Col 0: Media Ingestion Sources
        width * 0.42,  // Col 1: Central ASynX Core Hub
        width * 0.72,  // Col 2: Target Trackers (Simkl, MAL, AniList, KaraKeep)
        width * 0.90   // Col 3: Cloud / Relay
      ];

      const sources = nodesData.filter(n => n.category === 'source');
      const hubs = nodesData.filter(n => n.category === 'hub');
      const targets = nodesData.filter(n => n.category === 'target');
      const relays = nodesData.filter(n => n.category === 'relay');

      sources.forEach((n, i) => {
        n.x = colX[0];
        n.y = height * 0.15 + (i * (height * 0.72) / Math.max(sources.length - 1, 1));
      });

      hubs.forEach((n, i) => {
        n.x = colX[1];
        n.y = height * 0.48;
      });

      targets.forEach((n, i) => {
        n.x = colX[2];
        n.y = height * 0.15 + (i * (height * 0.72) / Math.max(targets.length - 1, 1));
      });

      relays.forEach((n, i) => {
        n.x = colX[3];
        n.y = height * 0.48;
      });
    } else if (layoutMode === 'radial') {
      // Orbit Hub & Spoke layout
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.38;

      const sources = nodesData.filter(n => n.category === 'source');
      const hub = nodesData.find(n => n.category === 'hub');
      const targets = nodesData.filter(n => n.category === 'target' || n.category === 'relay');

      if (hub) {
        hub.x = cx;
        hub.y = cy;
      }

      // Sources on left hemisphere (angle: Math.PI * 0.6 to Math.PI * 1.4)
      sources.forEach((n, i) => {
        const angle = Math.PI * 0.65 + (i / Math.max(sources.length - 1, 1)) * (Math.PI * 0.7);
        n.x = cx + Math.cos(angle) * radius;
        n.y = cy + Math.sin(angle) * radius;
      });

      // Targets on right hemisphere (angle: -Math.PI * 0.35 to Math.PI * 0.35)
      targets.forEach((n, i) => {
        const angle = -Math.PI * 0.35 + (i / Math.max(targets.length - 1, 1)) * (Math.PI * 0.7);
        n.x = cx + Math.cos(angle) * radius;
        n.y = cy + Math.sin(angle) * radius;
      });
    }

    // Dynamic Force Simulation (runs continuously for force mode, or stabilizes for interactive dragging)
    const simulation = d3.forceSimulation<TopologyNode>(nodesData)
      .force('link', d3.forceLink<TopologyNode, any>(linksData).id(d => d.id).distance(160))
      .force('charge', d3.forceManyBody().strength(layoutMode === 'force' ? -420 : -100))
      .force('collide', d3.forceCollide().radius(50))
      .force('center', d3.forceCenter(width / 2, height / 2));

    if (layoutMode !== 'force') {
      simulation.stop(); // Use static coordinate math for pipeline & radial modes
    }

    // -------------------------------------------------------------
    // Path Generators
    // -------------------------------------------------------------
    const calculatePath = (d: any) => {
      const sx = d.sourceNode ? d.sourceNode.x : d.source.x;
      const sy = d.sourceNode ? d.sourceNode.y : d.source.y;
      const tx = d.targetNode ? d.targetNode.x : d.target.x;
      const ty = d.targetNode ? d.targetNode.y : d.target.y;

      if (layoutMode === 'pipeline') {
        const dx = (tx - sx) / 2;
        return `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
      } else {
        // Quadratic/Arc curve
        const dx = tx - sx;
        const dy = ty - sy;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.1;
        return `M ${sx} ${sy} A ${dr} ${dr} 0 0 1 ${tx} ${ty}`;
      }
    };

    // -------------------------------------------------------------
    // Render Link Groups
    // -------------------------------------------------------------
    const linkGroup = g.append('g').attr('class', 'links-layer');

    // Underlying wide stroke for hit-testing and hover selection
    const linkHit = linkGroup.selectAll('.link-hit')
      .data(linksData)
      .enter()
      .append('path')
      .attr('class', 'link-hit cursor-pointer')
      .attr('d', calculatePath)
      .attr('fill', 'none')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 24)
      .on('click', (event, d) => {
        setSelectedLink(d);
        setSelectedNode(null);
      });

    // Visual link path
    const linkPaths = linkGroup.selectAll('.link-path')
      .data(linksData)
      .enter()
      .append('path')
      .attr('class', 'link-path cursor-pointer')
      .attr('id', d => `topo-link-${d.id}`)
      .attr('d', calculatePath)
      .attr('fill', 'none')
      .attr('stroke', d => {
        if (d.status === 'active') return '#38bdf8';
        if (d.status === 'pending') return '#f59e0b';
        if (d.status === 'disconnected') return '#475569';
        return '#94a3b8';
      })
      .attr('stroke-width', d => (d.status === 'active' ? 3.5 : d.status === 'pending' ? 2.5 : 1.8))
      .attr('stroke-dasharray', d => (d.status === 'pending' ? '6,4' : d.status === 'disconnected' ? '4,4' : 'none'))
      .attr('stroke-opacity', d => (d.status === 'disconnected' ? 0.35 : 0.85))
      .attr('filter', d => (d.status === 'active' ? 'url(#link-glow)' : 'none'))
      .attr('marker-end', d => {
        if (d.status === 'active') return 'url(#marker-active)';
        if (d.status === 'pending') return 'url(#marker-pending)';
        if (d.status === 'disconnected') return 'url(#marker-disconnected)';
        return 'url(#marker-idle)';
      })
      .on('click', (event, d) => {
        setSelectedLink(d);
        setSelectedNode(null);
      });

    // Animated packet flow particles along active links
    const particleGroup = g.append('g').attr('class', 'particles-layer');

    // Initialize particles for active links
    const activeLinks = linksData.filter(l => l.status === 'active');
    const particlesList: Array<{ linkId: string; progress: number; speed: number; color: string }> = [];

    activeLinks.forEach(link => {
      // 3 particles per active link
      particlesList.push({ linkId: link.id, progress: 0.1, speed: 0.007, color: '#38bdf8' });
      particlesList.push({ linkId: link.id, progress: 0.45, speed: 0.007, color: '#60a5fa' });
      particlesList.push({ linkId: link.id, progress: 0.8, speed: 0.007, color: '#93c5fd' });
    });

    particlesRef.current = particlesList;

    // Create particle circle DOM elements
    const particleElements = particleGroup.selectAll('.flow-particle')
      .data(particlesRef.current)
      .enter()
      .append('circle')
      .attr('class', 'flow-particle pointer-events-none')
      .attr('r', 4.5)
      .attr('fill', d => d.color)
      .attr('filter', 'url(#link-glow)');

    // Particle Animation Loop
    const animateParticles = () => {
      if (!isAnimationPaused) {
        particlesRef.current.forEach((p, idx) => {
          p.progress = (p.progress + p.speed) % 1;
          const pathElem = document.getElementById(`topo-link-${p.linkId}`) as unknown as SVGGeometryElement | null;
          if (pathElem && pathElem.getTotalLength) {
            const totalLen = pathElem.getTotalLength();
            const pt = pathElem.getPointAtLength(p.progress * totalLen);
            d3.select(particleElements.nodes()[idx])
              .attr('cx', pt.x)
              .attr('cy', pt.y)
              .attr('opacity', Math.sin(p.progress * Math.PI)); // Smooth fade in and out
          }
        });
      }
      animFrameRef.current = requestAnimationFrame(animateParticles);
    };

    if (particlesRef.current.length > 0) {
      animFrameRef.current = requestAnimationFrame(animateParticles);
    }

    // -------------------------------------------------------------
    // Render Node Groups
    // -------------------------------------------------------------
    const nodeGroup = g.append('g').attr('class', 'nodes-layer');

    const nodeG = nodeGroup.selectAll('.topology-node')
      .data(nodesData)
      .enter()
      .append('g')
      .attr('class', 'topology-node cursor-pointer select-none')
      .attr('id', d => `topo-node-${d.id}`)
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .call(
        d3.drag<SVGGElement, TopologyNode>()
          .on('start', (event, d) => {
            if (!event.active && layoutMode === 'force') simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
            d.x = event.x;
            d.y = event.y;
            updatePositions();
          })
          .on('end', (event, d) => {
            if (!event.active && layoutMode === 'force') simulation.alphaTarget(0);
            if (layoutMode !== 'force') {
              d.fx = null;
              d.fy = null;
            }
          })
      )
      .on('click', (event, d) => {
        setSelectedNode(d);
        setSelectedLink(null);
      });

    // Pulsing outer aura for active or conflicted nodes
    nodeG.filter(d => d.metrics.pendingCount > 0 || (isSyncing && d.connected))
      .append('rect')
      .attr('x', -68)
      .attr('y', -32)
      .attr('width', 136)
      .attr('height', 64)
      .attr('rx', 18)
      .attr('fill', 'none')
      .attr('stroke', d => (d.metrics.pendingCount > 0 ? '#f59e0b' : '#6366f1'))
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('class', 'animate-pulse');

    // Main Node Card Cardboard Body
    nodeG.append('rect')
      .attr('x', -64)
      .attr('y', -28)
      .attr('width', 128)
      .attr('height', 56)
      .attr('rx', 14)
      .attr('fill', '#ffffff')
      .attr('stroke', d => {
        if (selectedNode?.id === d.id) return '#6366f1';
        if (d.metrics.pendingCount > 0) return '#f59e0b';
        if (d.connected) return d.badgeColor;
        return '#cbd5e1';
      })
      .attr('stroke-width', d => (selectedNode?.id === d.id ? 2.5 : d.connected ? 1.8 : 1))
      .attr('filter', 'url(#node-shadow)')
      .attr('class', 'transition-colors dark:fill-[#121212]');

    // Category Accent Stripe
    nodeG.append('rect')
      .attr('x', -64)
      .attr('y', -28)
      .attr('width', 5)
      .attr('height', 56)
      .attr('rx', 2.5)
      .attr('fill', d => d.badgeColor);

    // Status Indicator Dot
    nodeG.append('circle')
      .attr('cx', 48)
      .attr('cy', -16)
      .attr('r', 4.5)
      .attr('fill', d => {
        if (d.metrics.pendingCount > 0) return '#f59e0b';
        if (d.connected) return '#10b981';
        return '#94a3b8';
      });

    // Node Title
    nodeG.append('text')
      .attr('x', -50)
      .attr('y', -8)
      .attr('fill', '#0f172a')
      .attr('class', 'dark:fill-gray-100 font-bold text-[12px] tracking-tight pointer-events-none')
      .text(d => d.name);

    // Subtitle / Protocol
    nodeG.append('text')
      .attr('x', -50)
      .attr('y', 8)
      .attr('fill', '#64748b')
      .attr('class', 'dark:fill-gray-400 font-medium text-[10px] pointer-events-none')
      .text(d => d.subtitle);

    // Throughput / Items Synced Badge Text
    nodeG.append('text')
      .attr('x', -50)
      .attr('y', 20)
      .attr('fill', d => (d.metrics.pendingCount > 0 ? '#d97706' : '#6366f1'))
      .attr('class', 'font-semibold text-[9px] pointer-events-none')
      .text(d => {
        if (d.metrics.pendingCount > 0) return `⚠️ ${d.metrics.pendingCount} desyncs`;
        if (d.connected) return `✓ ${d.metrics.itemsSynced} records`;
        return 'Offline';
      });

    // Update positions on force ticks or drag
    function updatePositions() {
      linkPaths.attr('d', calculatePath);
      linkHit.attr('d', calculatePath);
      nodeG.attr('transform', d => `translate(${d.x}, ${d.y})`);
    }

    if (layoutMode === 'force') {
      simulation.on('tick', updatePositions);
    }

    return () => {
      simulation.stop();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [filteredNodes, filteredLinks, layoutMode, dimensions, isAnimationPaused, isSyncing, selectedNode]);

  return (
    <div id="sync-topology-container" className="w-full space-y-4">
      {/* Top Header & Analytics HUD Bar */}
      <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Sync Topology & Data Flow</h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40">
                  D3.js Live Engine
                </span>
                {isBurstActive && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 animate-pulse">
                    Burst Stream Active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Real-time directed graph visualizing ingestion sources, core deduplication, and target tracker flow paths.
              </p>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
            <div className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center space-x-2 whitespace-nowrap">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Connected Nodes:</span>
              <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                {metricsSummary.connectedNodes} / {metricsSummary.totalNodes}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center space-x-2 whitespace-nowrap">
              <Activity className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Active Paths:</span>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">{metricsSummary.activePaths}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center space-x-2 whitespace-nowrap">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Pending Desyncs:</span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{metricsSummary.totalPendingItems}</span>
            </div>

            <button
              id="btn-sync-burst"
              onClick={handleTriggerBurst}
              disabled={isBurstActive || isSyncing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBurstActive ? 'Simulating...' : 'Test Packet Burst'}</span>
            </button>
          </div>
        </div>

        {/* Toolbar & Interactive View Filters */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Layout Mode Selector */}
          <div className="flex items-center space-x-1.5 bg-gray-100 dark:bg-neutral-900 p-1 rounded-xl border border-gray-200 dark:border-neutral-800">
            <span className="px-2 text-gray-500 font-medium select-none">Layout:</span>
            <button
              id="btn-layout-pipeline"
              onClick={() => setLayoutMode('pipeline')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${layoutMode === 'pipeline' ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
            >
              Pipeline (L➔R)
            </button>
            <button
              id="btn-layout-radial"
              onClick={() => setLayoutMode('radial')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${layoutMode === 'radial' ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
            >
              Radial Orbit
            </button>
            <button
              id="btn-layout-force"
              onClick={() => setLayoutMode('force')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${layoutMode === 'force' ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
            >
              Physics Force
            </button>
          </div>

          {/* Filter Paths */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-neutral-900 p-1 rounded-xl border border-gray-200 dark:border-neutral-800">
            <Filter className="w-3.5 h-3.5 ml-1.5 text-gray-400" />
            <button
              id="btn-filter-all"
              onClick={() => setFilterState('all')}
              className={`px-2 py-0.5 rounded-lg font-medium transition cursor-pointer ${filterState === 'all' ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 shadow-xs' : 'text-gray-500'}`}
            >
              All
            </button>
            <button
              id="btn-filter-active"
              onClick={() => setFilterState('active')}
              className={`px-2 py-0.5 rounded-lg font-medium transition cursor-pointer ${filterState === 'active' ? 'bg-sky-500 text-white shadow-xs' : 'text-gray-500'}`}
            >
              Active
            </button>
            <button
              id="btn-filter-pending"
              onClick={() => setFilterState('pending')}
              className={`px-2 py-0.5 rounded-lg font-medium transition cursor-pointer ${filterState === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-gray-500'}`}
            >
              Pending
            </button>
            <button
              id="btn-filter-connected"
              onClick={() => setFilterState('connected')}
              className={`px-2 py-0.5 rounded-lg font-medium transition cursor-pointer ${filterState === 'connected' ? 'bg-emerald-500 text-white shadow-xs' : 'text-gray-500'}`}
            >
              Connected
            </button>
          </div>

          {/* Canvas Controls */}
          <div className="flex items-center space-x-1.5">
            <button
              id="btn-toggle-animation"
              onClick={() => setIsAnimationPaused(!isAnimationPaused)}
              className="p-1.5 rounded-xl bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-800 transition cursor-pointer border border-gray-200 dark:border-neutral-800"
              title={isAnimationPaused ? 'Resume particle flow' : 'Pause particle flow'}
            >
              {isAnimationPaused ? <Play className="w-3.5 h-3.5 text-emerald-500" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              id="btn-reset-zoom"
              onClick={handleResetZoom}
              className="p-1.5 rounded-xl bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-800 transition cursor-pointer border border-gray-200 dark:border-neutral-800"
              title="Reset Zoom & Center View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main D3 Visual Stage Container */}
      <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div 
          ref={containerRef}
          className="lg:col-span-3 h-[580px] w-full rounded-2xl bg-gray-50 dark:bg-[#070707] border border-gray-200 dark:border-neutral-800/80 overflow-hidden shadow-inner relative"
        >
          {/* Subtle Grid Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-25 dark:opacity-10 pointer-events-none" />

          {/* D3 Canvas SVG */}
          <svg 
            ref={svgRef} 
            className="w-full h-full cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
          />

          {/* Floating Stage Legend */}
          <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-[#111]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-200/80 dark:border-neutral-800 text-[11px] shadow-sm flex items-center space-x-4 pointer-events-auto">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm" />
              <span className="text-gray-600 dark:text-gray-400 font-medium">Active Flow</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
              <span className="text-gray-600 dark:text-gray-400 font-medium">Pending Desync</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-sm" />
              <span className="text-gray-600 dark:text-gray-400 font-medium">Standby</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 opacity-40 shadow-sm" />
              <span className="text-gray-500 font-medium">Offline</span>
            </div>
          </div>
        </div>

        {/* Right Details / Inspector Sidebar */}
        <div className="h-[580px] flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm overflow-hidden">
          {selectedNode ? (
            <div className="flex flex-col h-full overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedNode.badgeColor }} />
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{selectedNode.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 font-medium">Category:</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 capitalize mt-0.5">{selectedNode.category}</p>
                </div>

                <div>
                  <span className="text-gray-400 font-medium">Endpoint / URI:</span>
                  <p className="font-mono text-[11px] text-gray-700 dark:text-gray-300 break-all bg-gray-50 dark:bg-neutral-900 p-1.5 rounded-lg mt-0.5 border border-gray-200 dark:border-neutral-800">
                    {selectedNode.endpoint}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 font-medium">Connection Status:</span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${selectedNode.connected ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedNode.statusLabel}</span>
                  </div>
                </div>

                {selectedNode.scopes && selectedNode.scopes.length > 0 && (
                  <div>
                    <span className="text-gray-400 font-medium">Granted OAuth Scopes:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedNode.scopes.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded font-mono text-[10px] border border-indigo-200/50 dark:border-indigo-800/40">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 space-y-2">
                  <span className="text-gray-400 font-medium">Performance & State:</span>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800">
                      <p className="text-[10px] text-gray-400">Total Synced</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{selectedNode.metrics.itemsSynced}</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800">
                      <p className="text-[10px] text-gray-400">Avg Latency</p>
                      <p className="text-sm font-bold text-sky-600 dark:text-sky-400">{selectedNode.metrics.latencyMs}ms</p>
                    </div>
                  </div>
                </div>

                {selectedNode.metrics.lastSyncTime && (
                  <div>
                    <span className="text-gray-400 font-medium">Last Synchronized:</span>
                    <p className="text-gray-700 dark:text-gray-300 text-[11px] mt-0.5">
                      {new Date(selectedNode.metrics.lastSyncTime).toLocaleString()}
                    </p>
                  </div>
                )}

                {onNavigateSettings && (
                  <div className="pt-3">
                    <button
                      onClick={onNavigateSettings}
                      className="w-full py-2 px-3 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 font-semibold text-gray-800 dark:text-gray-200 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Configure Credentials</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : selectedLink ? (
            <div className="flex flex-col h-full overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{selectedLink.label}</h3>
                </div>
                <button 
                  onClick={() => setSelectedLink(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 font-medium">Path Endpoints:</span>
                  <div className="flex items-center space-x-1.5 font-semibold text-gray-800 dark:text-gray-200 mt-1">
                    <span className="capitalize">{selectedLink.sourceId}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    <span className="capitalize">{selectedLink.targetId}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 font-medium">Transfer Protocol:</span>
                  <p className="font-mono text-[11px] text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-neutral-900 p-1.5 rounded-lg mt-0.5 border border-gray-200 dark:border-neutral-800">
                    {selectedLink.protocol}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 font-medium">Link Status:</span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${selectedLink.status === 'active' ? 'bg-sky-500 animate-ping' : selectedLink.status === 'pending' ? 'bg-amber-500' : selectedLink.status === 'disconnected' ? 'bg-gray-400' : 'bg-emerald-500'}`} />
                    <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{selectedLink.status}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-neutral-800">
                  <button
                    id="btn-trigger-path-sync"
                    onClick={() => handleTriggerSpecificPath(selectedLink)}
                    disabled={isSyncingPath || selectedLink.status === 'disconnected'}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold transition shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPath ? 'animate-spin' : ''}`} />
                    <span>{isSyncingPath ? 'Syncing Path...' : 'Flush & Sync This Path'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-xs uppercase tracking-wider text-gray-400 mb-2 flex items-center space-x-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-500" />
                <span>Live Event Stream</span>
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {recentEvents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
                    <Network className="w-8 h-8 opacity-20 mb-2" />
                    <p className="text-xs">Click any node or link to inspect routing and trigger direct synchronization.</p>
                  </div>
                ) : (
                  recentEvents.map(ev => (
                    <div key={ev.id} className="p-2 rounded-xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800/80 text-[11px] flex flex-col space-y-0.5">
                      <div className="flex items-center justify-between text-gray-400 text-[10px]">
                        <span className="font-mono">{ev.time}</span>
                        <span className="capitalize text-indigo-500 font-semibold">{ev.type}</span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200">{ev.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
