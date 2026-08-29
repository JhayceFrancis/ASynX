const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// replace url.parse( with new URL(
code = code.replace(/url\.parse\(/g, 'new URL(');

fs.writeFileSync('server.ts', code);
console.log("Fixed url.parse");
