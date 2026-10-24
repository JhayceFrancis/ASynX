const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Change the domain so createSafeUrl allows it for testing
code = code.replace(
  "const malRes = await fetch(createSafeUrl('https://api.myanimelist.net/v2/users/@me', ['api.myanimelist.net'])",
  "const malRes = await fetch(createSafeUrl('http://localhost:8080/v2/users/@me', ['localhost'])"
);

// Actually, in the patch it was:
// const malRes = await fetch(createSafeUrl('https://api.myanimelist.net/v2/users/@me', ['api.myanimelist.net'])
// but let's check what's actually there.
