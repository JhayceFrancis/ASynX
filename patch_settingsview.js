import fs from 'fs';

let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

// The block to remove:
const removeRegex = /\s*\{\/\* KaraKeep \*\/\}[\s\S]*?\{\/\* Emby \*\/\}/;

content = content.replace(removeRegex, '\n            {/* Emby */}');

// The place to insert it: right above {/* Section 4: Media Servers & Scrobbler */}
const section4Target = `{/* Section 4: Media Servers & Scrobbler */}`;

const karaKeepSection = `{/* Section 4: KaraKeep Tracker */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-3">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-pink-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">KaraKeep Integration</h3>
            </div>
            <button
              onClick={() => setFormState(prev => ({ ...prev, karakeep: { apiUrl: '', apiKey: '', webhookUrl: '', ...prev.karakeep, connected: !prev.karakeep?.connected } }))}
              className={\`w-10 h-5 rounded-full transition-colors relative \${formState.karakeep?.connected ? 'bg-pink-500' : 'bg-gray-200 dark:bg-gray-800'}\`}
            >
              <div className={\`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform \${formState.karakeep?.connected ? 'translate-x-5' : 'translate-x-0.5'}\`} />
            </button>
          </div>
          
          {formState.karakeep?.connected && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-2">
              <div>
                <label className="text-gray-600 dark:text-gray-400 font-medium">KaraKeep API URL</label>
                <input
                  type="text"
                  value={formState.karakeep.apiUrl || ''}
                  onChange={(e) => setFormState({
                    ...formState,
                    karakeep: { ...formState.karakeep, apiUrl: e.target.value }
                  })}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
                  placeholder="https://api.karakeep.com"
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
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-gray-600 dark:text-gray-400 font-medium flex items-center space-x-1">
                  <span>Generated Webhook URL (For ASynX Inbound)</span>
                  <span className="bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 px-1.5 py-0.5 rounded text-[10px] font-bold">READY</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={formState.karakeep.webhookUrl || \`http://localhost:3000/api/webhooks/karakeep\`}
                  className="w-full mt-1 bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-gray-500 dark:text-gray-400 cursor-not-allowed font-mono text-[10px]"
                />
                <p className="text-[10px] text-gray-400 mt-1">Provide this URL in your KaraKeep settings so ASynX can receive watch updates.</p>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Media Servers & Scrobbler */}`;

content = content.replace(section4Target, karaKeepSection);

content = content.replace("Media Servers & Custom Apps (Plex, Jellyfin, Emby, KaraKeep)", "Media Servers & Scrobblers (Plex, Jellyfin, Emby)");

fs.writeFileSync('src/components/SettingsView.tsx', content);
