const fs = require('fs');
let code = fs.readFileSync('src/components/ExtensionCompanionView.tsx', 'utf8');

code = code.replace(
  /<button \s*onClick=\{\(\) => setIsEditingMatch\(true\)\} \s*className="text-\[10px\] font-bold text-indigo-500 hover:text-indigo-400 transition flex items-center space-x-1 cursor-pointer"\s*>\s*<Sliders className="w-3 h-3" \/>\s*<span>Correct Mismatch<\/span>\s*<\/button>/,
  `<button 
      onClick={() => setIsEditingMatch(true)} 
      className="text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 px-2.5 py-1 rounded-md transition flex items-center space-x-1 cursor-pointer border border-indigo-500/20"
    >
      <Sliders className="w-3 h-3" />
      <span>Correct Mismatch</span>
    </button>`
);

fs.writeFileSync('src/components/ExtensionCompanionView.tsx', code);
