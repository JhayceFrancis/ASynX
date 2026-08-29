const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');
code = code.replace(
    "port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT, 10) : 4000,",
    "port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT, 10) : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000),"
);
fs.writeFileSync('vite.config.ts', code);
console.log("Patched vite.config.ts");
