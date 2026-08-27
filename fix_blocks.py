import sys

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    lines = f.readlines()

metrics_start = -1
recent_start = -1
historical_start = -1
library_start = -1
sidelog_start = -1

for i, l in enumerate(lines):
    if "{/* Metrics Row */}" in l:
        metrics_start = i
    elif "{/* SUMMARY CARD: 5 Most Recent Sync Events */}" in l:
        recent_start = i
    elif "{/* DASHBOARD VISUALIZATION: Historical Sync Frequency" in l:
        historical_start = i
    elif "{/* Main Table / Grid */}" in l:
        library_start = i
    elif "{/* Side Log / Activity Feed (1 col) */}" in l:
        sidelog_start = i

# I'll replace the `<div key="metrics" ...>` with nothing (since SortablePanel does it now)
def remove_layout_some_div(start_idx):
    # finds `{layout.some` and replaces it and the following `{renderEditToolbar` etc
    if start_idx == -1: return
    for i in range(start_idx, start_idx + 10):
        if "layout.some(" in lines[i]:
            lines[i] = ""
        if "renderEditToolbar(" in lines[i]:
            lines[i] = ""
        if "renderCustomizer(" in lines[i]:
            lines[i] = ""
            break

remove_layout_some_div(metrics_start)

# We need to cap `metrics` and open `recent` at `recent_start`.
# The end of `metrics` is exactly the `</div>` before `recent_start`.
if recent_start != -1:
    # the </div> is at recent_start - 1 (or -2)
    for i in range(recent_start - 3, recent_start):
        if "</div>" in lines[i]:
            lines[i] = "                    )}\n                    {panel.i === 'recent' && (\n"
            break
    remove_layout_some_div(recent_start)

if historical_start != -1:
    for i in range(historical_start - 3, historical_start):
        if "</div>" in lines[i]:
            lines[i] = "                    )}\n                    {panel.i === 'historical' && (\n"
            break
    remove_layout_some_div(historical_start)

if library_start != -1:
    for i in range(library_start - 3, library_start):
        if "</div>" in lines[i]:
            lines[i] = "                    )}\n                    {panel.i === 'library' && (\n"
            break
    remove_layout_some_div(library_start)

if sidelog_start != -1:
    for i in range(sidelog_start - 3, sidelog_start):
        if "</div>" in lines[i]:
            lines[i] = "                    )}\n                    {panel.i === 'sidelog' && (\n"
            break
    remove_layout_some_div(sidelog_start)

# Finally, we need to cap the whole loop at the end of the sidelog panel
for i in range(sidelog_start, len(lines)):
    if "</ResponsiveGridLayout>" in lines[i]:
        # Replace the `</div>` before this and `</ResponsiveGridLayout>` with the close
        lines[i] = "                    )}\n                  </div>\n                </SortablePanel>\n              );\n            })}\n          </div>\n        </SortableContext>\n      </DndContext>\n"
        # remove the leftover `</div>` just before it
        lines[i-1] = ""
        lines[i-2] = ""
        break

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.writelines(lines)
