const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `app.post("/api/webhooks/karakeep", (req, res) => {
  console.log("[KaraKeep Webhook] Received payload:", req.body);`;

const replacement = `app.post("/api/webhooks/karakeep", (req, res) => {
  console.log("[KaraKeep Webhook] Received payload:", req.body);
  
  // Validate Authentication Key if configured
  if (appSettings.karakeep?.apiKey && req.query.authKey !== appSettings.karakeep.apiKey) {
    console.warn("[KaraKeep Webhook] Unauthorized attempt. Invalid or missing authKey.");
    return res.status(401).json({ success: false, error: "Unauthorized. Invalid authKey parameter." });
  }`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
