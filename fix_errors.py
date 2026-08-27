import re

# 1. Add type to DashboardLayoutManager presets
with open('src/components/DashboardLayoutManager.tsx', 'r') as f:
    dlm = f.read()

dlm = dlm.replace('i:', 'type: \'panel\', i:')

with open('src/components/DashboardLayoutManager.tsx', 'w') as f:
    f.write(dlm)

# 2. Add imports to SyncMatrixView
with open('src/components/SyncMatrixView.tsx', 'r') as f:
    smv = f.read()

smv = re.sub(r'import\s+\{([^}]+)\}\s+from\s+[\'"]lucide-react[\'"];', r'import {\1, Palette, X} from "lucide-react";', smv)

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(smv)

