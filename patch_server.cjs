const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `  daemonSettings: {
    runOnStartup: false,
    enableLocalMediaDetection: true,
    autoScrobbleLocal: false
  },
  automatedBackups: {`;

const replacement = `  daemonSettings: {
    runOnStartup: false,
    enableLocalMediaDetection: true,
    autoScrobbleLocal: false
  },
  databaseManagement: {
    autoPurgeSyncLogs: false,
    autoPurgeDays: 30
  },
  automatedBackups: {`;

content = content.replace(target, replacement);

const target2 = `  daemonSettings: dbState.appSettings?.daemonSettings || defaultSettings.daemonSettings,
  automatedBackups: dbState.appSettings?.automatedBackups || defaultSettings.automatedBackups,`;

const replacement2 = `  daemonSettings: dbState.appSettings?.daemonSettings || defaultSettings.daemonSettings,
  databaseManagement: dbState.appSettings?.databaseManagement || defaultSettings.databaseManagement,
  automatedBackups: dbState.appSettings?.automatedBackups || defaultSettings.automatedBackups,`;

content = content.replace(target2, replacement2);

fs.writeFileSync('server.ts', content);
