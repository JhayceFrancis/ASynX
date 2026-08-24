const fs = require('fs');
let content = fs.readFileSync('restore_server.cjs', 'utf8');
content = content.replace(/startStr\.replace\([^)]+\) \+ '\[\\\\s\\\\S\]\*\?' \+ endStr\.replace\([^)]+\)/g, 
  "startStr.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '[\\\\s\\\\S]*?' + endStr.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')"
);
fs.writeFileSync('restore_server.cjs', content);
