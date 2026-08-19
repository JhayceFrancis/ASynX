const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
}

fixFile('src/components/GridLayoutEngine.tsx');
fixFile('src/components/SystemHealthView.tsx');
fixFile('src/components/SyncPerformanceView.tsx');
