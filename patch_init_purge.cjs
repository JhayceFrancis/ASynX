const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `let extensionState: BrowserExtensionState = dbState.extensionState || {`;

const replacement = `let extensionState: BrowserExtensionState = dbState.extensionState || {`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
