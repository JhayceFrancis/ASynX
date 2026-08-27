const fs = require('fs');
let content = fs.readFileSync('README.md', 'utf8');
content = content.replace(/\\n\\n/g, '\n\n');
fs.writeFileSync('README.md', content);
