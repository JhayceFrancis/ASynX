import re

with open('src/components/GridLayoutEngine.tsx', 'r') as f:
    content = f.read()

# Add new icons
content = content.replace("import { Settings, X, Plus } from 'lucide-react';", "import { Settings, X, Plus, Type, Layout, Palette } from 'lucide-react';")

# Add activePanelId state
content = content.replace('const [widgetPaletteOpen, setWidgetPaletteOpen] = useState(false);', '''const [widgetPaletteOpen, setWidgetPaletteOpen] = useState(false);
  const [activePanelId, setActivePanelId] = useState<string | null>(null);''')

# Add size preset and styling functions
update_panel_func = '''
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
'''
content = content.replace('const changePanelBg = (id: string, color: string) => {', update_panel_func + '\n  const changePanelBg = (id: string, color: string) => {')

# Add panel rendering logic
render_start = r'className={`relative flex flex-col \$\{panel\.bgColor \|\| \'bg-white dark:bg-\[#0a0a0a\]\'\} border border-gray-200 dark:border-neutral-900 rounded-2xl shadow-sm overflow-hidden group`}'
render_replace = r'''className={`relative flex flex-col ${panel.bgGradient || panel.bgColor || 'bg-white dark:bg-[#0a0a0a]'} border border-gray-200 dark:border-neutral-900 rounded-2xl shadow-sm overflow-hidden group`}
              style={{
                fontFamily: panel.fontFamily || 'inherit',
                fontSize: panel.fontSize === 'sm' ? '0.875rem' : panel.fontSize === 'lg' ? '1.125rem' : '1rem',
                fontStyle: panel.fontStyle === 'italic' ? 'italic' : 'normal',
                fontWeight: panel.fontStyle === 'bold' ? 'bold' : 'normal',
                color: panel.textColor || 'inherit'
              }}'''
content = re.sub(render_start, render_replace, content)

# Modify the hover toolbar
toolbar_search = r'<div className="drag-handle cursor-move p-1 hover:bg-neutral-800 rounded text-gray-300">\s*<Settings className="w-3\.5 h-3\.5" />\s*</div>'
toolbar_replace = r'''<button onClick={() => setActivePanelId(activePanelId === panel.i ? null : panel.i)} className="p-1 hover:bg-indigo-500/20 text-indigo-400 rounded" title="Customize Style & Size">
                    <Palette className="w-3.5 h-3.5" />
                  </button>
                  <div className="drag-handle cursor-move p-1 hover:bg-neutral-800 rounded text-gray-300">
                    <Settings className="w-3.5 h-3.5" />
                  </div>'''
content = re.sub(toolbar_search, toolbar_replace, content)

# Inject the active customizer popup
popup_injection = r'''<div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar">'''
popup_content = r'''
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
              
              <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar">'''
content = content.replace(popup_injection, popup_content)

with open('src/components/GridLayoutEngine.tsx', 'w') as f:
    f.write(content)

