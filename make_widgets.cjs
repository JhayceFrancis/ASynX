const fs = require('fs');

const metrics = fs.readFileSync('section_metrics.tsx', 'utf8');
const recent = fs.readFileSync('section_recent.tsx', 'utf8');
const historical = fs.readFileSync('section_historical.tsx', 'utf8');
const library = fs.readFileSync('section_library.tsx', 'utf8');
const sidelog = fs.readFileSync('section_sidelog.tsx', 'utf8');

const output = `import React from 'react';
import { 
  Search, Filter, AlertTriangle, CheckCircle2, Clock, Tv, Sliders, 
  Sparkles, ExternalLink, ArrowRight, ShieldCheck, RefreshCw, Film, 
  Activity, BarChart2, TrendingUp, Layers, Zap, LayoutGrid, List, 
  Upload, ArrowUpDown 
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, Bar 
} from 'recharts';
import { Tooltip as UITooltip } from './Tooltip';
import { motion, AnimatePresence } from 'motion/react';
import { MalLogo, AniListLogo, SimklLogo, PlexLogo } from './PlatformLogos';

export const availableWidgets = [
  {
    type: 'MetricsRow',
    name: 'Key Metrics',
    component: (props: any) => {
      const { items, syncedCount, conflictCount, onOpenConflictView } = props;
      return (
        <div className="h-full flex flex-col">
          ${metrics.replace(/`([^`]+)`/g, (m, g1) => '`' + g1 + '`')}
        </div>
      );
    }
  },
  {
    type: 'RecentEvents',
    name: 'Recent Sync Events',
    component: (props: any) => {
      const { recentFiveEvents, renderPlatformChip } = props;
      return (
        <div className="h-full flex flex-col">
          ${recent}
        </div>
      );
    }
  },
  {
    type: 'HistoricalAnalytics',
    name: 'Analytics Chart',
    component: (props: any) => {
      const { analyticsData, chartMetric, setChartMetric } = props;
      return (
        <div className="h-full flex flex-col">
          ${historical}
        </div>
      );
    }
  },
  {
    type: 'LibraryList',
    name: 'Library Matrix',
    component: (props: any) => {
      const { 
        searchTerm, setSearchTerm, activeFilter, setActiveFilter,
        viewMode, setViewMode, sortCol, setSortCol, sortDir, setSortDir,
        selectedIds, setSelectedIds, handleSelectAll, toggleSelection,
        executeBulkSync, renderPlatformChip, renderStatusBadge,
        syncedCount, conflictCount, items, logs, onOpenConflictView,
        onTriggerSyncItem, onOpenOverride, onNavigateSettings, onImportCSV,
        filteredItems, sortedItems, handleImport, setShowBulkModal
      } = props;
      return (
        <div className="h-full flex flex-col relative">
          ${library}
        </div>
      );
    }
  },
  {
    type: 'SideLog',
    name: 'Real-Time Logs',
    component: (props: any) => {
      const { logs, renderPlatformChip } = props;
      return (
        <div className="h-full flex flex-col">
          ${sidelog}
        </div>
      );
    }
  }
];
`;

fs.writeFileSync('src/components/SyncMatrixWidgets.tsx', output);
console.log("Updated SyncMatrixWidgets.tsx");
