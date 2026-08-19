const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Add "Layout Edit Mode" button inside the nav
const newBtn = `
               {onToggleEditMode && (
                 <Tooltip title={isEditMode ? "Exit Layout Edit Mode" : "Customize Tab Layout"} position="bottom">
                    <button 
                      onClick={onToggleEditMode} 
                      className={\`p-2 rounded-xl transition cursor-pointer \${isEditMode ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}\`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                    </button>
                 </Tooltip>
               )}
            </nav>`;

code = code.replace(/<\/nav>/, newBtn);

fs.writeFileSync('src/components/Navbar.tsx', code);
