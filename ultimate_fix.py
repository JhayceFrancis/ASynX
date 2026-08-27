import re

with open('src/components/SyncMatrixView.tsx.bak', 'r') as f:
    lines = f.readlines()

# Fix imports
import_rgl_start = -1
for i, l in enumerate(lines):
    if "import { Responsive, WidthProvider }" in l:
        import_rgl_start = i
        break

if import_rgl_start != -1:
    lines[import_rgl_start:import_rgl_start+5] = [
        "import {\n  DndContext,\n  closestCenter,\n  KeyboardSensor,\n  PointerSensor,\n  useSensor,\n  useSensors,\n  DragEndEvent\n} from '@dnd-kit/core';\n",
        "import {\n  arrayMove,\n  SortableContext,\n  sortableKeyboardCoordinates,\n  rectSortingStrategy,\n} from '@dnd-kit/sortable';\n",
        "import { SortablePanel } from './SortablePanel';\n",
        "import { DashboardLayoutManager } from './DashboardLayoutManager';\n"
    ]

# Find the start of ResponsiveGridLayout
for i, l in enumerate(lines):
    if "<ResponsiveGridLayout" in l:
        grid_start = i
        break

for i, l in enumerate(lines[grid_start:]):
    if "</ResponsiveGridLayout>" in l:
        grid_end = grid_start + i
        break

# The panels
metrics_str = "".join(lines[grid_start+13 : 650])
recent_str = "".join(lines[653 : 715])
historical_str = "".join(lines[718 : 802])

library_lines = lines[805 : 1389]
library_lines.append("            </div>\n          )}\n        </div>\n")
library_str = "".join(library_lines)

sidelog_str = "".join(lines[1394 : 1435])

# Add the renderContent function
render_content = f"""
  const renderPanelContent = (panelId: string) => {{
    switch (panelId) {{
      case 'metrics':
        return (
          <div className="w-full h-full group relative rounded-2xl flex flex-col min-w-0" style={{getPanelStyle('metrics')}}>
            {{renderEditToolbar('metrics')}}
            {{renderCustomizer('metrics')}}
            {{/* The inner content */}}
            {metrics_str.split("{{renderCustomizer('metrics')}}")[1] if "{{renderCustomizer('metrics')}}" in metrics_str else metrics_str}
          </div>
        );
      case 'recent':
        return (
          <div className="w-full h-full group relative rounded-2xl flex flex-col min-w-0" style={{getPanelStyle('recent')}}>
            {{renderEditToolbar('recent')}}
            {{renderCustomizer('recent')}}
            {recent_str.split("{{renderCustomizer('recent')}}")[1] if "{{renderCustomizer('recent')}}" in recent_str else recent_str}
          </div>
        );
      case 'historical':
        return (
          <div className="w-full h-full group relative rounded-2xl flex flex-col min-w-0" style={{getPanelStyle('historical')}}>
            {{renderEditToolbar('historical')}}
            {{renderCustomizer('historical')}}
            {historical_str.split("{{renderCustomizer('historical')}}")[1] if "{{renderCustomizer('historical')}}" in historical_str else historical_str}
          </div>
        );
      case 'library':
        return (
          <div className="w-full h-full overflow-hidden group relative rounded-2xl flex flex-col min-w-0 space-y-4" style={{getPanelStyle('library')}}>
            {{renderEditToolbar('library')}}
            {{renderCustomizer('library')}}
            {library_str.split("{{renderCustomizer('library')}}")[1] if "{{renderCustomizer('library')}}" in library_str else library_str}
          </div>
        );
      case 'sidelog':
        return (
          <div className="w-full h-full overflow-hidden group relative rounded-2xl flex flex-col min-w-0 space-y-4" style={{getPanelStyle('sidelog')}}>
            {{renderEditToolbar('sidelog')}}
            {{renderCustomizer('sidelog')}}
            {sidelog_str.split("{{renderCustomizer('sidelog')}}")[1] if "{{renderCustomizer('sidelog')}}" in sidelog_str else sidelog_str}
          </div>
        );
      default:
        return null;
    }}
  }};
"""

# Assemble new grid
new_grid = """
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
                <SortablePanel key={panel.i} id={panel.i} className={colSpan} isEditMode={isEditMode}>
                  <div className={`w-full h-full relative rounded-2xl flex flex-col min-w-0 ${getPanelClass(panel.i, '')}`}>
                    {renderPanelContent(panel.i)}
                  </div>
                </SortablePanel>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
"""

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

# Find togglePanelVisibility and insert sensors_logic + render_content before the return statement.
for i, l in enumerate(lines):
    if l.startswith("  return ("):
        return_idx = i
        break

lines.insert(return_idx, sensors_logic + render_content)

# Adjust the grid_start and grid_end indices because we just inserted lines!
# Recalculate them.
for i, l in enumerate(lines):
    if "<ResponsiveGridLayout" in l:
        grid_start = i
        break

for i, l in enumerate(lines[grid_start:]):
    if "</ResponsiveGridLayout>" in l:
        grid_end = grid_start + i
        break

lines[grid_start:grid_end+1] = [new_grid]

# Add DashboardLayoutManager to toolbar
for i, l in enumerate(lines):
    if "<span>Toggle Panels</span>" in l:
        lines[i-2] = """          <div className="flex items-center space-x-2">
            <DashboardLayoutManager 
              currentLayout={layout} 
              onLoadLayout={(l) => { setLayout(l); localStorage.setItem(storageKey, JSON.stringify(l)); if (onSaveSettings && settings) onSaveSettings({ ...settings, dashboardLayout: l }); }}
              tabId="sync_matrix" 
            />
            <button onClick={() => setPaletteOpen(!paletteOpen)} className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md">
              <Palette className="w-3.5 h-3.5" />
"""
        lines[i] = "              <span>Toggle Panels</span>\n            </button>\n          </div>\n"
        break

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.writelines(lines)

