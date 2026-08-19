const fs = require('fs');

let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const regex = /<div>\s*<label className="text-gray-600 dark:text-gray-400 font-medium">Background Sync Frequency<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/;

const newSyncUI = `<div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-600 dark:text-gray-400 font-medium">Automated Sync Schedule Mode</label>
              <select
                value={formState.syncRules.syncScheduleMode || 'interval'}
                onChange={(e) => setFormState({
                  ...formState,
                  syncRules: { ...formState.syncRules, syncScheduleMode: e.target.value as 'interval' | 'specific_time' }
                })}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                <option value="interval">Fixed Interval (Minutes)</option>
                <option value="specific_time">Specific Time of Day</option>
              </select>
            </div>
            
            {(formState.syncRules.syncScheduleMode === 'specific_time') ? (
              <div>
                <label className="text-gray-600 dark:text-gray-400 font-medium">Specific Time of Day (24H)</label>
                <input
                  type="time"
                  value={formState.syncRules.syncSpecificTime || '03:00'}
                  onChange={(e) => setFormState({
                    ...formState,
                    syncRules: { ...formState.syncRules, syncSpecificTime: e.target.value }
                  })}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="text-gray-600 dark:text-gray-400 font-medium">Background Sync Frequency</label>
                <select
                  value={formState.syncRules.autoSyncIntervalMinutes}
                  onChange={(e) => setFormState({
                    ...formState,
                    syncRules: { ...formState.syncRules, autoSyncIntervalMinutes: Number(e.target.value) }
                  })}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  <option value={5}>Every 5 Minutes</option>
                  <option value={15}>Every 15 Minutes</option>
                  <option value={30}>Every 30 Minutes</option>
                  <option value={60}>Every Hour</option>
                  <option value={360}>Every 6 Hours</option>
                  <option value={720}>Every 12 Hours</option>
                </select>
              </div>
            )}
          </div>`;

if (code.match(regex)) {
  code = code.replace(regex, newSyncUI);
  fs.writeFileSync('src/components/SettingsView.tsx', code);
  console.log("Patched UI");
} else {
  console.log("Failed to match regex");
}
