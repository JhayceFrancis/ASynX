const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const embyBlockEnd = `                  </div>
                </div>
              )}
            </div>`;

const karakeepBlock = `            {/* KaraKeep */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-1 mt-6">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">KaraKeep (Webhooks & API)</h4>
                <button
                  onClick={() => setFormState(prev => ({ ...prev, karakeep: { apiUrl: '', apiKey: '', webhookUrl: '', ...prev.karakeep, connected: !prev.karakeep?.connected } }))}
                  className={\`w-8 h-4 rounded-full transition-colors relative \${formState.karakeep?.connected ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}\`}
                >
                  <div className={\`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform \${formState.karakeep?.connected ? 'translate-x-4' : 'translate-x-0.5'}\`} />
                </button>
              </div>
              
              {formState.karakeep?.connected && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-600 dark:text-gray-400 font-medium">KaraKeep API URL</label>
                    <input
                      type="text"
                      value={formState.karakeep.apiUrl || ''}
                      onChange={(e) => setFormState({
                        ...formState,
                        karakeep: { ...formState.karakeep, apiUrl: e.target.value }
                      })}
                      className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 dark:text-gray-400 font-medium">API Key</label>
                    <input
                      type="password"
                      value={formState.karakeep.apiKey || ''}
                      onChange={(e) => setFormState({
                        ...formState,
                        karakeep: { ...formState.karakeep, apiKey: e.target.value }
                      })}
                      className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-gray-600 dark:text-gray-400 font-medium flex items-center space-x-1">
                      <span>Generated Webhook URL</span>
                      <span className="bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 px-1.5 py-0.5 rounded text-[10px] font-bold">READY</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formState.karakeep.webhookUrl || \`http://localhost:3000/api/webhooks/karakeep\`}
                      className="w-full mt-1 bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-gray-500 dark:text-gray-400 cursor-not-allowed font-mono text-[10px]"
                    />
                  </div>
                </div>
              )}
            </div>`;

// Find the end of the Emby block (approx line 660) and insert KaraKeep block
code = code.replace(
  /                  <\/div>\n                <\/div>\n              \)}\n            <\/div>/,
  `                  </div>\n                </div>\n              )}\n            </div>\n\n${karakeepBlock}`
);

fs.writeFileSync('src/components/SettingsView.tsx', code);
console.log("Added KaraKeep to SettingsView");
