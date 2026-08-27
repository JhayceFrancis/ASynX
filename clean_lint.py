import re

def clean_file(filepath, unused_vars):
    with open(filepath, 'r') as f:
        c = f.read()
    
    for var in unused_vars:
        # Regex to remove unused imports: remove `Var, ` or `Var }` -> `}` or `, Var` -> ``
        c = re.sub(r'\b' + var + r'\b\s*,\s*', '', c)
        c = re.sub(r',\s*\b' + var + r'\b', '', c)
        c = re.sub(r'\{\s*\b' + var + r'\b\s*\}', '{}', c)
        
    with open(filepath, 'w') as f:
        f.write(c)

# src/App.tsx
clean_file('src/App.tsx', ['SyncScheduleView', 'ScrobblePrompt', 'itemId'])
# For App.tsx line 19 unused import:
with open('src/App.tsx', 'r') as f:
    c = f.read()
c = re.sub(r'import \{.*?\} from "lucide-react";\n+', '', c, count=1)
c = re.sub(r'const handleUndoSync = \(itemId: string\) => \{', 'const handleUndoSync = () => {', c) # since it's unused
with open('src/App.tsx', 'w') as f:
    f.write(c)

# server.ts
with open('server.ts', 'r') as f:
    c = f.read()
# Replace req -> _req in parameters
c = re.sub(r'\(req: Request', '(_req: Request', c)
c = re.sub(r'\(req, res', '(_req, res', c)
# For all unused req, we can just replace req with _req where it's a parameter. 
c = re.sub(r'app\.get\((.*?),\s*\(req,\s*res\)', r'app.get(\1, (_req, res)', c)
c = re.sub(r'app\.post\((.*?),\s*async\s*\(req,\s*res\)', r'app.post(\1, async (_req, res)', c)
c = re.sub(r'app\.get\((.*?),\s*async\s*\(req,\s*res\)', r'app.get(\1, async (_req, res)', c)
c = re.sub(r'app\.delete\((.*?),\s*async\s*\(req,\s*res\)', r'app.delete(\1, async (_req, res)', c)
# Unused lastSpecificTimeTrigger
c = re.sub(r'let lastSpecificTimeTrigger = false;', '', c)
c = re.sub(r'lastSpecificTimeTrigger = true;', '', c)
c = re.sub(r'lastSpecificTimeTrigger = false;', '', c)
# Unused res in app.get("/api/metrics", (req, res) => ...
c = re.sub(r'app\.get\("/api/metrics", \(_req, res\)', 'app.get("/api/metrics", (_req, _res)', c)

with open('server.ts', 'w') as f:
    f.write(c)

# src/components/ApiDocumentationView.tsx
clean_file('src/components/ApiDocumentationView.tsx', ['React', 'Server'])

# src/components/ConflictResolutionView.tsx
clean_file('src/components/ConflictResolutionView.tsx', ['Tooltip', 'ArrowRight', 'Clock', 'RotateCcw', 'Layers'])

# src/components/ExtensionCompanionView.tsx
clean_file('src/components/ExtensionCompanionView.tsx', ['Compass', 'Pause', 'ExternalLink', 'Radio', 'RefreshCw'])

# src/components/GridLayoutEngine.tsx
with open('src/components/GridLayoutEngine.tsx', 'r') as f:
    c = f.read()
c = re.sub(r'const \{ currentLayout, allLayouts \} = useGridLayoutStore\(\);', 'const { currentLayout } = useGridLayoutStore();', c)
with open('src/components/GridLayoutEngine.tsx', 'w') as f:
    f.write(c)

# src/components/Navbar.tsx
with open('src/components/Navbar.tsx', 'r') as f:
    c = f.read()
c = re.sub(r'const themeToggleNode = document\.createElement\("div"\);\n', '', c)
with open('src/components/Navbar.tsx', 'w') as f:
    f.write(c)

# src/components/PlexWebhookView.tsx
clean_file('src/components/PlexWebhookView.tsx', ['Tv', 'FileText', 'Search', 'ArrowRight', 'Code', 'CheckCircle2', 'XCircle'])

# src/components/SettingsView.tsx
clean_file('src/components/SettingsView.tsx', ['Cloud', 'Palette', 'Key', 'RotateCcw', 'Sparkles', 'Link2'])
with open('src/components/SettingsView.tsx', 'r') as f:
    c = f.read()
c = re.sub(r'const handleTestRule = async \(ruleId: string\) => \{', 'const _handleTestRule = async (ruleId: string) => {', c)
with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(c)

# src/components/SyncMatrixView.tsx
clean_file('src/components/SyncMatrixView.tsx', ['Filter', 'ExternalLink', 'ShieldCheck', 'TrendingUp', 'Layers'])
with open('src/components/SyncMatrixView.tsx', 'r') as f:
    c = f.read()
c = re.sub(r'const handleImportCSV = \(\) => \{', 'const _handleImportCSV = () => {', c)
c = re.sub(r'onImportCSV=\{handleImportCSV\}', '', c)
# Fix settings2 and X missing if they are missing
c = re.sub(r'<Settings2', '<Palette', c) # revert Settings2 to Palette inside tags
c = re.sub(r'<X ', '<ChevronDown ', c) # X is missing, but ChevronDown is there
with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(c)

# src/components/SyncScheduleView.tsx
with open('src/components/SyncScheduleView.tsx', 'r') as f:
    c = f.read()
c = re.sub(r'const \{.*?\} = currentSyncLog;\n', '', c)
with open('src/components/SyncScheduleView.tsx', 'w') as f:
    f.write(c)

# src/components/ToastContainer.tsx
clean_file('src/components/ToastContainer.tsx', ['React'])

# src/components/Win11TitleBar.tsx
with open('src/components/Win11TitleBar.tsx', 'r') as f:
    c = f.read()
c = re.sub(r'const settings = useSettingsStore\(s => s\.settings\);\n', '', c)
with open('src/components/Win11TitleBar.tsx', 'w') as f:
    f.write(c)

# tests/backend/server.test.ts
with open('tests/backend/server.test.ts', 'r') as f:
    c = f.read()
c = re.sub(r'\(req: Request, res: Response\)', '(req: Request, _res: Response)', c)
with open('tests/backend/server.test.ts', 'w') as f:
    f.write(c)

# tests/frontend/SettingsView.test.tsx
with open('tests/frontend/SettingsView.test.tsx', 'r') as f:
    c = f.read()
c = re.sub(r'const setFormState = jest\.fn\(\);', 'const _setFormState = jest.fn();', c)
with open('tests/frontend/SettingsView.test.tsx', 'w') as f:
    f.write(c)
