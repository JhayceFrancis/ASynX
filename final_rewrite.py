import re

with open('src/components/SyncMatrixView.tsx.bak', 'r') as f:
    content = f.read()

# 1. Fix imports
content = re.sub(r'import { Responsive, WidthProvider } from "react-grid-layout/legacy";\s*import \'react-grid-layout/css/styles\.css\';\s*import \'react-resizable/css/styles\.css\';\s*const ResponsiveGridLayout = WidthProvider\(Responsive\);', '', content)

new_imports = '''import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortablePanel } from './SortablePanel';
import { DashboardLayoutManager } from './DashboardLayoutManager';
'''
content = content.replace("import { PanelConfig } from '../types';", new_imports + "import { PanelConfig } from '../types';")

# 2. Add sensors logic
sensors_logic = '''
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLayout((items) => {
        const oldIndex = items.findIndex((i) => i.i === active.id);
        const newIndex = items.findIndex((i) => i.i === over.id);
        const updated = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        if (onSaveSettings && settings) {
          onSaveSettings({ ...settings, dashboardLayout: updated });
        }
        return updated;
      });
    }
  };
'''
content = content.replace("const [paletteOpen, setPaletteOpen] = useState(false);", "const [paletteOpen, setPaletteOpen] = useState(false);\n" + sensors_logic)

# 3. Toolbar Manager
toolbar_replace = r'''<div className="flex items-center space-x-2">
            <DashboardLayoutManager 
              currentLayout={layout} 
              onLoadLayout={(l) => { setLayout(l); localStorage.setItem(storageKey, JSON.stringify(l)); if (onSaveSettings && settings) onSaveSettings({ ...settings, dashboardLayout: l }); }}
              tabId="sync_matrix" 
            />
            <button onClick={() => setPaletteOpen(!paletteOpen)} className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md">'''
content = content.replace('<button onClick={() => setPaletteOpen(!paletteOpen)} className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md">', toolbar_replace)
content = content.replace('<span>Toggle Panels</span>\n          </button>', '<span>Toggle Panels</span>\n          </button>\n          </div>')

# 4. First, fix the malformed `library` closing brace in the backup!
# Backup had: `            </div>\n      }\n          )}\n        </div>`
# It should be: `            </div>\n          )}\n        </div>\n      }`
content = content.replace('            </div>\n      }\n          )}\n        </div>', '            </div>\n          )}\n        </div>\n      }')

# 5. Now replace the Grid wrapper.
grid_start = content.find('<ResponsiveGridLayout')
dnd_wrapper = '''<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={layout.map(l => l.i)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
            {layout.map(p => {
              let colSpan = 'col-span-12';
              if (p.w === 6) colSpan = 'col-span-12 md:col-span-6';
              if (p.w === 4) colSpan = 'col-span-12 md:col-span-4';
              if (p.w === 8) colSpan = 'col-span-12 md:col-span-8';
              if (p.customSize === 'portrait') colSpan = 'col-span-12 md:col-span-4';
              if (p.customSize === 'landscape') colSpan = 'col-span-12';
              if (p.customSize === 'square') colSpan = 'col-span-12 md:col-span-6';
              if (p.customSize === 'wide') colSpan = 'col-span-12';
              if (p.customSize === 'tall') colSpan = 'col-span-12 md:col-span-8';
              
              return (
                <SortablePanel key={p.i} id={p.i} className={colSpan} isEditMode={isEditMode}>
'''
content = re.sub(r'<ResponsiveGridLayout[^>]+>', dnd_wrapper, content)
content = content.replace('</ResponsiveGridLayout>', '                </SortablePanel>\n              );\n            })}\n          </div>\n        </SortableContext>\n      </DndContext>')

# 6. Replace the conditionals for the panels!
content = content.replace('{layout.some(l => l.i === "metrics") && <div key="metrics"', '{p.i === "metrics" && ( <div key="metrics"')
content = content.replace('{layout.some(l => l.i === "recent") && <div key="recent"', '{p.i === "recent" && ( <div key="recent"')
content = content.replace('{layout.some(l => l.i === "historical") && <div key="historical"', '{p.i === "historical" && ( <div key="historical"')
content = content.replace('{layout.some(l => l.i === "library") && <div key="library"', '{p.i === "library" && ( <div key="library"')
content = content.replace('{layout.some(l => l.i === "sidelog") && <div key="sidelog"', '{p.i === "sidelog" && ( <div key="sidelog"')

# 7. Replace the closing `}` for each conditional.
# Now that we fixed the library brace, ALL of them end with `\n      }`
# BUT we only want to replace the `}` that corresponds to the 5 panels.
# To be safe, we can just replace `\n      }` with `\n      )}` IF it precedes a comment for the next panel.

content = content.replace('      }\n      {/* SUMMARY CARD', '      )}\n      {/* SUMMARY CARD')
content = content.replace('      }\n      {/* DASHBOARD VISUALIZATION', '      )}\n      {/* DASHBOARD VISUALIZATION')
content = content.replace('      }\n      {/* Main Table', '      )}\n      {/* Main Table')
content = content.replace('      }\n        {/* Side Log', '      )}\n        {/* Side Log')

# And the very last one, which is right before `</SortablePanel>` (since we replaced </ResponsiveGridLayout>)
content = content.replace('      }\n                </SortablePanel>', '      )}\n                </SortablePanel>')

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(content)
