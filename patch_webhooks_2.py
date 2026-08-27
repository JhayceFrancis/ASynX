import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# Emby
emby_old = """<h4 className="font-semibold text-gray-800 dark:text-gray-200">Emby</h4>"""
emby_new = """<div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Emby</h4>
                  {formState.emby?.serverUrl && (
                    <button type="button" onClick={() => handleTestWebhook('emby', formState.emby.serverUrl)} className="text-[10px] text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2 py-1 rounded font-bold uppercase tracking-wider flex items-center transition">
                      {testingWebhookId === 'emby' ? <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
                      Test Handshake
                    </button>
                  )}
                </div>"""
content = content.replace(emby_old, emby_new)

emby_body_old = """{formState.emby?.connected && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">"""
emby_body_new = """{formState.emby?.connected && (
                <div className="space-y-3">
                  {webhookTestResults['emby'] && (
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg p-3 border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Emby Validator</span>
                        {webhookTestResults['emby'].success ? (
                           <span className="text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded font-bold uppercase flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Valid</span>
                        ) : (
                           <span className="text-[10px] text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded font-bold uppercase">Failed</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div><span className="text-[9px] uppercase text-gray-500 font-bold mb-1 block">Request</span><pre className="bg-white dark:bg-black p-2 rounded border border-gray-100 dark:border-neutral-800 overflow-x-auto text-gray-600 dark:text-gray-400 custom-scrollbar">{JSON.stringify(webhookTestResults['emby'].payload, null, 2)}</pre></div>
                        <div><span className="text-[9px] uppercase text-gray-500 font-bold mb-1 block">Response</span><pre className="bg-white dark:bg-black p-2 rounded border border-gray-100 dark:border-neutral-800 overflow-x-auto text-gray-600 dark:text-gray-400 custom-scrollbar">{JSON.stringify(webhookTestResults['emby'].response || webhookTestResults['emby'].error, null, 2)}</pre></div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">"""
content = content.replace(emby_body_old, emby_body_new)

# Karakeep
kara_old = """<div className="flex items-center space-x-2">
              <KarakeepLogo className="w-4 h-4 text-pink-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">KaraKeep Integration</h3>
            </div>"""
kara_new = """<div className="flex items-center space-x-2">
              <KarakeepLogo className="w-4 h-4 text-pink-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">KaraKeep Integration</h3>
              {formState.karakeep?.apiUrl && (
                    <button type="button" onClick={() => handleTestWebhook('karakeep', formState.karakeep.apiUrl)} className="text-[10px] text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/30 px-2 py-1 rounded font-bold uppercase tracking-wider flex items-center transition ml-4">
                      {testingWebhookId === 'karakeep' ? <div className="w-3 h-3 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
                      Test Handshake
                    </button>
                  )}
            </div>"""
content = content.replace(kara_old, kara_new)

kara_body_old = """{formState.karakeep?.connected && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-2">"""
kara_body_new = """{formState.karakeep?.connected && (
            <div className="space-y-4 mt-2 text-xs">
              {webhookTestResults['karakeep'] && (
                <div className="bg-pink-50/50 dark:bg-pink-900/10 rounded-lg p-3 border border-pink-100 dark:border-pink-900/30 animate-in fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-pink-700 dark:text-pink-300">KaraKeep Validator</span>
                    {webhookTestResults['karakeep'].success ? (
                       <span className="text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded font-bold uppercase flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Valid</span>
                    ) : (
                       <span className="text-[10px] text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded font-bold uppercase">Failed</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div><span className="text-[9px] uppercase text-gray-500 font-bold mb-1 block">Request</span><pre className="bg-white dark:bg-black p-2 rounded border border-gray-100 dark:border-neutral-800 overflow-x-auto text-gray-600 dark:text-gray-400 custom-scrollbar">{JSON.stringify(webhookTestResults['karakeep'].payload, null, 2)}</pre></div>
                    <div><span className="text-[9px] uppercase text-gray-500 font-bold mb-1 block">Response</span><pre className="bg-white dark:bg-black p-2 rounded border border-gray-100 dark:border-neutral-800 overflow-x-auto text-gray-600 dark:text-gray-400 custom-scrollbar">{JSON.stringify(webhookTestResults['karakeep'].response || webhookTestResults['karakeep'].error, null, 2)}</pre></div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">"""
content = content.replace(kara_body_old, kara_body_new)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
