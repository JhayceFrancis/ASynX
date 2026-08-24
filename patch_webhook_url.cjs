const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `  appSettings = { ...appSettings, ...safeSettings };

  const now = new Date().toISOString();`;

const replacement = `  appSettings = { ...appSettings, ...safeSettings };

  // Dynamically Generate Webhook URLs based on stored configuration (e.g., Karakeep authKey)
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  if (appSettings.karakeep) {
    appSettings.karakeep.webhookUrl = appSettings.karakeep.apiKey 
      ? \`\${baseUrl}/api/webhooks/karakeep?authKey=\${appSettings.karakeep.apiKey}\`
      : \`\${baseUrl}/api/webhooks/karakeep\`;
  }

  const now = new Date().toISOString();`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
