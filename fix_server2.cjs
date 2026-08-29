const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf8').split('\n');

// Find id.includes("
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('id.includes("') && lines[i].endsWith('id.includes("')) {
    if (lines[i+1].includes('") || id.includes("\\r")) {')) {
       lines[i] = lines[i] + '\\n' + lines[i+1];
       lines.splice(i+1, 1);
    }
  }
}

// Find regex
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('replace(/[\\r')) {
    if (lines[i+1].includes(']/g,')) {
       lines[i] = lines[i] + '\\n' + lines[i+1];
       lines.splice(i+1, 1);
       i--; // Check again in case there are multiple
    }
  }
}

// Find console.log
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === "  console.log('") {
    if (lines[i+1].includes("==============================================================='")) {
       lines[i] = "  console.log('\\n" + lines[i+1];
       lines.splice(i+1, 1);
    }
  }
}

// Remove trailing undefined
while (lines.length > 0 && lines[lines.length-1].trim() === "undefined") {
  lines.pop();
}

fs.writeFileSync('server.ts', lines.join('\n'));
