const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The default settings block
code = code.replace(
  /autoSyncIntervalMinutes: 15,/,
  `autoSyncIntervalMinutes: 15,
    syncScheduleMode: "interval",
    syncSpecificTime: "03:00",`
);

// The setInterval block
const intervalRegex = /setInterval\(\(\) => \{[\s\S]*?\}, DAEMON_CHECK_INTERVAL_MS\);/g;

const newIntervalLogic = `let lastSpecificTimeTrigger = "";

setInterval(() => {
  const mode = appSettings.syncRules?.syncScheduleMode || "interval";
  const now = Date.now();
  
  if (mode === "specific_time") {
    // Specific Time mode logic
    const timeTarget = appSettings.syncRules?.syncSpecificTime || "03:00";
    const dateObj = new Date();
    const currentHours = String(dateObj.getHours()).padStart(2, '0');
    const currentMins = String(dateObj.getMinutes()).padStart(2, '0');
    const currentTime = \`\${currentHours}:\${currentMins}\`;
    
    // Trigger if time matches and we haven't already triggered for this exact minute
    const timeKey = \`\${dateObj.toISOString().split('T')[0]}-\${currentTime}\`;
    if (currentTime === timeTarget && lastSpecificTimeTrigger !== timeKey) {
      lastSpecificTimeTrigger = timeKey;
      executeBackendDockerSyncDaemonCycle();
      lastCheckTime = now;
    }
  } else {
    // Interval mode logic (fallback/default)
    const intervalMinutes = appSettings.syncRules?.autoSyncIntervalMinutes || 15;
    const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;
    if (now - lastCheckTime >= intervalMs) {
      lastCheckTime = now;
      executeBackendDockerSyncDaemonCycle();
    }
  }
}, DAEMON_CHECK_INTERVAL_MS);`;

code = code.replace(intervalRegex, newIntervalLogic);

// The api endpoint status
code = code.replace(
  /intervalMinutes,/,
  'intervalMinutes, scheduleMode: appSettings.syncRules?.syncScheduleMode, specificTime: appSettings.syncRules?.syncSpecificTime,'
);

fs.writeFileSync('server.ts', code);
