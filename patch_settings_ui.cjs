const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

// Add Cloud icon
content = content.replace('Settings, Radio,', 'Settings, Radio, Cloud,');

const cloudBackupUI = `
      {/* Section 9: Automated Cloud Backups */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-3 gap-3">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Automated Cloud Backups</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={async () => {
                if (!formState.automatedBackups?.enabled) {
                   alert("Please enable backups first.");
                   return;
                }
                try {
                  const res = await fetch('/api/backups/run', { method: 'POST' });
                  const data = await res.json();
                  if (data.success) {
                    setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, lastBackup: data.lastBackup } }));
                    alert(data.message);
                  } else {
                    alert(data.error || 'Backup failed');
                  }
                } catch (err) {
                  alert("Network error.");
                }
              }}
              className="px-3 py-1.5 bg-indigo-600/20 text-indigo-500 hover:bg-indigo-600/30 rounded-lg text-xs font-semibold transition"
            >
              Run Backup Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-gray-800 dark:text-gray-200 font-semibold">Enable Automated Backups</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Regularly push an encrypted snapshot to your preferred cloud.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const isEnabled = formState.automatedBackups?.enabled || false;
                setFormState(prev => ({ 
                  ...prev, 
                  automatedBackups: { 
                    ...(prev.automatedBackups || { provider: 'github_gist', frequency: 'weekly', token: '', targetId: '' }),
                    enabled: !isEnabled 
                  } 
                }));
              }}
              className={\`w-12 h-6 rounded-full transition-colors relative \${formState.automatedBackups?.enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}\`}
            >
              <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform \${formState.automatedBackups?.enabled ? 'translate-x-7' : 'translate-x-1'}\`} />
            </button>
          </div>
          
          {formState.automatedBackups?.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Provider</label>
                <select
                  value={formState.automatedBackups.provider}
                  onChange={(e) => setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, provider: e.target.value as any } }))}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  <option value="github_gist">GitHub Private Gist</option>
                  <option value="github_repo">GitHub Private Repo</option>
                  <option value="gdrive">Google Drive</option>
                  <option value="onedrive">OneDrive</option>
                </select>
              </div>
              
              <div>
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Frequency</label>
                <select
                  value={formState.automatedBackups.frequency}
                  onChange={(e) => setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, frequency: e.target.value as any } }))}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly (Default)</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Auth Token (Personal Access Token / OAuth Refresh Token)</label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={formState.automatedBackups.token || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, token: e.target.value } }))}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Target ID (Gist ID, Repo Name, or Folder ID)</label>
                <input
                  type="text"
                  placeholder="Leave blank to create new (Gist only)"
                  value={formState.automatedBackups.targetId || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, targetId: e.target.value } }))}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Last Backup</label>
                <div className="mt-1 text-xs text-gray-800 dark:text-gray-200 font-mono">
                  {formState.automatedBackups?.lastBackup ? new Date(formState.automatedBackups.lastBackup).toLocaleString() : 'Never'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
`;

content = content.replace('    </form>', cloudBackupUI + '\n    </form>');
fs.writeFileSync('src/components/SettingsView.tsx', content);
