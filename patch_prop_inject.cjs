const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target1 = `  const incomingSettings = req.body;`;

const replacement1 = `  let incomingSettingsRaw = req.body;
  // Prototype Pollution Prevention (run before deeply modifying)
  const incomingSettings = Object.create(null);
  for (const key in incomingSettingsRaw) {
    if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
      incomingSettings[key] = incomingSettingsRaw[key];
    }
  }`;

content = content.replace(target1, replacement1);

const target2 = `  // Prototype Pollution Prevention
  const safeSettings = Object.create(null);
  for (const key in incomingSettings) {
    if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
      safeSettings[key] = incomingSettings[key];
    }
  }
  
  appSettings = { ...appSettings, ...safeSettings };`;

const replacement2 = `  appSettings = { ...appSettings, ...incomingSettings };`;

content = content.replace(target2, replacement2);

fs.writeFileSync('server.ts', content);
