import sys

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    lines = f.readlines()

# 1. Imports
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

# 2. Add handleDragEnd and renderContent helpers before the return statement.
# find `return (`
return_idx = -1
for i, l in enumerate(lines):
    if "  return (" in l and "isEditMode" in lines[i-15:i+15]: 
        pass
    # wait, just find `  return (` that comes after `togglePanelVisibility`
    if l.startswith("  return ("):
        return_idx = i
        break

sensors_logic = """
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
        if (onSaveSettings && settings) onSaveSettings({ ...settings, dashboardLayout: updated });
        return updated;
      });
    }
  };
"""
lines.insert(return_idx, sensors_logic)

# 3. Add DashboardLayoutManager
# find `<span>Toggle Panels</span>`
for i, l in enumerate(lines):
    if "<span>Toggle Panels</span>" in l:
        # replace the previous line with the DashboardLayoutManager + the button
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

# 4. Replace ResponsiveGridLayout with DndContext
for i, l in enumerate(lines):
    if "<ResponsiveGridLayout" in l:
        rgl_start = i
        break
for i, l in enumerate(lines[rgl_start:]):
    if "useCSSTransforms={true}" in l:
        rgl_end_props = rgl_start + i
        break

lines[rgl_start:rgl_end_props+2] = [
    "      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>\n",
    "        <SortableContext items={layout.map(l => l.i)} strategy={rectSortingStrategy}>\n",
    "          <div className=\"grid grid-cols-1 md:grid-cols-12 gap-6 w-full\">\n",
    "            {layout.map(panel => {\n",
    "              let colSpan = 'col-span-12';\n",
    "              if (panel.w === 6) colSpan = 'col-span-12 md:col-span-6';\n",
    "              if (panel.w === 4) colSpan = 'col-span-12 md:col-span-4';\n",
    "              if (panel.w === 8) colSpan = 'col-span-12 md:col-span-8';\n",
    "              if (panel.customSize === 'portrait') colSpan = 'col-span-12 md:col-span-4';\n",
    "              if (panel.customSize === 'landscape') colSpan = 'col-span-12';\n",
    "              if (panel.customSize === 'square') colSpan = 'col-span-12 md:col-span-6';\n",
    "              if (panel.customSize === 'wide') colSpan = 'col-span-12';\n",
    "              if (panel.customSize === 'tall') colSpan = 'col-span-12 md:col-span-8';\n",
    "              return (\n",
    "                <SortablePanel key={panel.i} id={panel.i} className={colSpan} isEditMode={isEditMode}>\n",
    "                  <div className={`w-full h-full relative rounded-2xl flex flex-col min-w-0 ${getPanelClass(panel.i, '')}`} style={getPanelStyle(panel.i)}>\n",
    "                    {renderEditToolbar(panel.i)}\n",
    "                    {renderCustomizer(panel.i)}\n",
    "                    {panel.i === 'metrics' && (\n"
]

# We need to replace `{layout.some(l => l.i === "metrics") && <div key="metrics"...`
# with just the inner content, because the SortablePanel + styling is now wrapping it.
with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.writelines(lines)
