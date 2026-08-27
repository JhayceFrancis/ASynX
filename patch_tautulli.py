import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# Add tautulli state default to type
# wait, it is already in formState.tautulli

plex_block = """                  <div className="grid grid-cols-2 gap-2 text-[10px]">
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

tautulli_block = """
            {/* Tautulli */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Tautulli</h4>
                  {formState.tautulli?.webhookUrl && (
                    <button type="button" onClick={() => handleTestWebhook('tautulli', formState.tautulli.webhookUrl)} className="text-[10px] text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2 py-1 rounded font-bold uppercase tracking-wider flex items-center transition">
                      {testingWebhookId === 'tautulli' ? <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
                      Test Handshake
                    </button>
                  )}
                </div>
                <button type="button"
                  onClick={() => setFormState(prev => ({ ...prev, tautulli: { secretKey: prev.tautulli?.secretKey ?? '', webhookUrl: prev.tautulli?.webhookUrl ?? '', connected: !(prev.tautulli?.connected ?? false) } }))}
                  className={`w-8 h-4 rounded-full transition-colors relative ${formState.tautulli?.connected ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${formState.tautulli?.connected ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
                
              {formState.tautulli?.connected && (
                <div className="space-y-3">
                  {webhookTestResults['tautulli'] && (
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg p-3 border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Tautulli Validator</span>
                        {webhookTestResults['tautulli'].success ? (
                           <span className="text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded font-bold uppercase flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Valid</span>
                        ) : (
                           <span className="text-[10px] text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded font-bold uppercase">Failed</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div><span className="text-[9px] uppercase text-gray-500 font-bold mb-1 block">Request</span><pre className="bg-white dark:bg-black p-2 rounded border border-gray-100 dark:border-neutral-800 overflow-x-auto text-gray-600 dark:text-gray-400 custom-scrollbar">{JSON.stringify(webhookTestResults['tautulli'].payload, null, 2)}</pre></div>
                        <div><span className="text-[9px] uppercase text-gray-500 font-bold mb-1 block">Response</span><pre className="bg-white dark:bg-black p-2 rounded border border-gray-100 dark:border-neutral-800 overflow-x-auto text-gray-600 dark:text-gray-400 custom-scrollbar">{JSON.stringify(webhookTestResults['tautulli'].response || webhookTestResults['tautulli'].error, null, 2)}</pre></div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-600 dark:text-gray-400 font-medium">Tautulli Secret/API Key</label>
                      <input
                        type="password"
                        value={formState.tautulli?.secretKey || ''}
                        onChange={(e) => setFormState(prev => ({
                          ...prev,
                          tautulli: { ...prev.tautulli, webhookUrl: prev.tautulli?.webhookUrl ?? '', connected: true, secretKey: e.target.value }
                        }))}
                        className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-gray-600 dark:text-gray-400 font-medium">Tautulli Webhook Inbound URL</label>
                      <input
                        type="text"
                        value={formState.tautulli?.webhookUrl || ''}
                        onChange={(e) => setFormState(prev => ({
                          ...prev,
                          tautulli: { ...prev.tautulli, secretKey: prev.tautulli?.secretKey ?? '', connected: true, webhookUrl: e.target.value }
                        }))}
                        className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
"""

content = content.replace(plex_block, plex_block + "\n" + tautulli_block)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
