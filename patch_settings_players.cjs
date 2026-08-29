const fs = require('fs');
const file = 'src/components/SettingsView.tsx';
let content = fs.readFileSync(file, 'utf8');

const scanLogic = `
  const [activePlayer, setActivePlayer] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);

  const scanForPlayers = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/daemon/status');
      const data = await res.json();
      setActivePlayer(data.activePlayer);
    } catch (e) {
      console.error(e);
    }
    setIsScanning(false);
  };
`;

if (!content.includes('scanForPlayers')) {
  content = content.replace('const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);', 'const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);\n' + scanLogic);
}

// Now replace the MPC-BE example with a dynamic list of players
const newPlayersUI = `
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enable or disable scrobbling for specific players, and configure rule overrides.
                </p>
                <button 
                  onClick={scanForPlayers}
                  disabled={isScanning}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg transition flex items-center space-x-1"
                >
                  <Activity className={\`w-3.5 h-3.5 \${isScanning ? 'animate-spin' : ''}\`} />
                  <span>{isScanning ? 'Scanning...' : 'Scan Active Players'}</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {['MPC-BE', 'VLC', 'MPV'].map(player => (
                  <div key={player} className={\`bg-gray-50 dark:bg-black/50 border \${activePlayer === player ? 'border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.1)]' : 'border-gray-200 dark:border-neutral-800'} rounded-xl p-4 flex flex-col space-y-3 transition-all\`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                          <Tv className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <span className="block text-gray-800 dark:text-gray-200 font-semibold text-sm">{player} (Local Player)</span>
                          <span className={\`text-[10px] font-medium \${activePlayer === player ? 'text-emerald-500' : 'text-gray-400'}\`}>
                            {activePlayer === player ? 'Active Process Detected' : 'Process Not Running'}
                          </span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const currentRules = formState.daemonSettings?.scrobbleRules || {};
                          const playerRule = currentRules[player] || { enabled: true, ignorePaths: [], completionThreshold: 0.8 };
                          setFormState(prev => ({
                            ...prev,
                            daemonSettings: {
                              ...prev.daemonSettings!,
                              scrobbleRules: {
                                ...currentRules,
                                [player]: { ...playerRule, enabled: !playerRule.enabled }
                              }
                            }
                          }));
                        }}
                        className={\`w-10 h-5 rounded-full transition-colors relative \${(formState.daemonSettings?.scrobbleRules?.[player]?.enabled ?? true) ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}\`}
                      >
                        <div className={\`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform \${(formState.daemonSettings?.scrobbleRules?.[player]?.enabled ?? true) ? 'translate-x-6' : 'translate-x-1'}\`} />
                      </button>
                    </div>
                    
                    {(formState.daemonSettings?.scrobbleRules?.[player]?.enabled ?? true) && (
                      <div className="pl-10 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ignore Paths (Comma separated)</label>
                          <input 
                            type="text"
                            placeholder="e.g. C:\\Downloads, D:\\Private"
                            value={(formState.daemonSettings?.scrobbleRules?.[player]?.ignorePaths || []).join(', ')}
                            onChange={(e) => {
                              const paths = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              const currentRules = formState.daemonSettings?.scrobbleRules || {};
                              const playerRule = currentRules[player] || { enabled: true, ignorePaths: [], completionThreshold: 0.8 };
                              setFormState(prev => ({
                                ...prev,
                                daemonSettings: {
                                  ...prev.daemonSettings!,
                                  scrobbleRules: {
                                    ...currentRules,
                                    [player]: { ...playerRule, ignorePaths: paths }
                                  }
                                }
                              }));
                            }}
                            className="w-full text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Completion Threshold (0.0 to 1.0)</label>
                          <input 
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="1.0"
                            value={formState.daemonSettings?.scrobbleRules?.[player]?.completionThreshold ?? 0.8}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0.8;
                              const currentRules = formState.daemonSettings?.scrobbleRules || {};
                              const playerRule = currentRules[player] || { enabled: true, ignorePaths: [], completionThreshold: 0.8 };
                              setFormState(prev => ({
                                ...prev,
                                daemonSettings: {
                                  ...prev.daemonSettings!,
                                  scrobbleRules: {
                                    ...currentRules,
                                    [player]: { ...playerRule, completionThreshold: val }
                                  }
                                }
                              }));
                            }}
                            className="w-24 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
`;

// Replace the old UI
const oldRegex = /<p className="text-xs text-gray-500 dark:text-gray-400 mb-4">\s*Enable or disable scrobbling for specific players, and configure rule overrides\.\s*<\/p>[\s\S]*?(?=<\/div>\s*<\/div>\s*\}\s*\{\/\* Section 5)/;

content = content.replace(oldRegex, newPlayersUI + '\n            </div>\n          )}\n');

fs.writeFileSync(file, content);
console.log("Patched SettingsView.tsx for players");
