import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

rules_old = """              {formState.syncRules?.scheduledRules?.map((rule, idx) => (
                <div key={rule.id} className="flex items-center space-x-2 bg-gray-50 dark:bg-neutral-900/50 p-2 rounded-xl">
                  <select 
                    value={rule.source}
                    onChange={(e) => {
                      const newRules = [...formState.syncRules.scheduledRules!];
                      newRules[idx].source = e.target.value;
                      setFormState({ ...formState, syncRules: { ...formState.syncRules, presetProfile: 'custom', scheduledRules: newRules } as any });
                    }}
                    className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 rounded-lg px-2 py-1 text-xs"
                  >
                    <option value="simkl">Simkl</option>
                    <option value="anilist">AniList</option>
                    <option value="mal">MyAnimeList</option>
                    <option value="plex">Plex</option>
                    <option value="jellyfin">Jellyfin</option>
                    <option value="emby">Emby</option>
                  </select>
                  <span className="text-gray-400 text-xs">→</span>
                  <select 
                    value={rule.target}
                    onChange={(e) => {
                      const newRules = [...formState.syncRules.scheduledRules!];
                      newRules[idx].target = e.target.value;
                      setFormState({ ...formState, syncRules: { ...formState.syncRules, presetProfile: 'custom', scheduledRules: newRules } as any });
                    }}
                    className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 rounded-lg px-2 py-1 text-xs"
                  >
                    <option value="simkl">Simkl</option>
                    <option value="anilist">AniList</option>
                    <option value="mal">MyAnimeList</option>
                    <option value="plex">Plex</option>
                    <option value="jellyfin">Jellyfin</option>
                    <option value="emby">Emby</option>
                  </select>
                  <span className="text-gray-400 text-xs">at</span>
                  <input 
                    type="time" 
                    value={rule.time}
                    onChange={(e) => {
                      const newRules = [...formState.syncRules.scheduledRules!];
                      newRules[idx].time = e.target.value;
                      setFormState({ ...formState, syncRules: { ...formState.syncRules, presetProfile: 'custom', scheduledRules: newRules } as any });
                    }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 rounded-lg px-2 py-1 text-xs"
                  />
                  <button 
                    onClick={() => {
                      const newRules = formState.syncRules.scheduledRules!.filter((_, i) => i !== idx);
                      setFormState({ ...formState, syncRules: { ...formState.syncRules, presetProfile: 'custom', scheduledRules: newRules } as any });
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}"""

rules_new = """              {formState.syncRules?.scheduledRules?.map((rule, idx) => (
                <div key={rule.id} className="flex flex-col space-y-2 bg-gray-50 dark:bg-neutral-900/50 p-3 rounded-xl border border-gray-200 dark:border-neutral-800">
                  <div className="flex items-center space-x-2">
                    <select 
                      value={rule.source}
                      onChange={(e) => {
                        const newRules = [...formState.syncRules.scheduledRules!];
                        newRules[idx].source = e.target.value;
                        setFormState({ ...formState, syncRules: { ...formState.syncRules, presetProfile: 'custom', scheduledRules: newRules } as any });
                      }}
                      className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 rounded-lg px-2 py-1 text-xs"
                    >
                      <option value="simkl">Simkl</option>
                      <option value="anilist">AniList</option>
                      <option value="mal">MyAnimeList</option>
                      <option value="plex">Plex</option>
                      <option value="jellyfin">Jellyfin</option>
                      <option value="emby">Emby</option>
                    </select>
                    <span className="text-gray-400 text-xs">→</span>
                    <select 
                      value={rule.target}
                      onChange={(e) => {
                        const newRules = [...formState.syncRules.scheduledRules!];
                        newRules[idx].target = e.target.value;
                        setFormState({ ...formState, syncRules: { ...formState.syncRules, presetProfile: 'custom', scheduledRules: newRules } as any });
                      }}
                      className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 rounded-lg px-2 py-1 text-xs"
                    >
                      <option value="simkl">Simkl</option>
                      <option value="anilist">AniList</option>
                      <option value="mal">MyAnimeList</option>
                      <option value="plex">Plex</option>
                      <option value="jellyfin">Jellyfin</option>
                      <option value="emby">Emby</option>
                    </select>
                    <span className="text-gray-400 text-xs">at</span>
                    <input 
                      type="time" 
                      value={rule.time}
                      onChange={(e) => {
                        const newRules = [...formState.syncRules.scheduledRules!];
                        newRules[idx].time = e.target.value;
                        setFormState({ ...formState, syncRules: { ...formState.syncRules, presetProfile: 'custom', scheduledRules: newRules } as any });
                      }}
                      className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 rounded-lg px-2 py-1 text-xs w-24"
                    />
                    <button
                      onClick={() => handleTestRule(rule.id, rule.source, rule.target)}
                      className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-1.5 rounded-md transition-colors"
                      title="Test Connection Handshake"
                      disabled={testingRuleId === rule.id}
                    >
                      {testingRuleId === rule.id ? (
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Activity className="w-4 h-4" />
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        const newRules = formState.syncRules.scheduledRules!.filter((_, i) => i !== idx);
                        setFormState({ ...formState, syncRules: { ...formState.syncRules, presetProfile: 'custom', scheduledRules: newRules } as any });
                      }}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-md transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Test Result / SyncRuleMap Visualizer */}
                  {testResults[rule.id] && (
                    <div className="mt-2 bg-white dark:bg-[#0a0a0a] rounded-lg border border-indigo-100 dark:border-indigo-900/30 p-3 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">SyncRuleMap Validator</span>
                        {testResults[rule.id].success ? (
                           <div className="flex items-center text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                             <CheckCircle2 className="w-3 h-3 mr-1" /> Handshake OK
                           </div>
                        ) : (
                           <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Failed</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[10px] sm:text-xs">
                        <div>
                           <span className="font-medium text-gray-500 dark:text-gray-400 block mb-1">Payload Request</span>
                           <pre className="bg-gray-50 dark:bg-neutral-900 p-2 rounded text-[10px] overflow-x-auto text-gray-700 dark:text-gray-300 custom-scrollbar border border-gray-200 dark:border-neutral-800">
{JSON.stringify(testResults[rule.id].payload, null, 2)}
                           </pre>
                        </div>
                        <div>
                           <span className="font-medium text-gray-500 dark:text-gray-400 block mb-1">Response Output</span>
                           <pre className="bg-gray-50 dark:bg-neutral-900 p-2 rounded text-[10px] overflow-x-auto text-gray-700 dark:text-gray-300 custom-scrollbar border border-gray-200 dark:border-neutral-800">
{JSON.stringify(testResults[rule.id].response || testResults[rule.id].error, null, 2)}
                           </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}"""

content = content.replace(rules_old, rules_new)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
