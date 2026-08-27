import React, { useState } from 'react';
import { PanelConfig } from '../types';
import { Layout, Save, FolderOpen, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardLayoutManagerProps {
  currentLayout: PanelConfig[];
  onLoadLayout: (layout: PanelConfig[]) => void;
  tabId: string;
}

const PRESETS: Record<string, PanelConfig[]> = {
  'Minimalist': [
    { type: 'panel', i: 'metrics', x: 0, y: 0, w: 12, h: 4, customSize: 'landscape' },
    { type: 'panel', i: 'recent', x: 0, y: 1, w: 12, h: 6, customSize: 'landscape' }
  ],
  'Analytics Focus': [
    { type: 'panel', i: 'metrics', x: 0, y: 0, w: 12, h: 4, customSize: 'landscape' },
    { type: 'panel', i: 'historical', x: 0, y: 1, w: 12, h: 8, customSize: 'wide' },
    { type: 'panel', i: 'recent', x: 0, y: 2, w: 12, h: 6, customSize: 'landscape' }
  ],
  'Sync Heavy': [
    { type: 'panel', i: 'library', x: 0, y: 0, w: 8, h: 12, customSize: 'tall' },
    { type: 'panel', i: 'sidelog', x: 8, y: 0, w: 4, h: 12, customSize: 'portrait' },
    { type: 'panel', i: 'metrics', x: 0, y: 1, w: 12, h: 4, customSize: 'landscape' }
  ],
  'Grid Balanced': [
    { type: 'panel', i: 'metrics', x: 0, y: 0, w: 12, h: 4, customSize: 'landscape' },
    { type: 'panel', i: 'recent', x: 0, y: 1, w: 6, h: 6, customSize: 'square' },
    { type: 'panel', i: 'historical', x: 6, y: 1, w: 6, h: 6, customSize: 'square' },
    { type: 'panel', i: 'library', x: 0, y: 2, w: 8, h: 12, customSize: 'tall' },
    { type: 'panel', i: 'sidelog', x: 8, y: 2, w: 4, h: 12, customSize: 'portrait' }
  ]
};

export const DashboardLayoutManager: React.FC<DashboardLayoutManagerProps> = ({
  currentLayout,
  onLoadLayout,
  tabId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [savedLayouts, setSavedLayouts] = useState<Record<string, PanelConfig[]>>(() => {
    const saved = localStorage.getItem(`asynx_custom_layouts_${tabId}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [newLayoutName, setNewLayoutName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCurrent = () => {
    if (!newLayoutName.trim()) return;
    const updated = { ...savedLayouts, [newLayoutName]: currentLayout };
    setSavedLayouts(updated);
    localStorage.setItem(`asynx_custom_layouts_${tabId}`, JSON.stringify(updated));
    setNewLayoutName('');
    setIsSaving(false);
  };

  const deleteLayout = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...savedLayouts };
    delete updated[name];
    setSavedLayouts(updated);
    localStorage.setItem(`asynx_custom_layouts_${tabId}`, JSON.stringify(updated));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 hover:border-indigo-500 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 transition shadow-sm"
      >
        <Layout className="w-4 h-4 text-indigo-500" />
        <span>Layout Presets</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 w-80 bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 shadow-2xl rounded-2xl z-[100] p-4 flex flex-col max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                <FolderOpen className="w-4 h-4 text-indigo-500" />
                <span>Layout Manager</span>
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Predefined Presets */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Predefined Presets</h4>
                <div className="space-y-1.5">
                  {Object.entries(PRESETS).map(([name, layout]) => (
                    <button
                      key={name}
                      onClick={() => { onLoadLayout(layout); setIsOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 dark:bg-neutral-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/30 text-xs font-medium text-gray-700 dark:text-gray-300 transition"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Saved Layouts */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Your Saved Layouts</h4>
                {Object.keys(savedLayouts).length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-500 italic px-2">No custom layouts saved.</p>
                ) : (
                  <div className="space-y-1.5">
                    {Object.entries(savedLayouts).map(([name, layout]) => (
                      <div key={name} className="flex items-center group relative">
                        <button
                          onClick={() => { onLoadLayout(layout); setIsOpen(false); }}
                          className="flex-1 text-left px-3 py-2 rounded-lg bg-gray-50 dark:bg-neutral-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 text-xs font-medium text-gray-700 dark:text-gray-300 transition pr-8"
                        >
                          {name}
                        </button>
                        <button 
                          onClick={(e) => deleteLayout(name, e)}
                          className="absolute right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-400 rounded text-gray-400 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Current Layout */}
              <div className="pt-3 border-t border-gray-200 dark:border-neutral-800">
                {isSaving ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Name this layout..."
                      value={newLayoutName}
                      onChange={(e) => setNewLayoutName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveCurrent()}
                      className="flex-1 bg-gray-100 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
                    />
                    <button 
                      onClick={handleSaveCurrent}
                      className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setIsSaving(false)}
                      className="p-1.5 bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-300 dark:hover:bg-neutral-700 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSaving(true)}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Current Layout</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
