const fs = require('fs');
let code = fs.readFileSync('src/components/SyncMatrixView.tsx', 'utf8');

// 1. Change default view to grid
code = code.replace(
  /const \[viewMode, setViewMode\] = useState<'grid' \| 'table'>\('table'\);/,
  "const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');"
);

// 2. Reorganize controls bar
const oldControls = `<div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-2xl p-4 flex flex-col xl:flex-row items-center justify-between gap-4 shadow-sm">
            {/* Search Input & Import */}
            <div className="flex items-center space-x-2 w-full xl:w-auto">
              <div className="relative flex-grow sm:w-64">
                <Search className="w-4 h-4 text-gray-600 dark:text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search anime or drama title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 placeholder:text-gray-500 dark:text-gray-500"
                />
              </div>
              
              {/* Import Button */}
              <label className="flex items-center justify-center bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition shadow-sm whitespace-nowrap">
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Import Media
                <input type="file" className="hidden" accept=".csv,.json,.html" onChange={handleImport} />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-end min-w-0">
              {/* Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none max-w-full pb-1">`;

const newControls = `<div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-2xl p-4 flex flex-col gap-4 shadow-sm">
            
            {/* Top Row: Search, Import, View Toggles */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:w-64">
                  <Search className="w-4 h-4 text-gray-600 dark:text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search anime or drama title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 placeholder:text-gray-500 dark:text-gray-500"
                  />
                </div>
                
                {/* Import Button */}
                <label className="flex items-center justify-center bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition shadow-sm whitespace-nowrap">
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Import Media
                  <input type="file" className="hidden" accept=".csv,.json,.html" onChange={handleImport} />
                </label>
              </div>

              {/* View Selector (moved to top row) */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-[#111] p-1 rounded-xl border border-gray-200 dark:border-neutral-900 self-end sm:self-auto w-full sm:w-auto justify-center sm:justify-start">
                <button
                  onClick={() => setViewMode('grid')}
                  className={\`p-1.5 rounded-md transition \${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200'}\`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={\`p-1.5 rounded-md transition \${viewMode === 'table' ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200'}\`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Row: Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2 max-w-full">`;

code = code.replace(oldControls, newControls);

// Now remove the old view selector part
const viewSelectorRegex = /<div className="flex items-center space-x-1 bg-gray-100 dark:bg-\[#111\] p-1 rounded-xl border border-gray-200 dark:border-neutral-900">\s*<button\s*onClick=\{\(\) => setViewMode\('table'\)\}\s*className=\{\\\`p-1\.5 rounded-md transition \$\{viewMode === 'table' \? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200'\}\\\`\}\s*title="Table View"\s*>\s*<List className="w-4 h-4" \/>\s*<\/button>\s*<button\s*onClick=\{\(\) => setViewMode\('grid'\)\}\s*className=\{\\\`p-1\.5 rounded-md transition \$\{viewMode === 'grid' \? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200'\}\\\`\}\s*title="Grid View"\s*>\s*<LayoutGrid className="w-4 h-4" \/>\s*<\/button>\s*<\/div>/;

code = code.replace(viewSelectorRegex, '');

fs.writeFileSync('src/components/SyncMatrixView.tsx', code);
