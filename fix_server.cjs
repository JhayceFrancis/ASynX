const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Fix string literal splits
content = content.replace('id.includes(""\n|| id.includes("\\r"))', 'id.includes("\\n") || id.includes("\\r"))');
content = content.replace('id.includes(""\n|| id.includes("\\r"))', 'id.includes("\\n") || id.includes("\\r"))'); // in case it's different spacing

// Actually, let's just do regex
content = content.replace(/id\.includes\(""\n\|\|\ id\.includes\("\\r"\)\)/g, 'id.includes("\\n") || id.includes("\\r"))');
content = content.replace(/id\.includes\(""\r?\n\|\|\ id\.includes\("\\r"\)\)/g, 'id.includes("\\n") || id.includes("\\r"))');
content = content.replace(/id\.includes\(""\n\s*\|\|\ id\.includes\("\\r"\)\)/g, 'id.includes("\\n") || id.includes("\\r"))');

// Fix the literal one
content = content.replace(/if \(id\.includes\("\.\."\) \|\| id\.includes\("\?"\) \|\| id\.includes\("\#"\) \|\| id\.includes\(""\n\|\| id\.includes\("\\r"\)\) \{/, 
  'if (id.includes("..") || id.includes("?") || id.includes("#") || id.includes("\\n") || id.includes("\\r")) {');

// Fix regexes
content = content.replace(/replace\(\/\[\\r\n\]\/g/g, "replace(/[\\n\\r]/g");
content = content.replace(/\[\\r\n\]/g, "[\\n\\r]");

// Fix console.log
content = content.replace(/console\.log\('\n==============================================================='\);/g, "console.log('\\n===============================================================');");

fs.writeFileSync('server.ts', content);
