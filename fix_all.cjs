const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Remove the wrongly placed karakeep snippet
const badSnippet = `  if (incomingSettings?.karakeep) {
    const baseUrl = process.env.APP_URL || \`http://\${req.headers.host}\`;
    incomingSettings.karakeep.webhookUrl = incomingSettings.karakeep.apiKey 
      ? \`\${baseUrl}/api/webhooks/karakeep?authKey=\${incomingSettings.karakeep.apiKey}\`
      : \`\${baseUrl}/api/webhooks/karakeep\`;
  }

`;
code = code.replace(badSnippet, "");

// Place it correctly at the end of the API validation blocks
const properTarget = `  // Prototype Pollution Prevention`;
// We'll just replace the last occurrence of Prototype Pollution Prevention, wait,
// I'll just look for `  appSettings = { ...appSettings, ...safeSettings };`
const correctInsertionTarget = `  appSettings = { ...appSettings, ...safeSettings };`;
const correctSnippet = `  if (incomingSettings?.karakeep) {
    const baseUrl = process.env.APP_URL || \`http://\${req.headers.host}\`;
    incomingSettings.karakeep.webhookUrl = incomingSettings.karakeep.apiKey 
      ? \`\${baseUrl}/api/webhooks/karakeep?authKey=\${incomingSettings.karakeep.apiKey}\`
      : \`\${baseUrl}/api/webhooks/karakeep\`;
  }

  appSettings = { ...appSettings, ...safeSettings };`;
code = code.replace(correctInsertionTarget, correctSnippet);


// Also fix requireAuth to allow /api/auth/
const authTarget = `        req.path.startsWith('/api/webhooks/') ||`;
const authReplace = `        req.path.startsWith('/api/auth/') ||
        req.path.startsWith('/api/webhooks/') ||`;
code = code.replace(authTarget, authReplace);

fs.writeFileSync('server.ts', code);
console.log('Fixed all!');
