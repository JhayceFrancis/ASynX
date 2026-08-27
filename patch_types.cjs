const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const target = `  daemonSettings?: {
    runOnStartup: boolean;
    enableLocalMediaDetection: boolean;
    autoScrobbleLocal: boolean; // if true, don't prompt, just scrobble
  };
  maintenanceMode?: boolean;`;

const replacement = `  daemonSettings?: {
    runOnStartup: boolean;
    enableLocalMediaDetection: boolean;
    autoScrobbleLocal: boolean; // if true, don't prompt, just scrobble
  };
  databaseManagement?: {
    autoPurgeSyncLogs: boolean;
    autoPurgeDays: number;
  };
  maintenanceMode?: boolean;`;

content = content.replace(target, replacement);
fs.writeFileSync('src/types.ts', content);
