import re

with open('server.ts', 'r') as f:
    content = f.read()

daemon_logic_old = """setInterval(() => {
  const mode = appSettings.syncRules?.syncScheduleMode || "interval";
  const now = Date.now();
  
  if (mode === "specific_time") {
    // Specific Time mode logic
    const timeTarget = appSettings.syncRules?.syncSpecificTime || "03:00";
    const dateObj = new Date();
    const currentHours = String(dateObj.getHours()).padStart(2, '0');
    const currentMins = String(dateObj.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMins}`;
    
    // Trigger if time matches and we haven't already triggered for this exact minute
    const timeKey = `${dateObj.toISOString().split('T')[0]}-${currentTime}`;
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
}, DAEMON_CHECK_INTERVAL_MS);"""

daemon_logic_new = """let lastScheduledTriggers = new Set<string>();

setInterval(() => {
  const now = Date.now();
  const dateObj = new Date();
  const currentHours = String(dateObj.getHours()).padStart(2, '0');
  const currentMins = String(dateObj.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHours}:${currentMins}`;
  const dayPrefix = dateObj.toISOString().split('T')[0];

  const profile = appSettings.syncRules?.presetProfile;

  if (profile === "custom" && appSettings.syncRules?.scheduledRules && appSettings.syncRules.scheduledRules.length > 0) {
     // Custom Scheduled Routes Mode
     for (const rule of appSettings.syncRules.scheduledRules) {
        if (!rule.enabled) continue;
        const timeKey = `${dayPrefix}-${currentTime}-${rule.id}`;
        if (currentTime === rule.time && !lastScheduledTriggers.has(timeKey)) {
           lastScheduledTriggers.add(timeKey);
           // Specifically execute a partial sync here if requested, or full cycle (we'll do full for now and log it)
           SystemLogger.info("Daemon", `Triggering custom scheduled route: ${rule.source} -> ${rule.target} at ${currentTime}`);
           executeBackendDockerSyncDaemonCycle();
           lastCheckTime = now;
        }
     }
  } else {
     // Legacy Fallback Mode (Interval or Specific Time)
     const mode = appSettings.syncRules?.syncScheduleMode || "interval";
     if (mode === "specific_time") {
       const timeTarget = appSettings.syncRules?.syncSpecificTime || "03:00";
       const timeKey = `${dayPrefix}-${currentTime}-legacy`;
       if (currentTime === timeTarget && !lastScheduledTriggers.has(timeKey)) {
         lastScheduledTriggers.add(timeKey);
         executeBackendDockerSyncDaemonCycle();
         lastCheckTime = now;
       }
     } else {
       const intervalMinutes = appSettings.syncRules?.autoSyncIntervalMinutes || 15;
       const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;
       if (now - lastCheckTime >= intervalMs) {
         lastCheckTime = now;
         executeBackendDockerSyncDaemonCycle();
       }
     }
  }

  // Clear memory of triggers older than today to prevent memory leak
  if (lastScheduledTriggers.size > 1000) {
      const ArrayTriggers = Array.from(lastScheduledTriggers);
      lastScheduledTriggers = new Set(ArrayTriggers.slice(ArrayTriggers.length - 100));
  }
}, DAEMON_CHECK_INTERVAL_MS);"""

content = content.replace(daemon_logic_old, daemon_logic_new)

with open('server.ts', 'w') as f:
    f.write(content)
