const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace('background-color: var(--header-bg) !important;', 'background: var(--header-bg) !important;');

fs.writeFileSync('src/App.tsx', content);
