import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { PanelConfig } from '../types';
import { Settings, X, Plus } from 'lucide-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface GridLayoutEngineProps {
  tabId: string;
  defaultLayout: PanelConfig[];
  availableWidgets: { type: string; name: string; component: React.FC<any> }[];
  widgetProps: any; // Context passed to widgets
  isEditMode: boolean;
  onLayoutChangeSave?: (layout: PanelConfig[]) => void;
}

export const GridLayoutEngine: React.FC<GridLayoutEngineProps> = ({
  tabId,
  defaultLayout,
  availableWidgets,
  widgetProps,
  isEditMode,
  onLayoutChangeSave
}) => {
  // Load layout from localStorage or default
  const storageKey = `asynx_layout_${tabId}`;
  const [panels, setPanels] = useState<PanelConfig[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultLayout;
  });

  const [widgetPaletteOpen, setWidgetPaletteOpen] = useState(false);

  const saveLayout = (newPanels: PanelConfig[]) => {
    setPanels(newPanels);
    localStorage.setItem(storageKey, JSON.stringify(newPanels));
    if (onLayoutChangeSave) {
      onLayoutChangeSave(newPanels);
    }
  };

  const handleLayoutChange = (currentLayout: readonly any[], allLayouts: any) => {
    const updatedPanels = panels.map(panel => {
      const updated = currentLayout.find(l => l.i === panel.i);
      if (updated) {
        return { ...panel, x: updated.x, y: updated.y, w: updated.w, h: updated.h };
      }
      return panel;
    });
    saveLayout(updatedPanels);
  };

  const removePanel = (id: string) => {
    const newPanels = panels.filter(p => p.i !== id);
    saveLayout(newPanels);
  };

  const addPanel = (type: string) => {
    const newId = `${type}_${Date.now()}`;
    const newPanel: PanelConfig = {
      i: newId,
      x: 0,
      y: Infinity, // puts it at the bottom
      w: 12,
      h: 4,
      type
    };
    saveLayout([...panels, newPanel]);
    setWidgetPaletteOpen(false);
  };

  const changePanelBg = (id: string, color: string) => {
    const newPanels = panels.map(p => p.i === id ? { ...p, bgColor: color } : p);
    saveLayout(newPanels);
  };

  const bgColors = [
    '', // Default
    'bg-indigo-500/10',
    'bg-emerald-500/10',
    'bg-rose-500/10',
    'bg-amber-500/10',
    'bg-purple-500/10',
    'bg-cyan-500/10',
    'bg-white dark:bg-[#111]', // Solid
  ];

  return (
    <div className="relative">
      {isEditMode && (
        <div className="mb-4 flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
          <div>
            <h3 className="font-bold text-indigo-500 flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Layout Edit Mode Active</span>
            </h3>
            <p className="text-xs text-indigo-400">Drag to reposition, use handles to resize, or click settings to change panel colors.</p>
          </div>
          <button 
            onClick={() => setWidgetPaletteOpen(!widgetPaletteOpen)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Panel</span>
          </button>
        </div>
      )}

      {widgetPaletteOpen && isEditMode && (
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-xl shadow-inner">
          {availableWidgets.map(w => (
            <button 
              key={w.type}
              onClick={() => addPanel(w.type)}
              className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#111] hover:border-indigo-500 rounded-xl transition text-xs font-semibold text-gray-700 dark:text-gray-300"
            >
              <Plus className="w-4 h-4 mb-1 text-indigo-400" />
              <span className="text-center">{w.name}</span>
            </button>
          ))}
        </div>
      )}

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: panels }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        draggableHandle=".drag-handle"
        margin={[16, 16]}
      >
        {panels.map(panel => {
          const WidgetDefinition = availableWidgets.find(w => w.type === panel.type);
          if (!WidgetDefinition) return <div key={panel.i}>Widget Not Found</div>;
          const WidgetComponent = WidgetDefinition.component;

          return (
            <div 
              key={panel.i} 
              data-grid={{ x: panel.x, y: panel.y, w: panel.w, h: panel.h, minW: 2, minH: 2 }}
              className={`relative flex flex-col ${panel.bgColor || 'bg-white dark:bg-[#0a0a0a]'} border border-gray-200 dark:border-neutral-900 rounded-2xl shadow-sm overflow-hidden group`}
            >
              {isEditMode && (
                <div className="absolute top-2 right-2 z-50 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md rounded-lg p-1 border border-neutral-700">
                  <div className="flex space-x-1 mr-2 px-1 border-r border-neutral-600">
                    {bgColors.map(color => (
                      <button 
                        key={color}
                        onClick={() => changePanelBg(panel.i, color)}
                        className={`w-4 h-4 rounded-full border border-gray-400/50 ${color === '' ? 'bg-gray-200 dark:bg-neutral-800' : color}`}
                        title="Change Color"
                      />
                    ))}
                  </div>
                  <div className="drag-handle cursor-move p-1 hover:bg-neutral-800 rounded text-gray-300">
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <button onClick={() => removePanel(panel.i)} className="p-1 hover:bg-rose-500/20 text-rose-400 rounded">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              
              <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar">
                <WidgetComponent {...widgetProps} panelId={panel.i} />
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};
