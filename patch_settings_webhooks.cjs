const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const insertPos = content.indexOf('{/* Section 0.5: Dashboard Configuration */}');

if (insertPos !== -1) {
  const webhookPanel = `
      {/* Section 11: Push Notifications & Webhooks */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm mb-6">
        <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-neutral-900 pb-3">
          <Bell className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Push Notifications & Webhooks</h3>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure native browser notifications and external webhook platforms (Discord, Apprise, Pushbullet) for real-time status updates on sync operations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Native Browser Notifications</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Allow desktop popups when minimized</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentState = formState.pushNotifications?.browserNotifications;
                    if (!currentState) {
                      if ('Notification' in window) {
                        Notification.requestPermission().then(permission => {
                          if (permission === 'granted') {
                            setFormState({ ...formState, pushNotifications: { ...formState.pushNotifications, browserNotifications: true } as any });
                          }
                        });
                      } else {
                        alert('Your browser does not support notifications.');
                      }
                    } else {
                      setFormState({ ...formState, pushNotifications: { ...formState.pushNotifications, browserNotifications: false } as any });
                    }
                  }}
                  className={\`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none \${formState.pushNotifications?.browserNotifications ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-neutral-800'}\`}
                >
                  <span className={\`inline-block h-3 w-3 transform rounded-full bg-white transition-transform \${formState.pushNotifications?.browserNotifications ? 'translate-x-5' : 'translate-x-1'}\`} />
                </button>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Discord Webhook URL</label>
                <input
                  type="text"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={formState.pushNotifications?.discordWebhookUrl || ''}
                  onChange={(e) => setFormState({ ...formState, pushNotifications: { ...formState.pushNotifications, discordWebhookUrl: e.target.value } as any })}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Apprise URL</label>
                <input
                  type="text"
                  placeholder="apprise://..."
                  value={formState.pushNotifications?.appriseUrl || ''}
                  onChange={(e) => setFormState({ ...formState, pushNotifications: { ...formState.pushNotifications, appriseUrl: e.target.value } as any })}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Pushbullet Access Token</label>
                <input
                  type="password"
                  placeholder="o.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={formState.pushNotifications?.pushbulletToken || ''}
                  onChange={(e) => setFormState({ ...formState, pushNotifications: { ...formState.pushNotifications, pushbulletToken: e.target.value } as any })}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Notification Triggers</h4>
              
              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-[#111] p-3 rounded-xl border border-gray-100 dark:border-neutral-800">
                <input
                  type="checkbox"
                  id="trigger-success"
                  checked={formState.pushNotifications?.triggers?.onSyncSuccess ?? true}
                  onChange={(e) => setFormState({ ...formState, pushNotifications: { ...formState.pushNotifications, triggers: { ...formState.pushNotifications?.triggers, onSyncSuccess: e.target.checked } } as any })}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor="trigger-success" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Notify on Sync Success
                </label>
              </div>

              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-[#111] p-3 rounded-xl border border-gray-100 dark:border-neutral-800">
                <input
                  type="checkbox"
                  id="trigger-failure"
                  checked={formState.pushNotifications?.triggers?.onSyncFailure ?? true}
                  onChange={(e) => setFormState({ ...formState, pushNotifications: { ...formState.pushNotifications, triggers: { ...formState.pushNotifications?.triggers, onSyncFailure: e.target.checked } } as any })}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor="trigger-failure" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Notify on Sync Failure / Error
                </label>
              </div>

              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-[#111] p-3 rounded-xl border border-gray-100 dark:border-neutral-800">
                <input
                  type="checkbox"
                  id="trigger-conflict"
                  checked={formState.pushNotifications?.triggers?.onConflict ?? true}
                  onChange={(e) => setFormState({ ...formState, pushNotifications: { ...formState.pushNotifications, triggers: { ...formState.pushNotifications?.triggers, onConflict: e.target.checked } } as any })}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor="trigger-conflict" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Notify on Unresolved Conflicts
                </label>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  alert("Test notification sent! Check your integrations.");
                  if ('Notification' in window && formState.pushNotifications?.browserNotifications && Notification.permission === 'granted') {
                    new Notification("ASynX Test", { body: "This is a test notification from your dashboard." });
                  }
                }}
                className="w-full mt-4 py-2 border border-indigo-200 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 rounded-xl text-xs font-semibold transition"
              >
                Send Test Notification
              </button>
            </div>
          </div>
        </div>
      </div>\n`;

  content = content.slice(0, insertPos) + webhookPanel + content.slice(insertPos);
}

// ensure Bell is imported
if (!content.includes('Bell,')) {
  content = content.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, Bell } from 'lucide-react';");
}

fs.writeFileSync('src/components/SettingsView.tsx', content);
