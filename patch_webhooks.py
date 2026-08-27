import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# 1. Plex
plex_old = '<h4 className="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-neutral-800 pb-1">Plex</h4>'
plex_new = """              <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-1">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Plex</h4>
                {formState.plex?.serverUrl && (
                  <button type="button" onClick={() => handleTestWebhook('plex', formState.plex.serverUrl)} className="text-[10px] text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2 py-1 rounded font-bold uppercase tracking-wider flex items-center transition">
                    {testingWebhookId === 'plex' ? <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
                    Test Handshake
                  </button>
                )}
              </div>
              {webhookTestResults['plex'] && (
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg p-3 border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Plex Connection Validator</span>
                    {webhookTestResults['plex'].success ? (
                       <span className="text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded font-bold uppercase flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Valid</span>
                    ) : (
                       <span className="text-[10px] text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded font-bold uppercase">Failed</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-[9px] uppercase text-gray-500 font-bold mb-1 block">Payload Request</span>
                      <pre className="bg-white dark:bg-black p-2 rounded border border-gray-100 dark:border-neutral-800 overflow-x-auto text-gray-600 dark:text-gray-400 custom-scrollbar">{JSON.stringify(webhookTestResults['plex'].payload, null, 2)}</pre>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-gray-500 font-bold mb-1 block">Response Output</span>
                      <pre className="bg-white dark:bg-black p-2 rounded border border-gray-100 dark:border-neutral-800 overflow-x-auto text-gray-600 dark:text-gray-400 custom-scrollbar">{JSON.stringify(webhookTestResults['plex'].response || webhookTestResults['plex'].error, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}"""
content = content.replace(plex_old, plex_new)

# 2. Jellyfin
jf_old = """<h4 className="font-semibold text-gray-800 dark:text-gray-200">Jellyfin</h4>"""
jf_new = """<div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Jellyfin</h4>
                  {formState.jellyfin?.serverUrl && (
                    <button type="button" onClick={() => handleTestWebhook('jellyfin', formState.jellyfin.serverUrl)} className="text-[10px] text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2 py-1 rounded font-bold uppercase tracking-wider flex items-center transition">
                      {testingWebhookId === 'jellyfin' ? <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
                      Test Handshake
                    </button>
                  )}
                </div>"""
content = content.replace(jf_old, jf_new)

jf_body_old = """{formState.jellyfin?.connected && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">"""
jf_body_new = """{formState.jellyfin?.connected && (
                <div className="space-y-3">
                  {webhookTestResults['jellyfin'] && (
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg p-3 border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Jellyfin Validator</span>
                        {webhookTestResults['jellyfin'].success ? (
                           <span className="text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded font-bold uppercase flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Valid</span>
                        ) : (
                           <span className="text-[10px] text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded font-bold uppercase">Failed</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div><span className="text-[9px] uppercase text-gray-500 font-bold mb-1 block">Request</span><pre className="bg-white dark:bg-black p-2 rounded border border-gray-100 dark:border-neutral-800 overflow-x-auto text-gray-600 dark:text-gray-400 custom-scrollbar">{JSON.stringify(webhookTestResults['jellyfin'].payload, null, 2)}</pre></div>
                        <div><span className="text-[9px] uppercase text-gray-500 font-bold mb-1 block">Response</span><pre className="bg-white dark:bg-black p-2 rounded border border-gray-100 dark:border-neutral-800 overflow-x-auto text-gray-600 dark:text-gray-400 custom-scrollbar">{JSON.stringify(webhookTestResults['jellyfin'].response || webhookTestResults['jellyfin'].error, null, 2)}</pre></div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">"""
content = content.replace(jf_body_old, jf_body_new)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
