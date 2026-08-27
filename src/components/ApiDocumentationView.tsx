import { useState } from "react";
import { Terminal, Copy, Check, Activity, FileText, BookOpen, Settings, Zap, Database } from 'lucide-react';

export function ApiDocumentationView() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(err => console.error("Clipboard error:", err));
    setCopiedEndpoint(text);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BookOpen className="w-48 h-48 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3 mb-2">
          <BookOpen className="w-7 h-7 text-indigo-500" />
          <span>Documentation & API Guides</span>
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
          Comprehensive guides for general app capabilities, integrating complex setups like Webhooks, and utilizing REST API endpoints for external systems.
        </p>
      </div>

      {/* General Capabilities Guide */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>General Capabilities & Setup</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm">
            <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-2">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>Cross-Platform Sync Matrix</span>
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              ASynX utilizes a local SQLite database (in Docker) or in-memory persistence to map unique identifiers across Simkl, MyAnimeList, and AniList. 
              The Sync Matrix allows you to view these relationships, detect missing IDs, and manually override mapping conflicts using the Source of Truth hierarchy defined in Settings.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm">
            <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-2">
              <Settings className="w-4 h-4 text-indigo-500" />
              <span>Background Docker Daemon</span>
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              When deployed via Docker, the ASynX backend runs a persistent Node.js background interval loop. This daemon checks for library differences and executes bi-directional sync operations even when the frontend UI is closed. Configure the sync frequency in the Settings panel.
            </p>
          </div>
        </div>
      </div>

      {/* Complex Webhook Guides */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-purple-500" />
          <span>Webhook & Automation Guides</span>
        </h3>
        
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm">
          <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">Plex & Media Server Webhook Setup</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            To enable real-time scrobbling without a browser extension, ASynX can ingest native webhooks from Plex, Jellyfin, and Emby. 
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>Open your Media Server's Dashboard (e.g., Plex Pass Webhooks section).</li>
            <li>Add a new Webhook URL pointing to your ASynX instance: <code className="bg-gray-100 dark:bg-neutral-800 px-1 rounded">http://your-ip:3000/api/webhooks/plex</code>.</li>
            <li>Ensure the payload format is set to JSON.</li>
            <li>Configure the <strong>Auto-Scrobble Threshold</strong> in ASynX Settings (default 85%). ASynX will trigger a sync when the media progress crosses this percentage.</li>
          </ol>
        </div>
      </div>

      {/* REST API Endpoints */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-emerald-500" />
          <span>REST API Endpoints</span>
        </h3>
        
        {/* /api/health */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Health Check</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Verify server status and core dependencies.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl p-4 overflow-x-auto relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold tracking-wider rounded uppercase">GET</span>
                <code className="text-sm font-mono text-gray-800 dark:text-gray-300">/api/health</code>
              </div>
              <button 
                onClick={() => handleCopy('/api/health')}
                className="text-gray-400 hover:text-indigo-500 transition"
              >
                {copiedEndpoint === '/api/health' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="mt-4">
              <h4 className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-2 tracking-wider">Example Response</h4>
              <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-white dark:bg-[#111] p-3 rounded-lg border border-gray-200 dark:border-neutral-800">{`{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-08-16T03:30:00.000Z",
  "database": "connected"
}`}</pre>
            </div>
          </div>
        </div>

        {/* /api/logs */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">System Logs</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Send custom client-side telemetry or application logs to the ASynX backend.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl p-4 overflow-x-auto relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold tracking-wider rounded uppercase">POST</span>
                <code className="text-sm font-mono text-gray-800 dark:text-gray-300">/api/logs</code>
              </div>
              <button 
                onClick={() => handleCopy('/api/logs')}
                className="text-gray-400 hover:text-indigo-500 transition"
              >
                {copiedEndpoint === '/api/logs' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="mt-4">
              <h4 className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-2 tracking-wider">Payload Schema</h4>
              <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-white dark:bg-[#111] p-3 rounded-lg border border-gray-200 dark:border-neutral-800">{`{
  "level": "info" | "warn" | "error",
  "message": "string",
  "data": "any (optional)",
  "error": "object (optional)",
  "timestamp": "ISO Date String",
  "url": "string (optional)",
  "userAgent": "string (optional)"
}`}</pre>
            </div>
            
            <div className="mt-4">
              <h4 className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-2 tracking-wider">Example Request</h4>
              <pre className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#111] p-3 rounded-lg border border-gray-200 dark:border-neutral-800">{`fetch('http://localhost:3000/api/logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    level: 'info',
    message: 'Custom script executed successfully.',
    timestamp: new Date().toISOString()
  })
});`}</pre>
            </div>
          </div>
        </div>


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

      </div>
    </div>
  );
}
