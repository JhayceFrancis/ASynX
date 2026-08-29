const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(/\\n\n\/\*\*/g, "\n\n/**");
fs.writeFileSync('server.ts', code);
