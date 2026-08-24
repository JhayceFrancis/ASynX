const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

content = content.replace(
  'value={formState.karakeep.webhookUrl || \\`\\${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/webhooks/karakeep?authKey=\\${formState.karakeep.apiKey || \'\'}\\`}',
  'value={formState.karakeep.webhookUrl || `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/webhooks/karakeep?authKey=${formState.karakeep.apiKey || \'\'}`}'
);

fs.writeFileSync('src/components/SettingsView.tsx', content);
