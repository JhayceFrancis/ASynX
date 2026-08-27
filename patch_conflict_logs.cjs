const fs = require('fs');
let content = fs.readFileSync('src/components/ConflictResolutionView.tsx', 'utf8');

const logsWidget = `
            {/* Resolution History / Logs Panel */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-md mt-6">
              <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 dark:border-neutral-900">
                <ListChecks className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Recent Resolution Activity</h3>
              </div>
              <div className="pt-4 space-y-3 h-48 overflow-y-auto scrollbar-thin">
                <div className="flex items-start space-x-3 text-xs bg-gray-50 dark:bg-[#111] p-3 rounded-xl border border-gray-100 dark:border-neutral-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">System Analytics</span>
                    <p className="text-gray-600 dark:text-gray-400 mt-0.5">Awaiting first user resolution action for session tracking.</p>
                  </div>
                  <span className="text-gray-400 dark:text-gray-600 ml-auto flex-shrink-0">Just now</span>
                </div>
              </div>
            </div>
`;

// Insert it right after the closing div of the AI assistant panel, before the end of the lg:col-span-8 space-y-6 block.
// Let's replace:
const target = `                )}
              </div>
            </div>`;
const replacement = `                )}
              </div>
            </div>
            ${logsWidget}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/ConflictResolutionView.tsx', content);
