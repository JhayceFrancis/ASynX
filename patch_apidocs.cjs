const fs = require('fs');
let content = fs.readFileSync('src/components/ApiDocumentationView.tsx', 'utf8');

const newEndpoints = `
        {/* /api/conflicts/ai-resolve */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm group hover:border-indigo-500/30 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase rounded-lg border border-indigo-200 dark:border-indigo-500/30">
                  POST
                </span>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Smart AI Resolution</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                Triggers the Gemini/OpenAI conflict resolution agent for a specific media item. It analyzes timestamps and metadata discrepancies to suggest the most accurate "source of truth".
              </p>
            </div>
            
            <div className="flex-1 lg:max-w-md w-full space-y-3">
              <div className="flex items-center justify-between bg-gray-50 dark:bg-black p-3 rounded-xl border border-gray-200 dark:border-neutral-800">
                <code className="text-sm font-mono text-gray-800 dark:text-gray-300">/api/conflicts/ai-resolve</code>
                <button 
                  title="Copy Endpoint"
                  onClick={() => handleCopy('/api/conflicts/ai-resolve')}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-md transition"
                >
                  {copiedEndpoint === '/api/conflicts/ai-resolve' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider pl-1">JSON Payload</span>
                <pre className="text-xs font-mono text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-black p-3 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-x-auto">
{JSON.stringify({ "itemId": "string (UUID)" }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* /api/notifications/dispatch */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm group hover:border-fuchsia-500/30 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 bg-fuchsia-100 dark:bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-400 text-xs font-bold uppercase rounded-lg border border-fuchsia-200 dark:border-fuchsia-500/30">
                  POST
                </span>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Dispatch Notification</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                Programmatically dispatches an alert via the configured webhooks (Discord, Apprise, Pushbullet). Ideal for alerting users upon completion of external batch processing tasks.
              </p>
            </div>
            
            <div className="flex-1 lg:max-w-md w-full space-y-3">
              <div className="flex items-center justify-between bg-gray-50 dark:bg-black p-3 rounded-xl border border-gray-200 dark:border-neutral-800">
                <code className="text-sm font-mono text-gray-800 dark:text-gray-300">/api/notifications/dispatch</code>
                <button 
                  title="Copy Endpoint"
                  onClick={() => handleCopy('/api/notifications/dispatch')}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-md transition"
                >
                  {copiedEndpoint === '/api/notifications/dispatch' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider pl-1">JSON Payload</span>
                <pre className="text-xs font-mono text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-black p-3 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-x-auto">
{JSON.stringify({ "title": "string", "message": "string", "type": "info | success | warning | error" }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* /api/sync/trigger */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm group hover:border-emerald-500/30 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase rounded-lg border border-emerald-200 dark:border-emerald-500/30">
                  POST
                </span>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Trigger Bulk Sync</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                Initiates a forced reconciliation across all linked services (Plex, Simkl, AniList, MAL). Typically executed via a scheduled background cron job or the floating UI toolbar.
              </p>
            </div>
            
            <div className="flex-1 lg:max-w-md w-full space-y-3">
              <div className="flex items-center justify-between bg-gray-50 dark:bg-black p-3 rounded-xl border border-gray-200 dark:border-neutral-800">
                <code className="text-sm font-mono text-gray-800 dark:text-gray-300">/api/sync/trigger</code>
                <button 
                  title="Copy Endpoint"
                  onClick={() => handleCopy('/api/sync/trigger')}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-md transition"
                >
                  {copiedEndpoint === '/api/sync/trigger' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider pl-1">Headers</span>
                <pre className="text-xs font-mono text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-black p-3 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-x-auto">
Empty Payload
                </pre>
              </div>
            </div>
          </div>
        </div>
`;

content = content.replace("      </div>\n    </div>\n  );\n}", newEndpoints + "\n      </div>\n    </div>\n  );\n}");

fs.writeFileSync('src/components/ApiDocumentationView.tsx', content);
