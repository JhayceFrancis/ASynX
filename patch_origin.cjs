const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const target = `    const handleMessage = async (event: MessageEvent) => {
      const updatedSettings = OAuthService.processAuthMessage(event, formState);`;

const replacement = `    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return; // CodeQL fix
      const updatedSettings = OAuthService.processAuthMessage(event, formState);`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/SettingsView.tsx', content);
