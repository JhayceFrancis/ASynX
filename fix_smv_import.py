import re
with open('src/components/SyncMatrixView.tsx', 'r') as f:
    c = f.read()

c = c.replace("import { Settings2, ChevronDown, ", "import { ")
c = re.sub(r'import \{ Search,', 'import { Search, Settings2, ChevronDown,', c)
with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(c)

