const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  /syncRules: \{([\s\S]*?)autoSyncIntervalMinutes: number;/g,
  `syncRules: {$1autoSyncIntervalMinutes: number;
    syncScheduleMode?: 'interval' | 'specific_time';
    syncSpecificTime?: string;`
);

fs.writeFileSync('src/types.ts', code);
