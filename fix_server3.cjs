const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("console.log('===============================================================")) {
    if (lines[i+1] === "');") {
      lines[i] = lines[i] + '\\n' + lines[i+1];
      lines.splice(i+1, 1);
    }
  }

  if (lines[i].includes('const delimiter = "\\r')) {
    lines[i] = '      const delimiter = "\\r\\n--" + boundary + "\\r\\n";';
    lines.splice(i+1, 2);
  }
  
  if (lines[i].includes('const close_delim = "\\r')) {
    lines[i] = '      const close_delim = "\\r\\n--" + boundary + "--";';
    lines.splice(i+1, 1);
  }

  if (lines[i].includes("'Content-Type: application/json\\r")) {
    if (lines[i+1] === "\\r") {
      lines[i] = "        'Content-Type: application/json\\r\\n\\r\\n' +";
      lines.splice(i+1, 2);
    }
  }
}

fs.writeFileSync('server.ts', lines.join('\n'));
