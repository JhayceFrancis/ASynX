import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');
if (content.includes("https://api.myanimelist.net/v2/users/@me")) {
    console.log("Found mal authentication endpoint");
}
if (content.includes("synchroniseToMal")) {
    console.log("Found synchroniseToMal function");
}
