const fs = require('fs');

let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

// 1. Remove the stray opening div from near the end:
content = content.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-6">\s*\{\/\* Danger Zone \*\/\}/, '{/* Danger Zone */}');

// 2. Put the opening div back above Section 1
content = content.replace('{/* Section 1: Simkl API Config */}', '<div className="grid grid-cols-1 md:grid-cols-2 gap-6">\n        {/* Section 1: Simkl API Config */}');

fs.writeFileSync('src/components/SettingsView.tsx', content);
