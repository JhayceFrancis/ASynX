import re

with open('server.ts', 'r') as f:
    content = f.read()

old_sync_rules = """  syncRules: {
    autoSyncIntervalMinutes: 15,
    syncScheduleMode: "interval",
    syncSpecificTime: "03:00",
    conflictPolicy: "ask_user",
    defaultSourceOfTruth: "simkl",
    autoResolveWithAI: false,
    syncDramasFromSimklToMAL: false
  }"""

new_sync_rules = """  syncRules: {
    presetProfile: "hybrid",
    autoSyncIntervalMinutes: 15,
    syncScheduleMode: "interval",
    syncSpecificTime: "03:00",
    conflictPolicy: "ask_user",
    defaultSourceOfTruth: "simkl",
    autoResolveWithAI: false,
    syncDramasFromSimklToMAL: false,
    scheduledRules: []
  }"""

content = content.replace(old_sync_rules, new_sync_rules)

with open('server.ts', 'w') as f:
    f.write(content)
