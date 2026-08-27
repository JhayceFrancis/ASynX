const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `function persistDb() {`;

const replacement = `function purgeOldLogs() {
  if (appSettings.databaseManagement?.autoPurgeSyncLogs) {
    const days = appSettings.databaseManagement.autoPurgeDays || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffTime = cutoffDate.getTime();
    
    let purgedCount = 0;
    const originalLength = syncLogs.length;
    syncLogs = syncLogs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime >= cutoffTime;
    });
    
    if (syncLogs.length !== originalLength) {
      SystemLogger.log('maintenance', 'DB', \`Purged \${originalLength - syncLogs.length} sync logs older than \${days} days.\`);
    }
  }
}

function persistDb() {
  purgeOldLogs();`;

content = content.replace(target, replacement);

fs.writeFileSync('server.ts', content);
