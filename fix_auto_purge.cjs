const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const target = `                setFormState(prev => ({ 
                  ...prev, 
                  databaseManagement: {
                    ...prev.databaseManagement,
                    autoPurgeSyncLogs: !(prev.databaseManagement?.autoPurgeSyncLogs ?? false)
                  }
                }));`;

const replacement = `                setFormState(prev => ({ 
                  ...prev, 
                  databaseManagement: {
                    ...prev.databaseManagement,
                    autoPurgeSyncLogs: !(prev.databaseManagement?.autoPurgeSyncLogs ?? false),
                    // Ensure autoPurgeDays always falls back to a valid number
                    autoPurgeDays: prev.databaseManagement?.autoPurgeDays ?? 30
                  }
                }));`;

if (content.includes('autoPurgeSyncLogs: !(prev.databaseManagement?.autoPurgeSyncLogs ?? false)')) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/SettingsView.tsx', content);
  console.log("Replaced target block.");
} else {
  console.log("Could not find target string.");
}
