const fs = require('fs');
const map = JSON.parse(fs.readFileSync('dist/server.cjs.map', 'utf8'));
const index = map.sources.findIndex(s => s.endsWith('server.ts') || s === 'server.ts');
if (index !== -1) {
  fs.writeFileSync('server.ts', map.sourcesContent[index]);
  console.log("Restored server.ts from sourcemap!");
} else {
  console.log("Could not find server.ts in sourcemap.");
}
