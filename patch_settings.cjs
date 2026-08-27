const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const target = `      {/* Section 10: System Maintenance */}`;

const replacement = `      {/* Section 10: Database Management */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3 gap-3 relative z-10">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Database Management</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-gray-800 dark:text-gray-200 font-semibold">Auto-Purge Sync Logs</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Automatically delete sync logs older than the specified number of days to optimize application performance.</span>
            </div>
            <button 
              type="button"
              onClick={() => {
                setFormState(prev => ({ 
                  ...prev, 
                  databaseManagement: {
                    ...prev.databaseManagement,
                    autoPurgeSyncLogs: !(prev.databaseManagement?.autoPurgeSyncLogs ?? false)
                  }
                }));
              }}
              className={\`w-12 h-6 rounded-full transition-colors relative \${formState.databaseManagement?.autoPurgeSyncLogs ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-neutral-800'}\`}
            >
              <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform \${formState.databaseManagement?.autoPurgeSyncLogs ? 'translate-x-7' : 'translate-x-1'}\`} />
            </button>
          </div>
          
          {formState.databaseManagement?.autoPurgeSyncLogs && (
            <div className="flex items-center justify-between mt-2 pl-4 border-l-2 border-indigo-500">
              <div>
                <span className="block text-gray-800 dark:text-gray-200 font-semibold text-xs">Retention Period (Days)</span>
              </div>
              <input 
                type="number"
                min="1"
                max="365"
                value={formState.databaseManagement?.autoPurgeDays ?? 30}
                onChange={(e) => {
                  setFormState(prev => ({
                    ...prev,
                    databaseManagement: {
                      ...prev.databaseManagement,
                      autoPurgeDays: parseInt(e.target.value) || 30,
                      autoPurgeSyncLogs: prev.databaseManagement?.autoPurgeSyncLogs ?? false
                    }
                  }));
                }}
                className="w-20 text-xs bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Section 11: System Maintenance */}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/SettingsView.tsx', content);
