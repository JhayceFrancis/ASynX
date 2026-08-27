const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target1 = `return res.status(400).type('text/plain').send(\`Auth error: \${error}\`);`;
const replacement1 = `return res.status(400).json({ error: String(error) });`;
content = content.replace(target1, replacement1);

const target2 = `res.status(500).type('text/plain').send(\`Error exchanging token: \${err.message}\`);`;
const replacement2 = `res.status(500).json({ error: \`Error exchanging token: \${err.message}\` });`;
content = content.replace(target2, replacement2);

fs.writeFileSync('server.ts', content);
