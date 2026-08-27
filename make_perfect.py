import re

with open('src/components/SyncMatrixView.tsx.bak', 'r') as f:
    content = f.read()

# 1. Imports
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

# 2. Add dnd-kit logic
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

# 3. Toolbar DashboardLayoutManager
toolbar_replace = r'''<div className="flex items-center space-x-2">
            <DashboardLayoutManager 
              currentLayout={layout} 
              onLoadLayout={(l) => { setLayout(l); localStorage.setItem(storageKey, JSON.stringify(l)); if (onSaveSettings && settings) onSaveSettings({ ...settings, dashboardLayout: l }); }}
              tabId="sync_matrix" 
            />
            <button onClick={() => setPaletteOpen(!paletteOpen)} className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md">'''
content = content.replace('<button onClick={() => setPaletteOpen(!paletteOpen)} className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md">', toolbar_replace)
content = content.replace('<span>Toggle Panels</span>\n          </button>', '<span>Toggle Panels</span>\n          </button>\n          </div>')


# 4. Extracting the inner panels.
grid_start = content.find('<ResponsiveGridLayout')
grid_end = content.find('</ResponsiveGridLayout>')

grid_content = content[grid_start:grid_end]

# Let's fix the broken brace in grid_content first.
# The `library` ends with `</div>\n      }\n          )}\n        </div>`
# It should be `</div>\n          )}\n        </div>\n      </div>`
grid_content = grid_content.replace('            </div>\n      }\n          )}\n        </div>', '            </div>\n          )}\n        </div>\n      </div>')

# Now fix the closing of `metrics`
# In backup:
#       </div>
#       </div>
#       }
grid_content = grid_content.replace('      </div>\n      </div>\n      }', '      </div>\n      </div>\n      </div>')

# Fix the closing of `recent`
grid_content = grid_content.replace('      </div>\n      </div>\n      }', '      </div>\n      </div>\n      </div>')

# Fix the closing of `historical`
grid_content = grid_content.replace('      </div>\n      </div>\n      }', '      </div>\n      </div>\n      </div>')

# Fix the closing of `sidelog`
grid_content = grid_content.replace('          </div>\n        </div>\n      }', '          </div>\n        </div>\n      </div>')

# Now that the HTML is balanced (we replaced `}` with `</div>`), we can simply replace the conditionals.
for p in ['metrics', 'recent', 'historical', 'library', 'sidelog']:
    old_cond = f'{{layout.some(l => l.i === "{p}") && <div key="{p}"'
    new_cond = f'{{panel.i === "{p}" && (\n<SortablePanel key="{p}" id="{p}" className={{colSpan}} isEditMode={{isEditMode}}>\n<div key="{p}"'
    grid_content = grid_content.replace(old_cond, new_cond)

# Since we replaced `{layout.some...` with `{panel.i ... ( <SortablePanel ...`, we now have `</div>` at the end of each block that was formerly closing the main div.
# We need to change that `</div>` to `</div>\n</SortablePanel>\n)}`
# Wait, for each panel, the block is followed by a comment, except sidelog which is followed by nothing.
grid_content = grid_content.replace('      </div>\n      {/* SUMMARY', '      </div>\n</SortablePanel>\n)}\n      {/* SUMMARY')
grid_content = grid_content.replace('      </div>\n      {/* DASHBOARD', '      </div>\n</SortablePanel>\n)}\n      {/* DASHBOARD')
grid_content = grid_content.replace('      </div>\n      {/* Main Table', '      </div>\n</SortablePanel>\n)}\n      {/* Main Table')
grid_content = grid_content.replace('      </div>\n        {/* Side Log', '      </div>\n</SortablePanel>\n)}\n        {/* Side Log')

# For the last one, sidelog, it ends at the end of grid_content.
grid_content = grid_content.rstrip()
if grid_content.endswith('</div>'):
    grid_content = grid_content[:-6] + '</div>\n</SortablePanel>\n)}\n'

dnd_wrapper = '''<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={layout.map(l => l.i)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
            {layout.map(panel => {
              let colSpan = 'col-span-12';
              if (panel.w === 6) colSpan = 'col-span-12 md:col-span-6';
              if (panel.w === 4) colSpan = 'col-span-12 md:col-span-4';
              if (panel.w === 8) colSpan = 'col-span-12 md:col-span-8';
              if (panel.customSize === 'portrait') colSpan = 'col-span-12 md:col-span-4';
              if (panel.customSize === 'landscape') colSpan = 'col-span-12';
              if (panel.customSize === 'square') colSpan = 'col-span-12 md:col-span-6';
              if (panel.customSize === 'wide') colSpan = 'col-span-12';
              if (panel.customSize === 'tall') colSpan = 'col-span-12 md:col-span-8';
              return (
                <React.Fragment key={panel.i}>
'''

dnd_end = '''
                </React.Fragment>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
'''

# We also need to strip out the <ResponsiveGridLayout ...> from grid_content!
# It's at the start.
grid_content = re.sub(r'<ResponsiveGridLayout[^>]+>', dnd_wrapper, grid_content)

new_content = content[:grid_start] + grid_content + dnd_end + content[grid_end + len('</ResponsiveGridLayout>'):]

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(new_content)
