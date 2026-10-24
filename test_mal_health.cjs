const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// check health check endpoint
const check = code.match(/https:\/\/api\.myanimelist\.net\/v2\/users\/@me/g);
console.log(check ? `Found ${check.length} occurrences` : "Not found");
