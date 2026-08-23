const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// 1. Add karakeep to platformsAffected everywhere we do simkl/mal/anilist
content = content.replace(/\["simkl", "mal", "anilist"\]/g, '["simkl", "mal", "anilist", "karakeep"]');

// 2. Make sure daemon cycle also includes karakeep in auto-sync
content = content.replace(/\(\['simkl', 'mal', 'anilist'\] as PlatformType\[\]\)\.forEach/g, "(['simkl', 'mal', 'anilist', 'karakeep'] as PlatformType[]).forEach");

fs.writeFileSync('server.ts', content);
