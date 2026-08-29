const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace('platformsAffected: ["plex"] as PlatformType[],', 'platformsAffected: [] as PlatformType[],');
fs.writeFileSync('server.ts', code);
