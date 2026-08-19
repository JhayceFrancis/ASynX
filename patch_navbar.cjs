const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// 1. Add api-docs to bottom nav
const navButtonsRegex = /<Tooltip title="System Health" position="bottom">([\s\S]*?)<\/nav>/;
const match = code.match(navButtonsRegex);
if (match) {
  const newButtons = `<Tooltip title="System Health" position="bottom">
                  <button onClick={() => setActiveTab('health')} className={\`p-2 rounded-xl transition cursor-pointer \${activeTab === 'health' ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}\`}><Activity className="w-4 h-4" /></button>
               </Tooltip>
               <Tooltip title="API Documentation" position="bottom">
                  <button onClick={() => setActiveTab('api-docs')} className={\`p-2 rounded-xl transition cursor-pointer \${activeTab === 'api-docs' ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}\`}><Terminal className="w-4 h-4" /></button>
               </Tooltip>
            </nav>`;
  code = code.replace(navButtonsRegex, newButtons);
}

// 2. Fix layout constraints.
// Let's remove px-2 from the Active Tab Display so it aligns perfectly with the ASynXLogo
code = code.replace(
  /<div className="flex items-center space-x-2 flex-shrink-0 text-gray-900 dark:text-gray-100 font-bold text-sm select-none px-2 py-1.5">/,
  '<div className="flex items-center space-x-2 flex-shrink-0 text-gray-900 dark:text-gray-100 font-bold text-sm select-none py-1.5">'
);

// Remove ml-4 from Live System Status Badges just in case, wait, it's not ml-4 anymore, it's just in the flex container. Let's check.
// Let's make sure the top container and bottom container have the exact same classes.
// Top: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3
// Bottom parent: border-t border-gray-200 dark:border-neutral-900/50 bg-transparent
// Bottom child: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none

code = code.replace(
  /<div className="border-t border-gray-200 dark:border-neutral-900\/50 px-4 sm:px-6 lg:px-8 bg-transparent">/,
  '<div className="border-t border-gray-200 dark:border-neutral-900/50 bg-transparent">'
);

code = code.replace(
  /<div className="max-w-7xl mx-auto flex items-center justify-between py-1.5 gap-4 overflow-x-auto scrollbar-none">/,
  '<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">'
);


fs.writeFileSync('src/components/Navbar.tsx', code);
