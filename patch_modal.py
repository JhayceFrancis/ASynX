import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

modal_old = """      {/* Sync Validation Modal */}
      {showSyncValidation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSyncValidation(false)} />
          <div className="relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Validate Database Sync</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              You are about to execute a bulk synchronization across your connected platforms (Simkl, MAL, AniList) and the local database. 
              <br /><br />
              Please manually verify that you want to apply these changes. Conflicting records will follow the "Source of Truth" rules defined in your settings.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSyncValidation(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:hover:bg-[#222] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkSync}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                Confirm & Sync
              </button>
            </div>
          </div>
        </div>
      )}"""

modal_new = """      {/* Sync Validation Modal */}
      {showSyncValidation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSyncValidation(false)} />
          <div className={`relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 w-full ${showSyncPreview ? 'max-w-3xl' : 'max-w-md'} max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Validate Database Sync</h3>
              <button onClick={() => setShowSyncPreview(!showSyncPreview)} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
                {showSyncPreview ? 'Hide Preview' : 'Preview Changes'}
              </button>
            </div>
            
            {!showSyncPreview ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                You are about to execute a bulk synchronization across your connected platforms (Simkl, MAL, AniList) and the local database. 
                <br /><br />
                Please manually verify that you want to apply these changes. Conflicting records will follow the "{settings.syncRules?.presetProfile === 'aggressive' ? 'Highest Episode' : 'Source of Truth'}" rules defined in your settings.
              </p>
            ) : (
              <div className="flex-1 overflow-y-auto min-h-[300px] my-4 pr-2 space-y-3 custom-scrollbar">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">The following changes will be applied based on your current Sync Strategy Profile ({settings.syncRules?.presetProfile || 'hybrid'}).</p>
                {conflictItems.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 p-4 border border-dashed border-gray-200 dark:border-neutral-800 rounded-xl text-center">
                    No discrepancies detected. All platforms are currently in sync.
                  </div>
                ) : (
                  conflictItems.map(item => (
                    <div key={item.id} className="border border-gray-200 dark:border-neutral-800 rounded-xl p-3 bg-gray-50 dark:bg-neutral-900/30">
                      <div className="flex items-center justify-between mb-2 border-b border-gray-200 dark:border-neutral-800 pb-2">
                         <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{item.title}</span>
                         <span className="text-[10px] uppercase tracking-wider font-bold text-orange-500 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded">Conflict</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                         <div className="space-y-1">
                           <div className="font-medium text-gray-700 dark:text-gray-300">Current State</div>
                           {item.conflictDetails?.differences.map(diff => (
                             <div key={diff.platform} className="flex justify-between text-gray-500 dark:text-gray-400">
                               <span className="capitalize">{diff.platform}:</span>
                               <span>Ep {diff.episode} ({diff.status.replace('_', ' ')})</span>
                             </div>
                           ))}
                         </div>
                         <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-neutral-800 pt-2 sm:pt-0 sm:pl-3">
                           <div className="font-medium text-indigo-600 dark:text-indigo-400">Resolution Preview</div>
                           <div className="text-gray-600 dark:text-gray-300">
                             {settings.syncRules?.presetProfile === 'aggressive' ? (
                               <span>Will forcefully align all platforms to Ep {Math.max(...(item.conflictDetails?.differences.map(d => d.episode) || [0]))} (Highest tracked).</span>
                             ) : settings.syncRules?.presetProfile === 'manual' ? (
                               <span>Will skip this item. Requires manual validation.</span>
                             ) : (
                               <span>Will align using {settings.syncRules?.defaultSourceOfTruth || 'simkl'} as the source of truth.</span>
                             )}
                           </div>
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-100 dark:border-neutral-900">
              <button
                onClick={() => setShowSyncValidation(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:hover:bg-[#222] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkSync}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                Confirm & Sync
              </button>
            </div>
          </div>
        </div>
      )}"""

content = content.replace(modal_old, modal_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
