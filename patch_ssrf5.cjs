const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const search = `async function synchroniseToKarakeep(mediaId: string, episodeProgress: number, apiKey: string, apiUrl: string): Promise<boolean> {`;
const replace = `async function synchroniseToKarakeep(mediaId: string, episodeProgress: number, apiKey: string, apiUrlParam: string): Promise<boolean> {
  const apiUrl = appSettings?.karakeep?.apiUrl || apiUrlParam;`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts function signature");
} else {
  console.log("Not found");
}
