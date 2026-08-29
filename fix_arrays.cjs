const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /createSafeUrl\(([^,]+),\s*\[([^\]]+)\]\)/g;
code = code.replace(regex, 'createSafeUrl($1)');

code = code.replace(/'api\.myanimelist\.net',/g, "'api.myanimelist.net',\n  'myanimelist.net',");
code = code.replace(/'graphql\.anilist\.co',/g, "'graphql.anilist.co',\n  'anilist.co',");

fs.writeFileSync('server.ts', code);
console.log("Fixed createSafeUrl array calls and updated allowed domains.");
