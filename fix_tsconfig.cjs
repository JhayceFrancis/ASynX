const fs = require('fs');
let tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
tsconfig.compilerOptions.types = ["vite/client", "node"];
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
