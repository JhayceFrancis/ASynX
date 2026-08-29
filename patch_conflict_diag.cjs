const fs = require('fs');
const file = 'src/components/ConflictResolutionView.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="mt-2 text-xs font-medium text-rose-500 dark:text-rose-400 flex items-center">\s*<AlertCircle className="w-3 h-3 mr-1" \/>\s*Failed completion threshold \(55% \&lt; 80%\)\s*<\/div>/;

const newHTML = `<div className="mt-2 flex items-center justify-between">
                <div className="text-xs font-medium text-rose-500 dark:text-rose-400 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Failed completion threshold (55% &lt; 80%)
                </div>
                <button onClick={onNavigateSettings} className="text-[10px] font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">
                  Adjust Rules
                </button>
              </div>`;
              
const regex2 = /<div className="mt-2 text-xs font-medium text-amber-500 dark:text-amber-400 flex items-center">\s*<ShieldCheck className="w-3 h-3 mr-1" \/>\s*Matched ignored path \(D:\\\\Private\\\\\)\s*<\/div>/;

const newHTML2 = `<div className="mt-2 flex items-center justify-between">
                <div className="text-xs font-medium text-amber-500 dark:text-amber-400 flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Matched ignored path (D:\\Private\\)
                </div>
                <button onClick={onNavigateSettings} className="text-[10px] font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">
                  Adjust Rules
                </button>
              </div>`;

content = content.replace(regex, newHTML).replace(regex2, newHTML2);

fs.writeFileSync(file, content);
console.log("Patched ConflictResolutionView Diagnostic Panel");
