const fs = require('fs');
const file = 'src/components/Win11StatusBar.tsx';
let content = fs.readFileSync(file, 'utf8');

// add onTogglePause to props
content = content.replace(
  'onToggleTerminal?: () => void;\n  queuedActionsCount?: number;\n}',
  'onToggleTerminal?: () => void;\n  queuedActionsCount?: number;\n  onTogglePause?: () => void;\n}'
);

content = content.replace(
  'queuedActionsCount = 0\n}) => {',
  'queuedActionsCount = 0,\n  onTogglePause\n}) => {'
);

// replace right side span with button
const oldMaintenance = `{maintenanceMode ? (
          <Tooltip title="Maintenance Override" description="All automatic webhooks and local media detection are currently paused. Click to resume." position="top">
            <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 text-[10px] font-semibold flex items-center space-x-1 animate-pulse cursor-help">`;
// It says 'MAINTENANCE MODE ACTIVE' in the file, let's use regex

const rightRegex = /\{maintenanceMode \? \([\s\S]*?MAINTENANCE MODE ACTIVE[\s\S]*?<\/span>\s*<\/Tooltip>\s*\) : \([\s\S]*?Plex \& Tautulli Daemons Active[\s\S]*?<\/span>\s*<\/Tooltip>\s*\)\}/;
const newRight = `{maintenanceMode ? (
          <Tooltip title="Global Pause Active" description="All automatic webhooks and queue processing are suspended. Click to resume." position="top">
            <button onClick={onTogglePause} className="px-2 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/20 text-[10px] font-semibold flex items-center space-x-1 transition-colors">
              <ShieldCheck className="w-3 h-3 animate-pulse" />
              <span>GLOBAL PAUSE</span>
            </button>
          </Tooltip>
        ) : (
          <Tooltip title="Daemons Active" description="Background sync webhooks and queue processing are active. Click to pause." position="top">
            <button onClick={onTogglePause} className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center space-x-1 transition-colors">
              <ShieldCheck className="w-3 h-3" />
              <span>ACTIVE DAEMONS</span>
            </button>
          </Tooltip>
        )}`;
content = content.replace(rightRegex, newRight);

fs.writeFileSync(file, content);
console.log("Patched Win11StatusBar.tsx");
