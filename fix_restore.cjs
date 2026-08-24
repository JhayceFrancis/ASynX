const fs = require('fs');
let lines = fs.readFileSync('restore_server.cjs', 'utf8').split('\n');
lines[25] = "  startStr.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '[\\\\s\\\\S]*?' + endStr.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')";
fs.writeFileSync('restore_server.cjs', lines.join('\n'));
