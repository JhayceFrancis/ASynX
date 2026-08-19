const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

code = code.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">/,
  '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">'
);

code = code.replace(
  /<div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">/,
  '<div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">'
);

fs.writeFileSync('src/components/SettingsView.tsx', code);
