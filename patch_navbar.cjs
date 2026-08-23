const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const simklTarget = `<Tooltip title="Simkl Tracker Status" description="Real-time connection health and sync readiness with Simkl service. Click to view API requests dashboard." position="bottom-right">
                  <button 
                    onClick={() => setActiveTab('performance')}
                    className="flex items-center space-x-1 cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 px-1 py-0.5 rounded transition-colors"
                  >
                    <span className={\`w-2 h-2 rounded-full \${settings?.simkl?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}\`} />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L22 20H2L12 2Z" fill="#FACC15" />
                    </svg>
                  </button>
                </Tooltip>
                <a href="https://simkl.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" title="Visit Simkl.com">
                  <ExternalLink className="w-3 h-3" />
                </a>`;

const simklReplace = `<Tooltip title="Simkl Tracker Status" description="Real-time connection health. Click to view API requests dashboard." position="bottom-right">
                  <button 
                    onClick={() => setActiveTab('performance')}
                    className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors focus:outline-none"
                  >
                    <span className={\`w-2 h-2 rounded-full \${settings?.simkl?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}\`} />
                  </button>
                </Tooltip>
                <a href="https://simkl.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors" title="Visit Simkl.com">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L22 20H2L12 2Z" fill="#FACC15" />
                  </svg>
                </a>`;

const malTarget = `<Tooltip title="MyAnimeList Status" description="Connected status for MyAnimeList account synchronization. Click to view API requests dashboard." position="bottom-right">
                  <button 
                    onClick={() => setActiveTab('performance')}
                    className="flex items-center space-x-1 cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 px-1 py-0.5 rounded transition-colors"
                  >
                    <span className={\`w-2 h-2 rounded-full \${settings?.mal?.connected ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}\`} />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#2E51A2" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="4" />
                      <text x="12" y="16" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">MAL</text>
                    </svg>
                  </button>
                </Tooltip>
                <a href="https://myanimelist.net" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" title="Visit MyAnimeList.net">
                  <ExternalLink className="w-3 h-3" />
                </a>`;

const malReplace = `<Tooltip title="MyAnimeList Status" description="Connected status for MyAnimeList. Click to view API requests dashboard." position="bottom-right">
                  <button 
                    onClick={() => setActiveTab('performance')}
                    className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors focus:outline-none"
                  >
                    <span className={\`w-2 h-2 rounded-full \${settings?.mal?.connected ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}\`} />
                  </button>
                </Tooltip>
                <a href="https://myanimelist.net" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors" title="Visit MyAnimeList.net">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#2E51A2" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="4" />
                    <text x="12" y="16" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">MAL</text>
                  </svg>
                </a>`;

const anilistTarget = `<Tooltip title="AniList Tracker Status" description="GraphQL API connection and active bearer token status for AniList. Click to view API requests dashboard." position="bottom-right">
                  <button 
                    onClick={() => setActiveTab('performance')}
                    className="flex items-center space-x-1 cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 px-1 py-0.5 rounded transition-colors"
                  >
                    <span className={\`w-2 h-2 rounded-full \${settings?.anilist?.connected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}\`} />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#02A9FF" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L22 22H17L15 17H9L7 22H2L12 2Z" />
                    </svg>
                  </button>
                </Tooltip>
                <a href="https://anilist.co" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" title="Visit AniList.co">
                  <ExternalLink className="w-3 h-3" />
                </a>`;

const anilistReplace = `<Tooltip title="AniList Tracker Status" description="GraphQL API connection status for AniList. Click to view API requests dashboard." position="bottom-right">
                  <button 
                    onClick={() => setActiveTab('performance')}
                    className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors focus:outline-none"
                  >
                    <span className={\`w-2 h-2 rounded-full \${settings?.anilist?.connected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}\`} />
                  </button>
                </Tooltip>
                <a href="https://anilist.co" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors" title="Visit AniList.co">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#02A9FF" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L22 22H17L15 17H9L7 22H2L12 2Z" />
                  </svg>
                </a>`;

const plexTarget = `<Tooltip title="Docker Sync Daemon" description="Background daemon on server running automated cross-platform sync cycles. Click to view API requests dashboard." position="bottom-right">
                  <button 
                    onClick={() => setActiveTab('performance')}
                    className="flex items-center space-x-1 cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 px-1 py-0.5 rounded transition-colors"
                  >
                    <span className={\`w-2 h-2 rounded-full \${settings?.plex?.connected ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'}\`} />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#E5A00D" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L22 7V17L12 22L2 17V7L12 2Z" />
                      <path d="M15 12L10 8V16L15 12Z" fill="#282A2D" />
                    </svg>
                  </button>
                </Tooltip>
                <a href="https://plex.tv" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" title="Visit Plex.tv">
                  <ExternalLink className="w-3 h-3" />
                </a>`;

const plexReplace = `<Tooltip title="Docker Sync Daemon" description="Background daemon on server running automated cross-platform sync. Click to view API requests dashboard." position="bottom-right">
                  <button 
                    onClick={() => setActiveTab('performance')}
                    className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors focus:outline-none"
                  >
                    <span className={\`w-2 h-2 rounded-full \${settings?.plex?.connected ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'}\`} />
                  </button>
                </Tooltip>
                <a href="https://plex.tv" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-[#222]/50 p-1 rounded transition-colors" title="Visit Plex.tv">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#E5A00D" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L22 7V17L12 22L2 17V7L12 2Z" />
                    <path d="M15 12L10 8V16L15 12Z" fill="#282A2D" />
                  </svg>
                </a>`;

content = content.replace(simklTarget, simklReplace);
content = content.replace(malTarget, malReplace);
content = content.replace(anilistTarget, anilistReplace);
content = content.replace(plexTarget, plexReplace);

fs.writeFileSync('src/components/Navbar.tsx', content);
