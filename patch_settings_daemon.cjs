const fs = require('fs');
const file = 'src/components/SettingsView.tsx';
let content = fs.readFileSync(file, 'utf8');

const scrobbleRulesUI = `
          {/* Scrobbler Player Rules */}
          {formState.daemonSettings?.enableLocalMediaDetection && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-neutral-800">
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">Detected Media Players</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Enable or disable scrobbling for specific players, and configure rule overrides.
              </p>
              
              <div className="bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-neutral-800 rounded-xl p-4 space-y-4">
                {/* Example MPC-BE Instance */}
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                        <Tv className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <span className="block text-gray-800 dark:text-gray-200 font-semibold text-sm">MPC-BE (Local Player)</span>
                        <span className="text-[10px] text-emerald-500 font-medium">Poller Active • Port 13579</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        const currentRules = formState.daemonSettings?.scrobbleRules || {};
                        const playerRule = currentRules['MPC-BE'] || { enabled: true, ignorePaths: [], completionThreshold: 0.8 };
                        setFormState(prev => ({
                          ...prev,
                          daemonSettings: {
                            ...prev.daemonSettings!,
                            scrobbleRules: {
                              ...currentRules,
                              'MPC-BE': { ...playerRule, enabled: !playerRule.enabled }
                            }
                          }
                        }));
                      }}
                      className={\`w-12 h-6 rounded-full transition-colors relative \${(formState.daemonSettings?.scrobbleRules?.['MPC-BE']?.enabled ?? true) ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}\`}
                    >
                      <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform \${(formState.daemonSettings?.scrobbleRules?.['MPC-BE']?.enabled ?? true) ? 'translate-x-7' : 'translate-x-1'}\`} />
                    </button>
                  </div>
                  
                  {(formState.daemonSettings?.scrobbleRules?.['MPC-BE']?.enabled ?? true) && (
                    <div className="pl-10 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ignore Paths (Comma separated)</label>
                        <input 
                          type="text"
                          placeholder="e.g. C:\\Downloads, D:\\Private"
                          value={(formState.daemonSettings?.scrobbleRules?.['MPC-BE']?.ignorePaths || []).join(', ')}
                          onChange={(e) => {
                            const paths = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            const currentRules = formState.daemonSettings?.scrobbleRules || {};
                            const playerRule = currentRules['MPC-BE'] || { enabled: true, ignorePaths: [], completionThreshold: 0.8 };
                            setFormState(prev => ({
                              ...prev,
                              daemonSettings: {
                                ...prev.daemonSettings!,
                                scrobbleRules: {
                                  ...currentRules,
                                  'MPC-BE': { ...playerRule, ignorePaths: paths }
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
                          value={formState.daemonSettings?.scrobbleRules?.['MPC-BE']?.completionThreshold ?? 0.8}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0.8;
                            const currentRules = formState.daemonSettings?.scrobbleRules || {};
                            const playerRule = currentRules['MPC-BE'] || { enabled: true, ignorePaths: [], completionThreshold: 0.8 };
                            setFormState(prev => ({
                              ...prev,
                              daemonSettings: {
                                ...prev.daemonSettings!,
                                scrobbleRules: {
                                  ...currentRules,
                                  'MPC-BE': { ...playerRule, completionThreshold: val }
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
              </div>
            </div>
          )}`;

const target = `<div className="bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 p-3 rounded-lg border border-blue-200/50 dark:border-blue-900/30">
            <span className="font-semibold block mb-1">Developer API</span>
            <span className="text-xs">Third-party plugins can POST playback data to <code className="bg-white dark:bg-black px-1 py-0.5 rounded text-blue-700 dark:text-blue-300">http://127.0.0.1:3000/api/daemon/report</code> with payload <code>{'{'} title, player, currentEpisode, totalEpisodes {'}'}</code> to trigger the prompt.</span>
          </div>`;
          
content = content.replace(target, target + '\n' + scrobbleRulesUI);

fs.writeFileSync(file, content);
console.log("Patched SettingsView.tsx");
