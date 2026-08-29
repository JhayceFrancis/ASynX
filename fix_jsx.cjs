const fs = require('fs');

let ext = fs.readFileSync('src/components/ExtensionCompanionView.tsx', 'utf8');
ext = ext.replace(
  /placeholder=`http:\/\/localhost:\$\{import\.meta\.env\.VITE_PORT \|\| 3000\}`/,
  "placeholder={`http://localhost:${import.meta.env.VITE_PORT || 3000}`}"
);
fs.writeFileSync('src/components/ExtensionCompanionView.tsx', ext);

let plex = fs.readFileSync('src/components/PlexWebhookView.tsx', 'utf8');
plex = plex.replace(
  /'localhost:\$\{import\.meta\.env\.VITE_PORT \|\| 3000\}'/g,
  "`localhost:${import.meta.env.VITE_PORT || 3000}`"
);
fs.writeFileSync('src/components/PlexWebhookView.tsx', plex);

let settings = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');
settings = settings.replace(
  /'localhost:\$\{import\.meta\.env\.VITE_PORT \|\| 3000\}'/g,
  "`localhost:${import.meta.env.VITE_PORT || 3000}`"
);
fs.writeFileSync('src/components/SettingsView.tsx', settings);

console.log("Fixed JSX syntax issues.");
