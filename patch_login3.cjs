const fs = require('fs');
let code = fs.readFileSync('src/components/LoginView.tsx', 'utf8');

code = code.replace(
  'className="absolute -left-10 -bottom-10 opacity-40 dark:opacity-60 pointer-events-none"',
  'className="absolute -left-10 -bottom-10 opacity-80 dark:opacity-80 pointer-events-none"'
);

fs.writeFileSync('src/components/LoginView.tsx', code);
console.log("Patched SVG opacity");
