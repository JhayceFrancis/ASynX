import re

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    content = f.read()

state_add = r'''const [activePanelId, setActivePanelId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  
  const togglePanelVisibility = (id: string) => {
    const exists = layout.find(l => l.i === id);
    let updated;
    if (exists) {
      updated = layout.filter(l => l.i !== id);
    } else {
      updated = [...layout, { i: id, x: 0, y: Infinity, w: 12, h: 4 }];
    }
    setLayout(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    if (onSaveSettings && settings) onSaveSettings({ ...settings, dashboardLayout: updated });
  };'''

content = content.replace('const [activePanelId, setActivePanelId] = useState<string | null>(null);', state_add)


toolbar_add = r'''<p className="text-xs text-indigo-400">Drag to reposition dashboard panels.</p>
          </div>
          <button onClick={() => setPaletteOpen(!paletteOpen)} className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md">
            <Palette className="w-3.5 h-3.5" />
            <span>Toggle Panels</span>
          </button>
        </div>
      )}
      
      {isEditMode && paletteOpen && (
        <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-2 p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-xl shadow-inner">
          {['metrics', 'recent', 'historical', 'library', 'sidelog'].map(pid => {
            const isActive = layout.some(l => l.i === pid);
            return (
              <button 
                key={pid} 
                onClick={() => togglePanelVisibility(pid)}
                className={`flex flex-col items-center justify-center p-3 border rounded-xl transition text-xs font-semibold ${isActive ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#111] text-gray-500'}`}
              >
                {isActive ? 'Hide' : 'Show'} {pid.charAt(0).toUpperCase() + pid.slice(1)}
              </button>
            )
          })}
        </div>
      )}'''

content = re.sub(r'<p className="text-xs text-indigo-400">Drag to reposition dashboard panels\.</p>\s*</div>\s*</div>\s*\)}', toolbar_add, content)

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(content)
