const fs = require('fs');
let content = fs.readFileSync('src/components/SyncMatrixView.tsx', 'utf8');

content = content.replace(
  "{ i: 'historical', x: 0, y: 10, w: 12, h: 14 },",
  "{ i: 'notifications', x: 0, y: 10, w: 12, h: 6 },\n      { i: 'historical', x: 0, y: 16, w: 12, h: 14 },"
);

// Add to the grid widget rendering block
const widgetRenderTarget = `              case 'historical':
                return (
                  <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 h-full flex flex-col shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <BarChart2 className="w-5 h-5 text-fuchsia-500" />
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Historical Sync Volume</h3>
                      </div>
                      <span className="text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">Last 24 Hours</span>
                    </div>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSync" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '12px', fontSize: '12px' }} />
                          <Area type="monotone" dataKey="syncs" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSync)" />
                          <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );`;

const notificationWidget = `              case 'notifications':
                return (
                  <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 h-full flex flex-col shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Notification Center</h3>
                      </div>
                      <span className="text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">{notifications.filter(n => !n.read).length} Unread</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <Bell className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-sm font-medium">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className={\`p-3 rounded-xl border flex items-start space-x-3 transition-colors \${notif.read ? 'bg-gray-50 dark:bg-[#111] border-gray-100 dark:border-neutral-800 opacity-70' : 'bg-white dark:bg-[#0a0a0a] border-indigo-100 dark:border-indigo-900/30'}\`}>
                            {notif.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />}
                            {notif.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />}
                            {notif.type === 'error' && <X className="w-5 h-5 text-rose-500 mt-0.5" />}
                            {notif.type === 'info' && <Bell className="w-5 h-5 text-blue-500 mt-0.5" />}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate pr-4">{notif.title}</h4>
                                <span className="text-[10px] text-gray-500 whitespace-nowrap">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                              {notif.actionUrl && (
                                <button className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                  View Details &rarr;
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              case 'historical':`;

content = content.replace("              case 'historical':", notificationWidget.replace("              case 'historical':", ""));

fs.writeFileSync('src/components/SyncMatrixView.tsx', content);
