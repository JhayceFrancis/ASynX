import React, { useState } from 'react';
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { PanelConfig } from '../types';
import { Settings, X, Plus, Palette } from 'lucide-react';

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
  const [activePanelId, setActivePanelId] = useState<string | null>(null);

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

  
  const updatePanelStyle = (id: string, updates: Partial<PanelConfig>) => {
    const newPanels = panels.map(p => p.i === id ? { ...p, ...updates } : p);
    saveLayout(newPanels);
  };
  
  const applySizePreset = (id: string, preset: 'portrait' | 'landscape' | 'square') => {
    const newPanels = panels.map(p => {
      if (p.i === id) {
        if (preset === 'portrait') return { ...p, w: 4, h: 12 };
        if (preset === 'landscape') return { ...p, w: 12, h: 6 };
        if (preset === 'square') return { ...p, w: 6, h: 8 };
      }
      return p;
    });
    saveLayout(newPanels);
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
              className={`relative flex flex-col ${panel.bgGradient || panel.bgColor || 'bg-white dark:bg-[#0a0a0a]'} border border-gray-200 dark:border-neutral-900 rounded-2xl shadow-sm overflow-hidden group`}
              style={{
                fontFamily: panel.fontFamily || 'inherit',
                fontSize: panel.fontSize === 'sm' ? '0.875rem' : panel.fontSize === 'lg' ? '1.125rem' : '1rem',
                fontStyle: panel.fontStyle === 'italic' ? 'italic' : 'normal',
                fontWeight: panel.fontStyle === 'bold' ? 'bold' : 'normal',
                color: panel.textColor || 'inherit'
              }}
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
                  <button onClick={() => setActivePanelId(activePanelId === panel.i ? null : panel.i)} className="p-1 hover:bg-indigo-500/20 text-indigo-400 rounded" title="Customize Style & Size">
                    <Palette className="w-3.5 h-3.5" />
                  </button>
                  <div className="drag-handle cursor-move p-1 hover:bg-neutral-800 rounded text-gray-300">
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <button onClick={() => removePanel(panel.i)} className="p-1 hover:bg-rose-500/20 text-rose-400 rounded">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              
              
              {activePanelId === panel.i && isEditMode && (
                <div className="absolute inset-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md p-4 overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-sm text-indigo-500 flex items-center gap-2"><Palette className="w-4 h-4"/> Customise Panel</h4>
                    <button onClick={() => setActivePanelId(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded"><X className="w-4 h-4"/></button>
                  </div>
                  
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-gray-500 dark:text-gray-400 font-bold mb-1">Layout Size</label>
                      <div className="flex gap-2">
                        <button onClick={() => applySizePreset(panel.i, 'portrait')} className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded hover:bg-indigo-500/20">Portrait</button>
                        <button onClick={() => applySizePreset(panel.i, 'landscape')} className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded hover:bg-indigo-500/20">Landscape</button>
                        <button onClick={() => applySizePreset(panel.i, 'square')} className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded hover:bg-indigo-500/20">Square</button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-500 dark:text-gray-400 font-bold mb-1">Typography</label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <select onChange={(e) => updatePanelStyle(panel.i, { fontFamily: e.target.value })} value={panel.fontFamily || ''} className="bg-gray-100 dark:bg-neutral-800 border-none rounded p-1">
                          <option value="">Default Font</option>
                          <option value="sans-serif">Sans-Serif</option>
                          <option value="serif">Serif</option>
                          <option value="monospace">Monospace</option>
                        </select>
                        <select onChange={(e) => updatePanelStyle(panel.i, { fontSize: e.target.value })} value={panel.fontSize || ''} className="bg-gray-100 dark:bg-neutral-800 border-none rounded p-1">
                          <option value="">Default Size</option>
                          <option value="sm">Small</option>
                          <option value="base">Normal</option>
                          <option value="lg">Large</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updatePanelStyle(panel.i, { fontStyle: panel.fontStyle === 'bold' ? '' : 'bold' })} className={`px-2 py-1 rounded ${panel.fontStyle === 'bold' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-neutral-800'}`}>Bold</button>
                        <button onClick={() => updatePanelStyle(panel.i, { fontStyle: panel.fontStyle === 'italic' ? '' : 'italic' })} className={`px-2 py-1 rounded ${panel.fontStyle === 'italic' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-neutral-800'}`}>Italic</button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-500 dark:text-gray-400 font-bold mb-1">Background Gradient</label>
                      <div className="grid grid-cols-3 gap-1">
                        <button onClick={() => updatePanelStyle(panel.i, { bgGradient: '', bgColor: '' })} className="h-6 rounded bg-gray-200 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700"></button>
                        <button onClick={() => updatePanelStyle(panel.i, { bgGradient: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20' })} className="h-6 rounded bg-gradient-to-br from-indigo-500/20 to-purple-500/20"></button>
                        <button onClick={() => updatePanelStyle(panel.i, { bgGradient: 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20' })} className="h-6 rounded bg-gradient-to-br from-emerald-500/20 to-cyan-500/20"></button>
                        <button onClick={() => updatePanelStyle(panel.i, { bgGradient: 'bg-gradient-to-br from-rose-500/20 to-orange-500/20' })} className="h-6 rounded bg-gradient-to-br from-rose-500/20 to-orange-500/20"></button>
                        <button onClick={() => updatePanelStyle(panel.i, { bgGradient: 'bg-gradient-to-br from-slate-800 to-black' })} className="h-6 rounded bg-gradient-to-br from-slate-800 to-black"></button>
                        <button onClick={() => updatePanelStyle(panel.i, { bgGradient: 'bg-gradient-to-br from-indigo-900 to-slate-900' })} className="h-6 rounded bg-gradient-to-br from-indigo-900 to-slate-900"></button>
                      </div>
                    </div>
                  </div>
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
