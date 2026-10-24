const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Actually, in the patch it was:
// const malRes = await fetch(createSafeUrl('https://api.myanimelist.net/v2/users/@me', ['api.myanimelist.net'])
// but let's check what's actually there.
