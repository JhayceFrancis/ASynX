const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const defaultSyncRulesOld = `    excludedTitles: [],
    scheduledRules: []
  }
};`;

const defaultSyncRulesNew = `    excludedTitles: [],
    scheduledRules: [],
    watchlistDestination: 'local',
    customWatchlistMapping: {}
  },
  pushNotifications: {
    enabled: false,
    browserNotifications: true,
    discordWebhookUrl: "",
    appriseUrl: "",
    pushbulletToken: "",
    triggers: {
      onSyncSuccess: true,
      onSyncFailure: true,
      onConflict: true
    }
  }
};`;

code = code.replace(defaultSyncRulesOld, defaultSyncRulesNew);

const appSettingsInitOld = `  automatedBackups: dbState.appSettings?.automatedBackups || defaultSettings.automatedBackups,
  syncRules: dbState.appSettings?.syncRules || defaultSettings.syncRules
};`;

const appSettingsInitNew = `  automatedBackups: dbState.appSettings?.automatedBackups || defaultSettings.automatedBackups,
  syncRules: dbState.appSettings?.syncRules || defaultSettings.syncRules,
  pushNotifications: dbState.appSettings?.pushNotifications || defaultSettings.pushNotifications
};`;

code = code.replace(appSettingsInitOld, appSettingsInitNew);

fs.writeFileSync('server.ts', code);
console.log('Patched defaultSettings and appSettings');
