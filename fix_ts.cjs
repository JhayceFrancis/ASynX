const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'async function dispatchPushNotifications(title, message, type) {',
  'async function dispatchPushNotifications(title: string, message: string, type: "info"|"success"|"warning"|"error") {'
);

code = code.replace(
  'async function triggerOutboundSync(item, targetEpisode) {',
  'async function triggerOutboundSync(item: LibraryItem, targetEpisode: number) {'
);

fs.writeFileSync('server.ts', code);
console.log("Types fixed in server.ts");
