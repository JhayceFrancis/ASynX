import re

def process_imports(content, unused):
    for u in unused:
        # Matches import { ..., U, ... } from '...'
        # or import U from '...'
        # Let's just do a regex replace for the specific word in imports
        # Very simple: remove `U,` or `, U` or `U`
        pattern1 = r',\s*' + u + r'\b'
        pattern2 = r'\b' + u + r'\s*,'
        pattern3 = r'\{\s*' + u + r'\s*\}'
        
        # We only apply this on lines starting with import
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('import '):
                line = re.sub(pattern1, '', line)
                line = re.sub(pattern2, '', line)
                line = re.sub(pattern3, '', line)
                # if import {} from 'x', remove the line
                if re.search(r'import\s*\{\s*\}\s*from', line):
                    line = ''
                # if import from 'x' without anything, remove the line
                if re.search(r'import\s+from', line):
                    line = ''
                lines[i] = line
        content = '\n'.join([l for l in lines if l is not None])
    return content

files = {
    'src/components/SettingsView.tsx': ['PlatformType', 'ASynXLogo', 'Cloud', 'Palette', 'Key', 'RotateCcw', 'Sparkles', 'Link2', 'testingRuleId', 'testResults', 'handleTestRule'],
    'src/components/SyncMatrixView.tsx': ['Filter', 'ExternalLink', 'ShieldCheck', 'TrendingUp', 'Layers', 'Bell', 'ResponsiveGridLayout', 'onImportCSV', 'notifications', 'handleLayoutChange'],
    'src/components/SyncPerformanceView.tsx': ['AreaChart', 'BarChart'],
    'src/components/SystemHealthView.tsx': ['Activity', 'motion', 'index'],
    'src/components/PlexWebhookView.tsx': ['Tv', 'FileText', 'Search', 'ArrowRight', 'Code', 'CheckCircle2', 'XCircle', 'setCopiedKarakeep', 'setTestDevice'],
    'src/components/Navbar.tsx': ['Radio', 'ShieldAlert', 'Cpu', 'CheckCircle2', 'Monitor', 'ExternalLink', 'extensionState', 'themeToggleNode'],
    'src/components/GridLayoutEngine.tsx': ['useEffect', 'Type', 'Layout', 'allLayouts'],
    'src/components/DockerBackendView.tsx': ['React', 'Server', 'MemoryStick', 'ArrowRight', 'Square', 'Tooltip'],
    'src/components/Win11TitleBar.tsx': ['RefreshCw', 'Layers', 'Shield', 'settings', 'setActiveTab'],
    'src/components/ExtensionCompanionView.tsx': ['Compass', 'Pause', 'ExternalLink', 'Radio', 'RefreshCw'],
    'src/components/ConflictResolutionView.tsx': ['Layers'],
    'src/components/DatabaseView.tsx': ['FileJson'],
    'src/components/PreImportModal.tsx': ['React', 'LibraryItem'],
    'src/components/ScrobblePrompt.tsx': ['React'],
    'src/components/ToastContainer.tsx': ['React'],
    'src/components/LogoBanner.tsx': ['AnimatePresence'],
    'src/components/OverrideModal.tsx': ['ShieldAlert', 'Sparkles'],
    'src/components/PlatformLogos.tsx': ['React'],
    'src/components/SyncScheduleView.tsx': ['RotateCw'],
}

for filepath, unused in files.items():
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = process_imports(content, unused)
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Done")
