const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const target = `<h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Theme & UI Customization</h3>
        </div>
        <div className="space-y-6">`;

const replacement = `<h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Theme & UI Customization</h3>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nexus Tab Name</label>
              <input
                type="text"
                placeholder="e.g., Nexus Bookmarks"
                value={formState.nexusTabName || ''}
                onChange={(e) => setFormState(prev => ({ ...prev, nexusTabName: e.target.value }))}
                className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/SettingsView.tsx', content);
