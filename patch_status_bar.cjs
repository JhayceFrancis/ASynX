const fs = require('fs');
let code = fs.readFileSync('src/components/Win11StatusBar.tsx', 'utf8');

const interfaceReplacement = `interface Win11StatusBarProps {
  itemCount: number;
  conflictCount: number;
  isSyncing: boolean;
  maintenanceMode?: boolean;
  onRefresh?: () => void;
  isOffline?: boolean;
}`;

code = code.replace(/interface Win11StatusBarProps \{[\s\S]*?\}/, interfaceReplacement);

const propsReplacement = `export const Win11StatusBar: React.FC<Win11StatusBarProps> = ({
  itemCount,
  conflictCount,
  isSyncing,
  maintenanceMode,
  onRefresh,
  isOffline
}) => {`;

code = code.replace(/export const Win11StatusBar: React\.FC<Win11StatusBarProps> = \(\{[\s\S]*?\}\) => \{/, propsReplacement);

const statusReplacement = `{isOffline ? (
              <Activity className="w-3.5 h-3.5 text-rose-400" />
            ) : isSyncing ? (
              <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            ) : (
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span className={isOffline ? "text-rose-500 font-bold" : ""}>Status: {isOffline ? 'Offline Mode' : isSyncing ? 'Syncing...' : 'Idle'}</span>`;

code = code.replace(/\{isSyncing \? \(\s*<Loader2 className="w-3\.5 h-3\.5 text-indigo-400 animate-spin" \/>\s*\) : \(\s*<Activity className="w-3\.5 h-3\.5 text-indigo-400" \/>\s*\)\}\s*<span>Status: \{isSyncing \? 'Syncing\.\.\.' : 'Idle'\}<\/span>/, statusReplacement);


fs.writeFileSync('src/components/Win11StatusBar.tsx', code);
