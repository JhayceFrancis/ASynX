const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

const regex = /\/\/ ==========================================\n\/\/ CSRF Fetch Interceptor\n\/\/ ==========================================\n[\s\S]*?return originalFetch\(\.\.\.args\);\n};\n/m;
code = code.replace(regex, '');
fs.writeFileSync('src/main.tsx', code);
console.log("Removed monkey patch");
