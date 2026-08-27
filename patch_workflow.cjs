const fs = require('fs');
let content = fs.readFileSync('.github/workflows/electron-ci.yml', 'utf8');

content = content.replace('jobs:', 'permissions:\n  contents: read\n\njobs:');
fs.writeFileSync('.github/workflows/electron-ci.yml', content);
