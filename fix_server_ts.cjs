const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'let dbConfig = getOAuthCredentials(provider) || {};',
  'let dbConfig: any = getOAuthCredentials(provider) || {};'
);

fs.writeFileSync(file, content);
console.log("Fixed server.ts typings");
