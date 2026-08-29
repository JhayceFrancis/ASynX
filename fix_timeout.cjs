const fs = require('fs');
let code = fs.readFileSync('src/components/SecureCredentialManager.tsx', 'utf8');
code = code.replace(/:\$\{import\.meta\.env\.VITE_PORT \|\| 3000\}/g, '3000');
fs.writeFileSync('src/components/SecureCredentialManager.tsx', code);
console.log("Fixed SecureCredentialManager");
