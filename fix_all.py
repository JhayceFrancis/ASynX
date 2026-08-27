import re

# Restore server.ts req and res
with open('server.ts', 'r') as f:
    c = f.read()
c = re.sub(r'\b_req\b', 'req', c)
c = re.sub(r'\b_res\b', 'res', c)
with open('server.ts', 'w') as f:
    f.write(c)

# src/components/SyncMatrixView.tsx
with open('src/components/SyncMatrixView.tsx', 'r') as f:
    c = f.read()
# Add the missing imports for Settings2 and ChevronDown
if 'Settings2' not in c[:1000] and 'ChevronDown' not in c[:1000]:
    c = re.sub(r'import \{', 'import { Settings2, ChevronDown, ', c, count=1)
# Restore the Palette and ChevronDown if they were erroneously renamed in JSX
c = re.sub(r'<Palette', '<Settings2', c)
c = re.sub(r'ChevronDownAxis', 'XAxis', c)
with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(c)

# Add ignore for unused req, res parameters in tsconfig?
# Or just rename req to _req only where TS complained. 
# We'll just configure tsconfig to ignore unused parameters to be safe,
# OR we can regex replace req to _req safely:
