with open('src/components/SyncMatrixView.tsx', 'r') as f:
    lines = f.readlines()

# find the bad `}` at 1390
if "      }\n" in lines[1389]:
    lines[1389] = "" # remove it

# The real end of the library div is at 1392 (after removal, it will shift).
# Let's search for `{/* Side Log / Activity Feed (1 col) */}`
sidelog_idx = -1
for i, line in enumerate(lines):
    if "/* Side Log / Activity Feed" in line:
        sidelog_idx = i
        break

# We need to insert `}` before this comment
lines.insert(sidelog_idx, "      }\n")

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.writelines(lines)
