import re

with open('src/components/SyncMatrixView.tsx.bak', 'r') as f:
    lines = f.readlines()

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

for i, l in enumerate(lines):
    if "<ResponsiveGridLayout" in l:
        grid_start = i
        break
for i, l in enumerate(lines[grid_start:]):
    if "</ResponsiveGridLayout>" in l:
        grid_end = grid_start + i
        break

def extract_inner(lines_list, name):
    full_str = "".join(lines_list)
    if f"{{renderCustomizer('{name}')}}" in full_str:
        inner = full_str.split(f"{{renderCustomizer('{name}')}}")[1]
    else:
        inner = full_str
    
    # We just need to strip the final `</div>` which belonged to the outer container.
    inner = inner.rsplit('</div>', 1)[0]
    # And strip the closing brace if it exists
    if name != 'library': # library's brace was malformed, we handle it separately
        inner = inner.rsplit('}', 1)[0]
    
    return inner.strip()

metrics_str = extract_inner(lines[grid_start : 653], 'metrics')
recent_str = extract_inner(lines[653 : 718], 'recent')
historical_str = extract_inner(lines[718 : 805], 'historical')

# library has a special case because it's deeply nested and the backup was broken.
library_raw = "".join(lines[805 : 1392])
library_inner = library_raw.split("{renderCustomizer('library')}")[1]
# For library, the end in backup was: `            </div>\n      }\n          )}\n        </div>\n`
# The last `</div>` closes the outer library container. The `}` closes layout.some. The `)}` closes the ternary.
# So we want it to end with `            </div>\n          )}\n`
library_inner = library_inner.replace('            </div>\n      }\n          )}\n        </div>', '            </div>\n          )}\n')

sidelog_str = extract_inner(lines[1394 : 1437], 'sidelog')

render_content = f"""
  const renderPanelContent = (panelId: string) => {{
    switch (panelId) {{
      case 'metrics':
        return (
          <>
            {{renderEditToolbar('metrics')}}
            {{renderCustomizer('metrics')}}
            {metrics_str}
          </>
        );
      case 'recent':
        return (
          <>
            {{renderEditToolbar('recent')}}
            {{renderCustomizer('recent')}}
            {recent_str}
          </>
        );
      case 'historical':
        return (
          <>
            {{renderEditToolbar('historical')}}
            {{renderCustomizer('historical')}}
            {historical_str}
          </>
        );
      case 'library':
        return (
          <>
            {{renderEditToolbar('library')}}
            {{renderCustomizer('library')}}
            {library_inner}
          </>
        );
      case 'sidelog':
        return (
          <>
            {{renderEditToolbar('sidelog')}}
            {{renderCustomizer('sidelog')}}
            {sidelog_str}
          </>
        );
      default:
        return null;
    }}
  }};
"""

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
                  <div className={`w-full h-full relative rounded-2xl flex flex-col min-w-0 ${getPanelClass(panel.i, '')}`} style={getPanelStyle(panel.i)}>
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

for i, l in enumerate(lines):
    if l.startswith("  return ("):
        return_idx = i
        break

lines.insert(return_idx, sensors_logic + render_content)

for i, l in enumerate(lines):
    if "<ResponsiveGridLayout" in l:
        grid_start = i
        break

for i, l in enumerate(lines[grid_start:]):
    if "</ResponsiveGridLayout>" in l:
        grid_end = grid_start + i
        break

lines[grid_start:grid_end+1] = [new_grid]

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
