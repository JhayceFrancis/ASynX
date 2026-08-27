import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

# Add Zap to lucide-react imports if not there
if 'Zap' not in content:
    content = content.replace('RefreshCw, Radio', 'RefreshCw, Radio, Zap')

# Add onSaveSettings to NavbarProps
if 'onSaveSettings?: ' not in content:
    content = content.replace('isEditMode?: boolean;', 'isEditMode?: boolean;\n  onSaveSettings?: (settings: AppSettings) => Promise<void>;')
    content = content.replace('onToggleEditMode,\n  isCustomizePanelOpen', 'onToggleEditMode,\n  onSaveSettings,\n  isCustomizePanelOpen')

# Create quickSyncNode definition
quick_sync_def = """
  const toggleQuickSync = () => {
    if (onSaveSettings && settings) {
      onSaveSettings({
        ...settings,
        daemonSettings: {
          ...settings.daemonSettings,
          enableLocalMediaDetection: !settings.daemonSettings?.enableLocalMediaDetection
        }
      });
    }
  };

  const quickSyncEnabled = settings?.daemonSettings?.enableLocalMediaDetection;

  const quickSyncNode = (
    <motion.div layoutId="quickSyncNode" className="flex items-center">
      <Tooltip title="Quick Sync Daemon" description={quickSyncEnabled ? "Background Auto-Sync Active. Click to pause." : "Background Auto-Sync Paused. Click to resume."} position="bottom-right">
        <button 
          onClick={toggleQuickSync}
          className={`relative flex items-center justify-center p-1.5 rounded-xl transition cursor-pointer border ${quickSyncEnabled ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/20' : 'bg-gray-100/50 dark:bg-[#111]/50 border-gray-300/50 dark:border-neutral-800/50 text-gray-500 dark:text-gray-400 hover:text-cyan-500'}`}
        >
          <Zap className={`w-4 h-4 ${quickSyncEnabled ? 'fill-current animate-pulse' : ''}`} />
          {!isScrolled && (
            <span className="ml-1.5 text-xs font-semibold whitespace-nowrap overflow-hidden">
              {quickSyncEnabled ? 'Active' : 'Paused'}
            </span>
          )}
        </button>
      </Tooltip>
    </motion.div>
  );

  const themeToggleNode"""

content = content.replace('  const themeToggleNode', quick_sync_def)

# Replace the duplicated blocks in Navbar.tsx
# Top right
content = content.replace('{themeToggleNode}\n                {syncButtonNode}', '{quickSyncNode}\n                {themeToggleNode}\n                {syncButtonNode}')

content = content.replace('{themeToggleNode}\n              {syncButtonNode}', '{quickSyncNode}\n              {themeToggleNode}\n              {syncButtonNode}')

# Remove from the bottom bar
bottom_bar_block = """            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-300 dark:border-neutral-700">
              {quickSyncNode}
              {themeToggleNode}
              {syncButtonNode}
            </div>"""

if bottom_bar_block in content:
    content = content.replace(bottom_bar_block, "")
else:
    # try old
    old_bottom_bar = """            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-300 dark:border-neutral-700">
              {themeToggleNode}
              {syncButtonNode}
            </div>"""
    # this will match both the dropped header block AND the bottom tab bar block.
    # We only want to remove the SECOND one.
    parts = content.split(old_bottom_bar)
    if len(parts) == 3: # 2 occurrences
        content = parts[0] + """            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-300 dark:border-neutral-700">
              {quickSyncNode}
              {themeToggleNode}
              {syncButtonNode}
            </div>""" + parts[1] + parts[2]


with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
print("Successfully patched Navbar.tsx")
