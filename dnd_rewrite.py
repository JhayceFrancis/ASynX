import re

with open('src/components/SyncMatrixView.tsx', 'r') as f:
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

# 4. Wrapping the layout in DndContext + Map
dnd_start = '''<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
content = re.sub(r'<ResponsiveGridLayout[^>]+>', dnd_start, content)
content = content.replace('</ResponsiveGridLayout>', '                </React.Fragment>\n              );\n            })}\n          </div>\n        </SortableContext>\n      </DndContext>')

# 5. Modifying the condition blocks
for panel_id in ['metrics', 'recent', 'historical', 'library', 'sidelog']:
    old_cond = f'{{layout.some(l => l.i === "{panel_id}") &&'
    new_cond = f'{{panel.i === "{panel_id}" && (\n<SortablePanel key={panel_id} id="{panel_id}" className={{colSpan}} isEditMode={{isEditMode}}>'
    content = content.replace(old_cond, new_cond)

# 6. Fixing the closing braces
# Since we replaced `{... &&` with `{... && ( <SortablePanel>`, we need to find the `}` that matches it and change it to `</SortablePanel> )}`
# This `}` is on a line by itself usually preceded by `</div>`

# We know the line numbers for the closing `}` are: 652, 717, 804, 1393, 1436 (approximate, since we added lines above it will shift).
# Let's just find `      }` on a line by itself if it comes after the replaced blocks. 
# A safer way is to do it using regex. The pattern is `</div>\n      }` -> `</div>\n</SortablePanel>\n      )}`
content = content.replace('</div>\n      }\n', '</div>\n</SortablePanel>\n      )}\n')

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(content)
