const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

const match = content.match(/async function synchroniseToMal[\s\S]*?^}/m);
if (match) {
    console.log(match[0]);
} else {
    console.log("Not found");
}
