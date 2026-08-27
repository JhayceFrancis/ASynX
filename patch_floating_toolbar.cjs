const fs = require('fs');
let content = fs.readFileSync('src/components/SyncMatrixView.tsx', 'utf8');

const oldBulkBar = `          {/* Bulk Actions Bar */}
          <AnimatePresence>
            {selectedIds.length > 0 && activeFilter !== 'history' && (
              <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.95, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', scale: 1, marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, scale: 0.95, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-3 flex items-center justify-between shadow-sm overflow-hidden"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-indigo-700 dark:text-indigo-300 font-bold text-sm ml-2">
                    {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleBulkIgnore}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-black/50 rounded-lg transition"
                  >
                    Deselect All
                  </button>
                  <button 
                    onClick={handleBulkSync}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Selected</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>`;

const newFloatingBar = `          {/* Floating Bulk Actions Toolbar */}
          <AnimatePresence>
            {selectedIds.length > 0 && activeFilter !== 'history' && (
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-gray-200/50 dark:border-neutral-800/50 shadow-2xl rounded-2xl p-2 flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2 px-3 border-r border-gray-200 dark:border-neutral-800">
                  <span className="text-gray-900 dark:text-gray-100 font-bold text-sm">
                    {selectedIds.length} <span className="font-medium text-gray-500">selected</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      if (confirm('Force sync these items across all platforms?')) {
                         handleBulkSync();
                      }
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition flex items-center space-x-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Force Sync</span>
                  </button>
                  <button 
                    onClick={() => {
                       alert('Marked ' + selectedIds.length + ' items as watched.');
                       setSelectedIds([]);
                    }}
                    className="px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-xl transition flex items-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Watched</span>
                  </button>
                  <button 
                    onClick={() => {
                       handleBulkIgnore();
                    }}
                    className="px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50 rounded-xl transition flex items-center space-x-2 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Ignore Conflict</span>
                  </button>
                  <button 
                    onClick={() => setSelectedIds([])}
                    className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>`;

if (content.includes('Bulk Actions Bar')) {
  // Use a simpler string replacement since exact matching can be brittle with whitespace
  const lines = content.split('\\n');
  const startIndex = lines.findIndex(l => l.includes('Bulk Actions Bar'));
  const endIndex = lines.findIndex((l, i) => i > startIndex && l.includes('</AnimatePresence>'));
  
  if (startIndex !== -1 && endIndex !== -1) {
    lines.splice(startIndex, endIndex - startIndex + 1, newFloatingBar);
    content = lines.join('\\n');
  }
}

fs.writeFileSync('src/components/SyncMatrixView.tsx', content);
