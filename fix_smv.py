import re
with open('src/components/SyncMatrixView.tsx', 'r') as f:
    c = f.read()

c = re.sub(r'import\s*\{\s*Search\s*,', 'import { Search, Settings2, ChevronDown,', c)

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(c)

