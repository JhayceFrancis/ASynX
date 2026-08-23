const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

// Replace duplicate types occurring on consecutive lines
content = content.replace(/<button type="button"\n(.*)type="button"/g, '<button \n$1type="button"');
content = content.replace(/<button type="button" \n(.*)type="button"/g, '<button \n$1type="button"');
content = content.replace(/<button type="button"(.*)\n(.*)type="button"/g, '<button $1\n$2type="button"');

fs.writeFileSync('src/components/SettingsView.tsx', content);
