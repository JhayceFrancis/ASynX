const fs = require('fs');

let code = fs.readFileSync('src/components/SyncMatrixView.tsx', 'utf8');

code = code.replace(
  /<label className="flex items-center justify-center bg-indigo-600\/10 hover:bg-indigo-600\/20 text-indigo-400 border border-indigo-500\/30 px-3 py-1\.5 rounded-xl text-xs font-semibold cursor-pointer transition">\s*<Upload className="w-4 h-4 mr-1\.5" \/>\s*Import\s*<input type="file" className="hidden" accept="\.csv,\.json,\.html" onChange=\{handleImport\} \/>\s*<\/label>/,
  `<label className="flex items-center justify-center bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition shadow-sm whitespace-nowrap">
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Import Media
                <input type="file" className="hidden" accept=".csv,.json,.html" onChange={handleImport} />
              </label>`
);

fs.writeFileSync('src/components/SyncMatrixView.tsx', code);
