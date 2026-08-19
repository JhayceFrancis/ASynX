const fs = require('fs');

let apiDocs = fs.readFileSync('src/components/ApiDocumentationView.tsx', 'utf8');

const healthUpdate = `
          <div className="bg-gray-50 dark:bg-[#111] rounded-2xl p-4 font-mono text-sm border border-gray-200 dark:border-neutral-900 overflow-x-auto">
            <div className="flex items-center space-x-2 mb-3">
              <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-bold uppercase tracking-wider">GET</span>
              <span className="text-gray-900 dark:text-gray-300 font-semibold">/api/health</span>
            </div>
            <pre className="text-gray-700 dark:text-gray-400 text-xs">
{
  "status": "ok",
  "uptime": 1243.5,
  "services": {
    "mal": { "status": "operational", "latencyMs": 142 },
    "anilist": { "status": "operational", "latencyMs": 85 },
    "simkl": { "status": "operational", "latencyMs": 56 }
  }
}
            </pre>
          </div>
`;

apiDocs = apiDocs.replace(/<div className="flex items-center space-x-2 mb-3">\s*<span className="px-2 py-0\.5 bg-emerald-500 text-white rounded text-\[10px\] font-bold uppercase tracking-wider">GET<\/span>\s*<span className="text-gray-900 dark:text-gray-300 font-semibold">\/api\/health<\/span>\s*<\/div>\s*<pre className="text-gray-700 dark:text-gray-400 text-xs">\s*\{\s*"status": "ok",\s*"uptime": 3600\s*\}\s*<\/pre>/, 
            `<div className="flex items-center space-x-2 mb-3">
              <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-bold uppercase tracking-wider">GET</span>
              <span className="text-gray-900 dark:text-gray-300 font-semibold">/api/health</span>
            </div>
            <pre className="text-gray-700 dark:text-gray-400 text-xs">
{
  "status": "ok",
  "uptime": 1243.5,
  "services": {
    "mal": { "status": "operational", "latencyMs": 142 },
    "anilist": { "status": "operational", "latencyMs": 85 },
    "simkl": { "status": "operational", "latencyMs": 56 }
  }
}
            </pre>`);

const newApiSystemHealth = `
        {/* /api/system/health */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Daemon System Health</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fetch real-time metrics for media servers and system integrations.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-[#111] rounded-2xl p-4 font-mono text-sm border border-gray-200 dark:border-neutral-900 overflow-x-auto">
            <div className="flex items-center space-x-2 mb-3">
              <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-bold uppercase tracking-wider">GET</span>
              <span className="text-gray-900 dark:text-gray-300 font-semibold">/api/system/health</span>
            </div>
            <pre className="text-gray-700 dark:text-gray-400 text-xs">
{
  "status": "ok",
  "uptime": 84600,
  "memoryUsage": {
    "rss": "54.2 MB",
    "heapTotal": "28.5 MB",
    "heapUsed": "14.1 MB"
  },
  "integrations": {
    "plex": { "connected": true, "status": "operational", "latencyMs": 12 },
    "simkl": { "connected": true, "status": "operational", "latencyMs": 44 }
  }
}
            </pre>
          </div>
        </div>
`;

apiDocs = apiDocs.replace('{/* /api/sync/trigger */}', newApiSystemHealth + '\n        {/* /api/sync/trigger */}');

fs.writeFileSync('src/components/ApiDocumentationView.tsx', apiDocs);

