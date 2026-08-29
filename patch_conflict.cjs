const fs = require('fs');
const file = 'src/components/ConflictResolutionView.tsx';
let content = fs.readFileSync(file, 'utf8');

const diagnosticPanel = `
      {/* Diagnostic Panel: Ignored Scrobble Events */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-neutral-900 pb-3 mb-4">
          <Info className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Ignored Scrobble Diagnostics</h3>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Below are recent scrobble events that were blocked by your active Daemon Settings rules. This provides transparency on why certain episodes did not sync.
          </p>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            <div className="p-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-neutral-800 rounded-xl flex flex-col space-y-1">
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Frieren - 28.mkv</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">MPC-BE Local Player</span>
              <div className="mt-2 text-xs font-medium text-rose-500 dark:text-rose-400 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Failed completion threshold (55% < 80%)
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-neutral-800 rounded-xl flex flex-col space-y-1">
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Private_Clip_04.mp4</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">MPC-BE Local Player</span>
              <div className="mt-2 text-xs font-medium text-amber-500 dark:text-amber-400 flex items-center">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Matched ignored path (D:\\Private\\)
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-neutral-800 rounded-xl flex flex-col space-y-1">
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Jujutsu Kaisen S2 - 12.mkv</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">MPC-BE Local Player</span>
              <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Player rule disabled in Settings
              </div>
            </div>
          </div>
        </div>
      </div>
`;

content = content.replace(
  '{/* BULK-ACTION FEATURE TOOLBAR */}',
  diagnosticPanel + '\n      {/* BULK-ACTION FEATURE TOOLBAR */}'
);

fs.writeFileSync(file, content);
console.log("Patched ConflictResolutionView");
