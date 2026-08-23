const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Fix 1: Type 'log' as WebhookLog
content = content.replace('const log = {', 'const log: WebhookLog = {');
content = content.replace('source: "karakeep",\n    event: event,', 'source: "karakeep",\n    event: event as any,'); // ensure event is compatible

// Fix 2: add 'as PlatformType[]'
content = content.replace('platformsAffected: ["simkl", "mal", "anilist", "karakeep"],', 'platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],');

fs.writeFileSync('server.ts', content);
