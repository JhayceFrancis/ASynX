import { useState } from "react";
import { Terminal, Copy, Check, Activity, FileText, BookOpen, Settings, Zap, Database, Download, Monitor, Box, Puzzle } from 'lucide-react';

export function ApiDocumentationView() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'getting_started' | 'windows' | 'docker' | 'extension' | 'api'>('getting_started');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(err => console.error("Clipboard error:", err));
    setCopiedEndpoint(text);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BookOpen className="w-48 h-48 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3 mb-2">
          <BookOpen className="w-7 h-7 text-indigo-500" />
          <span>Documentation & Guides</span>
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed relative z-10">
          Everything you need to set up, configure, and automate your ASynX environment.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-neutral-900 pb-2">
        <button onClick={() => setActiveTab('getting_started')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-colors ${activeTab === 'getting_started' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-[#111] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-800'}`}>
          <Zap className="w-4 h-4" />
          <span>Getting Started</span>
        </button>
        <button onClick={() => setActiveTab('windows')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-colors ${activeTab === 'windows' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-[#111] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-800'}`}>
          <Monitor className="w-4 h-4" />
          <span>Windows App</span>
        </button>
        <button onClick={() => setActiveTab('docker')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-colors ${activeTab === 'docker' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-[#111] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-800'}`}>
          <Box className="w-4 h-4" />
          <span>Docker</span>
        </button>
        <button onClick={() => setActiveTab('extension')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-colors ${activeTab === 'extension' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-[#111] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-800'}`}>
          <Puzzle className="w-4 h-4" />
          <span>Browser Extension</span>
        </button>
        <button onClick={() => setActiveTab('api')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-colors ${activeTab === 'api' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-[#111] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-800'}`}>
          <Terminal className="w-4 h-4" />
          <span>API Reference</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        
        {activeTab === 'getting_started' && (
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Features Overview</h3>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>Welcome to ASynX Matrix! ASynX unifies your tracking across Simkl, AniList, MAL, Plex, and web portals.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Unified Library:</strong> View items from all your configured trackers in one synchronized grid.</li>
                <li><strong>Cross-Tracking Synchronization:</strong> Watch on Plex, scrobble to AniList. Watch on Crunchyroll, sync to Simkl.</li>
                <li><strong>AI Conflict Resolution:</strong> When your lists diverge, let the onboard AI reconcile timestamps and missing metadata.</li>
                <li><strong>Ecosystem Extensions:</strong> Utilize the Windows App for local tracking, Docker for self-hosted persistent APIs, and the Browser extension for web portals.</li>
              </ul>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20 text-indigo-800 dark:text-indigo-300">
                <p><strong>Note:</strong> All personal data handles and tokens are protected via end-to-end encryption in transit and GDPR-compliant encryption-at-rest.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'windows' && (
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Windows App Installation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">The Windows Desktop app allows for seamless tracking of local media players like MPC-BE, VLC, and Plex Desktop.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-[#111] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-2"><Download className="w-4 h-4"/><span>Installer (.exe)</span></h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Download the pre-compiled standalone installer from our GitHub releases page.</p>
                <a href="https://github.com/asynx/releases" target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-500 hover:underline">Download Latest Release &rarr;</a>
              </div>
              <div className="bg-gray-50 dark:bg-[#111] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-2"><Terminal className="w-4 h-4"/><span>Build From Source</span></h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Clone the repository and build via Electron forge.</p>
                <code className="block bg-black text-emerald-400 text-[10px] p-2 rounded-lg font-mono">git clone ...<br/>npm run make</code>
              </div>
              <div className="bg-gray-50 dark:bg-[#111] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 opacity-70">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Microsoft Store</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Install via Microsoft Store for automatic background updates.</p>
                <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-[10px] font-bold rounded uppercase tracking-widest">Coming Soon</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docker' && (
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Docker Instance Deployment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Deploy ASynX as a background daemon on your Unraid, TrueNAS, or generic Docker host to keep webhooks processing 24/7 without your PC running.</p>
            
            <div className="bg-gray-50 dark:bg-[#111] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 space-y-3">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">docker-compose.yml</h4>
              <pre className="text-xs font-mono text-gray-800 dark:text-gray-300 bg-white dark:bg-black p-4 rounded-xl border border-gray-200 dark:border-neutral-900 overflow-x-auto">
{`version: '3.8'
services:
  asynx-backend:
    image: asynx/backend:latest
    container_name: asynx-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your_secure_secret_here
      - IDP_CLIENT_ID=your_idp_client_id
    volumes:
      - ./data:/app/data
    restart: unless-stopped`}
              </pre>
              <p className="text-xs text-gray-500">Run <code>docker-compose up -d</code> in the same directory.</p>
            </div>
          </div>
        )}

        {activeTab === 'extension' && (
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Browser Extension Plugin</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">The browser extension intercepts video players on Crunchyroll, Netflix, and HiDive, relaying playback states securely to your Backend Target URL.</p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-[#111] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2 flex items-center space-x-2"><Download className="w-4 h-4"/><span>Automated GitHub Release</span></h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Every release tag automatically builds and packages the browser extension via our GitHub Workflows. 
                  You can download the <code>asynx-browser-extension.zip</code> directly from the Assets section on our GitHub Release page.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-[#111] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Manual Installation (Developer Mode)</h4>
                <ol className="list-decimal pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Download and extract <code>asynx-browser-extension.zip</code> from GitHub Releases.</li>
                  <li>In Chrome/Edge/Brave, navigate to <code>chrome://extensions</code></li>
                  <li>Enable <strong>Developer mode</strong> in the top right.</li>
                  <li>Click <strong>Load unpacked</strong> and select the extracted folder.</li>
                  <li>Click the Extension icon in your toolbar, go to Settings, and securely configure your Backend Target URL and IDP settings.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-6">
            {/* /api/logs */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm group hover:border-indigo-500/30 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase rounded-lg border border-indigo-200 dark:border-indigo-500/30">
                      POST
                    </span>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Push External Logs</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                    Push custom logs from your Windows Daemon or Python scrobblers into the Matrix Dashboard's Activity Feed. Payload is encrypted at rest.
                  </p>
                </div>
                
                <div className="flex-1 lg:max-w-md w-full space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-black p-3 rounded-xl border border-gray-200 dark:border-neutral-800">
                    <code className="text-sm font-mono text-gray-800 dark:text-gray-300">/api/logs</code>
                    <button 
                      title="Copy Endpoint"
                      onClick={() => handleCopy('/api/logs')}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-md transition"
                    >
                      {copiedEndpoint === '/api/logs' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#111] p-3 rounded-lg border border-gray-200 dark:border-neutral-800">
{`fetch('http://localhost:3000/api/logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    level: 'info',
    message: 'Custom script executed.',
    timestamp: new Date().toISOString()
  })
});`}
                  </pre>
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
                    Triggers the onboard LLM resolution agent for a specific item to suggest the most accurate "source of truth".
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
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
