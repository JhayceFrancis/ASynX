import re

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    content = f.read()

# Replace React-Grid-Layout imports
content = re.sub(r'import { Responsive, WidthProvider } from "react-grid-layout/legacy";\nimport \'react-grid-layout/css/styles\.css\';\nimport \'react-resizable/css/styles\.css\';\nconst ResponsiveGridLayout = WidthProvider\(Responsive\);\n', '', content)

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

  const renderPanel = (panel: PanelConfig) => {
    let colSpan = 'col-span-12';
    if (panel.w === 6) colSpan = 'col-span-12 md:col-span-6';
    if (panel.w === 4) colSpan = 'col-span-12 md:col-span-4';
    if (panel.w === 8) colSpan = 'col-span-12 md:col-span-8';
    if (panel.customSize === 'portrait') colSpan = 'col-span-12 md:col-span-4';
    if (panel.customSize === 'landscape') colSpan = 'col-span-12';
    if (panel.customSize === 'square') colSpan = 'col-span-12 md:col-span-6';
    if (panel.customSize === 'wide') colSpan = 'col-span-12';
    if (panel.customSize === 'tall') colSpan = 'col-span-12 md:col-span-8';

    const renderContent = () => {
      switch (panel.i) {
        case 'metrics': return renderMetrics();
        case 'recent': return renderRecent();
        case 'historical': return renderHistorical();
        case 'library': return renderLibrary();
        case 'sidelog': return renderSidelog();
        default: return null;
      }
    };

    return (
      <SortablePanel key={panel.i} id={panel.i} className={colSpan} isEditMode={isEditMode}>
        <div className={`w-full h-full relative rounded-2xl flex flex-col min-w-0 ${getPanelClass(panel.i, '')}`} style={getPanelStyle(panel.i)}>
          {renderEditToolbar(panel.i)}
          {renderCustomizer(panel.i)}
          {renderContent()}
        </div>
      </SortablePanel>
    );
  };
'''
content = content.replace("const [paletteOpen, setPaletteOpen] = useState(false);", "const [paletteOpen, setPaletteOpen] = useState(false);\n" + sensors_logic)

toolbar_replace = r'''<div className="flex items-center space-x-2">
            <DashboardLayoutManager 
              currentLayout={layout} 
              onLoadLayout={(l) => { setLayout(l); localStorage.setItem(storageKey, JSON.stringify(l)); if (onSaveSettings && settings) onSaveSettings({ ...settings, dashboardLayout: l }); }}
              tabId="sync_matrix" 
            />
            <button onClick={() => setPaletteOpen(!paletteOpen)} className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md">'''
content = content.replace('<button onClick={() => setPaletteOpen(!paletteOpen)} className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md">', toolbar_replace)
content = content.replace('<span>Toggle Panels</span>\n          </button>', '<span>Toggle Panels</span>\n          </button>\n          </div>')


# Replace layout components inside the return statement
# I will use a simple regex to replace the entire <ResponsiveGridLayout> block.

grid_start_idx = content.find('<ResponsiveGridLayout')
grid_end_idx = content.find('</ResponsiveGridLayout>') + len('</ResponsiveGridLayout>')

# The panels exist inside this grid. I need to extract their *inner* content.
metrics_inner = re.search(r'\{/\* Metrics Row \*/\}(?:.*?)(<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-full">.*?</div>\n\s*</div>)', content[grid_start_idx:grid_end_idx], re.DOTALL).group(1)
recent_inner = re.search(r'\{/\* SUMMARY CARD: 5 Most Recent Sync Events \*/\}(?:.*?)(<div className="bg-white dark:bg-\[#0a0a0a\] border border-gray-200 dark:border-neutral-900 rounded-2xl p-4 shadow-sm h-full flex flex-col">.*?</div>\n\s*</div>)', content[grid_start_idx:grid_end_idx], re.DOTALL).group(1)
historical_inner = re.search(r'\{/\* DASHBOARD VISUALIZATION.*? \*/\}(?:.*?)(<div className="bg-white dark:bg-\[#0a0a0a\] border border-gray-200 dark:border-neutral-900 rounded-2xl p-4 shadow-sm h-full flex flex-col">.*?</div>\n\s*</div>)', content[grid_start_idx:grid_end_idx], re.DOTALL).group(1)
library_inner = re.search(r'\{/\* Main Table / Grid \*/\}(?:.*?)(<div className="bg-white dark:bg-\[#0a0a0a\] border border-gray-200 dark:border-neutral-900 rounded-2xl p-4 flex flex-col gap-4 shadow-sm">.*?</div>\n\s*</div>\n\s*</div>)', content[grid_start_idx:grid_end_idx], re.DOTALL).group(1)
sidelog_inner = re.search(r'\{/\* Side Log / Activity Feed \(1 col\) \*/\}(?:.*?)(<div className="bg-white dark:bg-\[#0a0a0a\] border border-gray-200 dark:border-neutral-900 rounded-2xl p-4 shadow-sm">.*?</div>\n\s*</div>)', content[grid_start_idx:grid_end_idx], re.DOTALL).group(1)

# Now define functions above the return
render_functions = f'''
  const renderMetrics = () => (
    <>
      {metrics_inner.replace("</div>\\n        </div>", "</div>")}
    </>
  );

  const renderRecent = () => (
    <>
      {recent_inner.replace("</div>\\n        </div>", "</div>")}
    </>
  );

  const renderHistorical = () => (
    <>
      {historical_inner.replace("</div>\\n        </div>", "</div>")}
    </>
  );

  const renderLibrary = () => (
    <>
      {library_inner.replace("</div>\\n      </div>\\n      </div>", "</div>\\n      </div>")}
    </>
  );

  const renderSidelog = () => (
    <>
      {sidelog_inner.replace("</div>\\n        </div>", "</div>")}
    </>
  );
'''

# Wait, `metrics_inner` includes the outer `div className="grid..."`. It's fine! 
# We need to correctly strip the outer wrapper `react-grid-layout` div. My regex tried to grab from the first inner div to the matching end. But regex on nested HTML is brittle.
# I will instead extract the blocks manually since they are well-defined.
