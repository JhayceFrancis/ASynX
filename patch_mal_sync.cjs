const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const searchSync = "const malRes = await fetch(`https://api.myanimelist.net/v2/anime/${animeId}/my_list_status`, {";
const replaceSync = "const malRes = await fetch(createSafeUrl(`https://api.myanimelist.net/v2/anime/${animeId}/my_list_status`, 'api.myanimelist.net'), {";

code = code.replace(searchSync, replaceSync);
fs.writeFileSync('server.ts', code);
console.log(code.includes(replaceSync) ? "Patched synchroniseToMal!" : "Failed to patch synchroniseToMal");
