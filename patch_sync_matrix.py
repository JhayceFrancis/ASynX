import re

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    content = f.read()

# State injection
state_search = r'const \[analyticsData, setAnalyticsData\] = useState<SyncAnalyticsPoint\[\]>\(\[\]\);'
state_replace = r'''const [analyticsData, setAnalyticsData] = useState<SyncAnalyticsPoint[]>([]);
  const [activePanelId, setActivePanelId] = useState<string | null>(null);

  const updatePanelStyle = (id: string, updates: Partial<PanelConfig>) => {
    const updated = layout.map(p => p.i === id ? { ...p, ...updates } : p);
    setLayout(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    if (onSaveSettings && settings) onSaveSettings({ ...settings, dashboardLayout: updated });
  };
  
  const applySizePreset = (id: string, preset: 'portrait' | 'landscape' | 'square') => {
    const updated = layout.map(p => {
      if (p.i === id) {
        if (preset === 'portrait') return { ...p, w: 4, h: 12 };
        if (preset === 'landscape') return { ...p, w: 12, h: 6 };
        if (preset === 'square') return { ...p, w: 6, h: 8 };
      }
      return p;
    });
    setLayout(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    if (onSaveSettings && settings) onSaveSettings({ ...settings, dashboardLayout: updated });
  };
  
  const getPanelStyle = (id: string) => {
    const p = layout.find(l => l.i === id);
    if (!p) return {};
    return {
      fontFamily: p.fontFamily || 'inherit',
      fontSize: p.fontSize === 'sm' ? '0.875rem' : p.fontSize === 'lg' ? '1.125rem' : '1rem',
      fontStyle: p.fontStyle === 'italic' ? 'italic' : 'normal',
      fontWeight: p.fontStyle === 'bold' ? 'bold' : 'normal',
      color: p.textColor || 'inherit'
    };
  };
  
  const getPanelClass = (id: string, baseClass: string) => {
    const p = layout.find(l => l.i === id);
    if (!p) return baseClass;
    const customBg = p.bgGradient || p.bgColor || '';
    if (customBg) {
      // Remove any default bg- classes if customBg is present, simplified logic:
      return `${baseClass} ${customBg}`;
    }
    return baseClass;
  };
  
  const renderCustomizer = (id: string) => {
    if (activePanelId !== id || !isEditMode) return null;
    const p = layout.find(l => l.i === id);
    if (!p) return null;
    return (
      <div className="absolute inset-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md p-4 overflow-y-auto rounded-2xl border border-indigo-500/50 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-sm text-indigo-500 flex items-center gap-2"><Palette className="w-4 h-4"/> Customise Panel</h4>
          <button onClick={() => setActivePanelId(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded"><X className="w-4 h-4"/></button>
        </div>
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-500 dark:text-gray-400 font-bold mb-1">Layout Size</label>
            <div className="flex gap-2">
              <button onClick={() => applySizePreset(id, 'portrait')} className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded hover:bg-indigo-500/20">Portrait</button>
              <button onClick={() => applySizePreset(id, 'landscape')} className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded hover:bg-indigo-500/20">Landscape</button>
              <button onClick={() => applySizePreset(id, 'square')} className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded hover:bg-indigo-500/20">Square</button>
            </div>
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400 font-bold mb-1">Typography</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <select onChange={(e) => updatePanelStyle(id, { fontFamily: e.target.value })} value={p.fontFamily || ''} className="bg-gray-100 dark:bg-neutral-800 border-none rounded p-1">
                <option value="">Default Font</option>
                <option value="sans-serif">Sans-Serif</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
              </select>
              <select onChange={(e) => updatePanelStyle(id, { fontSize: e.target.value })} value={p.fontSize || ''} className="bg-gray-100 dark:bg-neutral-800 border-none rounded p-1">
                <option value="">Default Size</option>
                <option value="sm">Small</option>
                <option value="base">Normal</option>
                <option value="lg">Large</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => updatePanelStyle(id, { fontStyle: p.fontStyle === 'bold' ? '' : 'bold' })} className={`px-2 py-1 rounded ${p.fontStyle === 'bold' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-neutral-800'}`}>Bold</button>
              <button onClick={() => updatePanelStyle(id, { fontStyle: p.fontStyle === 'italic' ? '' : 'italic' })} className={`px-2 py-1 rounded ${p.fontStyle === 'italic' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-neutral-800'}`}>Italic</button>
            </div>
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400 font-bold mb-1">Background Gradient</label>
            <div className="grid grid-cols-3 gap-1">
              <button onClick={() => updatePanelStyle(id, { bgGradient: '', bgColor: '' })} className="h-6 rounded bg-gray-200 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700"></button>
              <button onClick={() => updatePanelStyle(id, { bgGradient: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20' })} className="h-6 rounded bg-gradient-to-br from-indigo-500/20 to-purple-500/20"></button>
              <button onClick={() => updatePanelStyle(id, { bgGradient: 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20' })} className="h-6 rounded bg-gradient-to-br from-emerald-500/20 to-cyan-500/20"></button>
              <button onClick={() => updatePanelStyle(id, { bgGradient: 'bg-gradient-to-br from-rose-500/20 to-orange-500/20' })} className="h-6 rounded bg-gradient-to-br from-rose-500/20 to-orange-500/20"></button>
              <button onClick={() => updatePanelStyle(id, { bgGradient: 'bg-gradient-to-br from-slate-800 to-black' })} className="h-6 rounded bg-gradient-to-br from-slate-800 to-black"></button>
              <button onClick={() => updatePanelStyle(id, { bgGradient: 'bg-gradient-to-br from-indigo-900 to-slate-900' })} className="h-6 rounded bg-gradient-to-br from-indigo-900 to-slate-900"></button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderEditToolbar = (id: string) => {
    if (!isEditMode) return null;
    return (
      <div className="absolute top-2 right-2 z-40 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md rounded-lg p-1 border border-neutral-700">
        <button onClick={(e) => { e.stopPropagation(); setActivePanelId(activePanelId === id ? null : id); }} className="p-1 hover:bg-indigo-500/20 text-indigo-400 rounded" title="Customize Style & Size">
          <Palette className="w-3.5 h-3.5" />
        </button>
        <div className="drag-handle cursor-move p-1 hover:bg-neutral-800 rounded text-gray-300">
          <Settings className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  };
'''
content = re.sub(state_search, state_replace, content)

# Also import Palette if needed
if 'Palette' not in content:
    content = content.replace("import { \n  Search", "import { \n  Palette,\n  Search")


with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(content)
