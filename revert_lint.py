import re

# 1. Revert server.ts req -> _req (but be careful)
with open('server.ts', 'r') as f:
    c = f.read()
# Revert parameter
c = re.sub(r'\(_req, res\)', '(req, res)', c)
c = re.sub(r'\(_req, _res\)', '(req, res)', c)
# Any missing req? They were TS2552.

with open('server.ts', 'w') as f:
    f.write(c)

# 2. SyncMatrixView.tsx
with open('src/components/SyncMatrixView.tsx', 'r') as f:
    c = f.read()
c = re.sub(r'ChevronDownAxis', 'XAxis', c)
c = re.sub(r'Settings2Axis', 'PaletteAxis', c) # just in case
c = re.sub(r'<ChevronDown ', '<X ', c)
c = re.sub(r'import \{.*?ChevronDown.*\} from "lucide-react";', lambda m: m.group(0).replace('ChevronDown', 'X'), c)
c = re.sub(r'import \{.*?Settings2.*\} from "lucide-react";', lambda m: m.group(0).replace('Settings2', 'Palette'), c)
with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(c)
