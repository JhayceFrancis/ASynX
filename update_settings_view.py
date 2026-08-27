import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# Import Trash2
if "Trash2" not in content:
    content = content.replace("Keyboard", "Keyboard,\n  Trash2")

# Apply Profile Logic
apply_profile_logic = """
  const handleConnect = (provider: string) => {
"""
apply_profile_logic_new = """
  const applyProfile = (profile: 'aggressive' | 'manual' | 'hybrid') => {
    let rules = { ...formState.syncRules, presetProfile: profile } as any;
    if (profile === 'aggressive') {
      rules.conflictPolicy = 'highest_episode';
      rules.autoResolveWithAI = true;
      rules.syncDramasFromSimklToMAL = true;
    } else if (profile === 'manual') {
      rules.conflictPolicy = 'ask_user';
      rules.autoResolveWithAI = false;
    } else if (profile === 'hybrid') {
      rules.conflictPolicy = 'source_of_truth';
      rules.autoResolveWithAI = true;
      rules.syncDramasFromSimklToMAL = false;
    }
    setFormState(prev => ({ ...prev, syncRules: rules }));
  };

  const handleConnect = (provider: string) => {
"""
content = content.replace(apply_profile_logic, apply_profile_logic_new)

# Add UI Elements
matrix_header = """<div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-neutral-900 pb-3">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Matrix Sync Engine Rules & Defaults</h3>
        </div>"""

new_ui = """<div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-neutral-900 pb-3">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Matrix Sync Engine Rules & Defaults</h3>
        </div>

        {/* Preset Profiles */}
        <div className="mb-6 border-b border-gray-100 dark:border-neutral-800 pb-6">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Sync Strategy Profile</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
             <button onClick={() => applyProfile('aggressive')} className={`p-3 text-left rounded-xl border ${formState.syncRules?.presetProfile === 'aggressive' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900'}`}>
               <div className="font-medium text-sm">Aggressive Auto-Sync</div>
               <div className="text-xs text-gray-500 mt-1">Trusts highest episode, auto-resolves with AI.</div>
             </button>
             <button onClick={() => applyProfile('manual')} className={`p-3 text-left rounded-xl border ${formState.syncRules?.presetProfile === 'manual' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900'}`}>
               <div className="font-medium text-sm">Manual Verification Only</div>
               <div className="text-xs text-gray-500 mt-1">Flags all conflicts for manual review.</div>
             </button>
             <button onClick={() => applyProfile('hybrid')} className={`p-3 text-left rounded-xl border ${formState.syncRules?.presetProfile === 'hybrid' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900'}`}>
               <div className="font-medium text-sm">Hybrid Mode</div>
               <div className="text-xs text-gray-500 mt-1">Balanced approach, respects source of truth.</div>
             </button>
             <button onClick={() => setFormState(prev => ({ ...prev, syncRules: { ...prev.syncRules, presetProfile: 'custom' } as any }))} className={`p-3 text-left rounded-xl border ${formState.syncRules?.presetProfile === 'custom' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900'}`}>
               <div className="font-medium text-sm">Custom</div>
               <div className="text-xs text-gray-500 mt-1">Fine-tune all settings manually.</div>
             </button>
          </div>
        </div>"""

content = content.replace(matrix_header, new_ui)

custom_schedules = """          {/* Custom Scheduled Syncs */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-neutral-800 sm:col-span-2 lg:col-span-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Scheduled Sync Routes</h4>
              <button 
                onClick={() => {
                  const newRules = [...(formState.syncRules.scheduledRules || [])];
                  newRules.push({
                    id: Math.random().toString(36).substr(2, 9),
                    source: 'simkl',
                    target: 'plex',
                    time: '01:00',
                    enabled: true
                  });
                  setFormState({ ...formState, syncRules: { ...formState.syncRules, presetProfile: 'custom', scheduledRules: newRules } as any });
                }}
                className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
              >
                + Add Schedule
              </button>
            </div>
            
            <div className="space-y-3">
              {(formState.syncRules.scheduledRules || []).map((rule, idx) => (
                <div key={rule.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl flex-wrap sm:flex-nowrap">
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
              ))}
              {(!formState.syncRules.scheduledRules || formState.syncRules.scheduledRules.length === 0) && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl">
                  No scheduled routes configured.
                </div>
              )}
            </div>
          </div>"""

content = content.replace('</select>\n          </div>\n        </div>\n      </div>\n      {/* Section 8:', '</select>\n          </div>\n' + custom_schedules + '\n        </div>\n      </div>\n      {/* Section 8:')

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
