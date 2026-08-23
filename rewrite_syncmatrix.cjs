const fs = require('fs');

const orig = fs.readFileSync('src/components/SyncMatrixView.tsx.orig', 'utf8');

// The top part of orig, up to line 362
const lines = orig.split('\n');
const topPart = lines.slice(0, 362).join('\n'); // 0 to 361

const bottomPart = lines.slice(1100).join('\n'); // Bulk Sync Modal

const injected = `
  const recentFiveEvents = [...logs].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  const widgetProps = {
    items, logs, settings, onOpenOverride, onOpenConflictView, onTriggerSyncItem, onNavigateSettings, onImportCSV, onUndoAction,
    searchTerm, setSearchTerm, activeFilter, setActiveFilter, analyticsData, chartMetric, setChartMetric,
    viewMode, setViewMode, sortCol, setSortCol, sortDir, setSortDir, selectedIds, setSelectedIds, showBulkModal, setShowBulkModal,
    handleSelectAll, toggleSelection, executeBulkSync, renderPlatformChip, renderStatusBadge,
    syncedCount, conflictCount, recentFiveEvents, handleImport, filteredItems, sortedItems
  };

  const defaultLayout: PanelConfig[] = settings?.dashboardLayout || [
    { i: 'metrics', x: 0, y: 0, w: 12, h: 4, type: 'MetricsRow' },
    { i: 'recent', x: 0, y: 4, w: 12, h: 6, type: 'RecentEvents' },
    { i: 'historical', x: 0, y: 10, w: 12, h: 14, type: 'HistoricalAnalytics' },
    { i: 'library', x: 0, y: 24, w: 8, h: 28, type: 'LibraryList' },
    { i: 'sidelog', x: 8, y: 24, w: 4, h: 28, type: 'SideLog' }
  ];

  const handleLayoutChangeSave = (newLayout: PanelConfig[]) => {
    if (onSaveSettings && settings) {
      onSaveSettings({
        ...settings,
        dashboardLayout: newLayout
      });
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-1 w-full relative">
        <GridLayoutEngine
          tabId="matrix"
          defaultLayout={defaultLayout}
          availableWidgets={availableWidgets}
          widgetProps={widgetProps}
          isEditMode={isEditMode || false}
          onLayoutChangeSave={handleLayoutChangeSave}
        />
      </div>
`;

let output = topPart + injected + bottomPart;

// Make sure to add imports
output = `import { GridLayoutEngine } from './GridLayoutEngine';
import { PanelConfig } from '../types';
import { availableWidgets } from './SyncMatrixWidgets';\n` + output;

// Add isEditMode and onSaveSettings to the interface
output = output.replace(
  `  onUndoAction?: (itemId: string) => void;\n}`,
  `  onUndoAction?: (itemId: string) => void;\n  isEditMode?: boolean;\n  onSaveSettings?: (settings: AppSettings) => void;\n}`
);
output = output.replace(
  `  onUndoAction\n})`,
  `  onUndoAction,\n  isEditMode,\n  onSaveSettings\n})`
);

fs.writeFileSync('src/components/SyncMatrixView.tsx', output);
console.log("Rewrote SyncMatrixView.tsx");
