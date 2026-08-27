with open('src/components/SyncMatrixView.tsx', 'r') as f:
    lines = f.readlines()

lines.insert(802, "      }\n")
lines.insert(1389, "      }\n")

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.writelines(lines)
