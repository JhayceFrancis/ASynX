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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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

# 3. Toolbar
toolbar_replace = r'''<div className="flex items-center space-x-2">
            <DashboardLayoutManager 
              currentLayout={layout} 
              onLoadLayout={(l) => { setLayout(l); localStorage.setItem(storageKey, JSON.stringify(l)); if (onSaveSettings && settings) onSaveSettings({ ...settings, dashboardLayout: l }); }}
              tabId="sync_matrix" 
            />
            <button onClick={() => setPaletteOpen(!paletteOpen)} className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md">'''
content = content.replace('<button onClick={() => setPaletteOpen(!paletteOpen)} className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md">', toolbar_replace)
content = content.replace('<span>Toggle Panels</span>\n          </button>', '<span>Toggle Panels</span>\n          </button>\n          </div>')

# 4. Refactor the layout mapping!
# Right now, `layout.some(...) && <div key="metrics" ...>` is hardcoded.
# We need to map over layout to ensure they are rendered in array order.

metrics_panel = re.search(r'(\{/\* Metrics Row \*/\}.*?)\{/\* Historical Trend Chart \*/\}', content, re.DOTALL).group(1)
historical_panel = re.search(r'(\{/\* Historical Trend Chart \*/\}.*?)\{/\* Main Table / Grid \*/\}', content, re.DOTALL).group(1)
library_panel = re.search(r'(\{/\* Main Table / Grid \*/\}.*?)\{/\* Side Log / Activity Feed \(1 col\) \*/\}', content, re.DOTALL).group(1)
sidelog_panel = re.search(r'(\{/\* Side Log / Activity Feed \(1 col\) \*/\}.*?)(?=\<\/ResponsiveGridLayout\>)', content, re.DOTALL).group(1)

# Now wait, `recent` is NOT in those. Where is recent? Let's check where `recent` is rendered.
