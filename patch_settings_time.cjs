const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

// Replace the mode selector and time input with a single interval selector that has expanded options
const oldBlock = `
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>
`;

// Wait, the regex might be tricky. Let's just use string replacement carefully.
const newBlock = `
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <option value="interval">Fixed Interval (Frequency)</option>
                <option value="specific_time">Specific Time of Day</option>
              </select>
            </div>
            
            {(formState.syncRules.syncScheduleMode === 'specific_time') ? (
              <div>
                <label className="text-gray-600 dark:text-gray-400 font-medium">Specific Time of Day</label>
                <select
                  value={formState.syncRules.syncSpecificTime || '03:00'}
                  onChange={(e) => setFormState({
                    ...formState,
                    syncRules: { ...formState.syncRules, syncSpecificTime: e.target.value }
                  })}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  {Array.from({ length: 48 }).map((_, i) => {
                    const hours = Math.floor(i / 2).toString().padStart(2, '0');
                    const mins = (i % 2 === 0) ? '00' : '30';
                    const time = \`\${hours}:\${mins}\`;
                    return <option key={time} value={time}>{time}</option>;
                  })}
                </select>
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
                  <option value={15}>Every 15 Minutes</option>
                  <option value={30}>Every 30 Minutes</option>
                  <option value={60}>Every Hour</option>
                  <option value={120}>Every 2 Hours</option>
                  <option value={240}>Every 4 Hours</option>
                  <option value={360}>Every 6 Hours</option>
                  <option value={720}>Every 12 Hours</option>
                  <option value={1440}>Every 24 Hours</option>
                </select>
              </div>
            )}
          </div>
`;

// Find index to replace
const startIndex = code.indexOf('<div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">');
if (startIndex !== -1) {
  const endIndex = code.indexOf('</div>', code.indexOf('</select>', code.indexOf('</select>', startIndex) + 1) + 1) + 7;
  // wait, finding the end correctly is hard. I'll just use my original exact string replacement logic.
}

let codeModified = code.replace(oldBlock.trim(), newBlock.trim());
if(code === codeModified) {
  console.log("Failed to replace");
} else {
  fs.writeFileSync('src/components/SettingsView.tsx', codeModified);
  console.log("Successfully replaced");
}
