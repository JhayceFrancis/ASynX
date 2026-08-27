import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# Make sure any manual change to the sync rules forces presetProfile to 'custom'
content = content.replace(
    "syncRules: { ...formState.syncRules, syncScheduleMode: e.target.value as 'interval' | 'specific_time' }",
    "syncRules: { ...formState.syncRules, syncScheduleMode: e.target.value as 'interval' | 'specific_time', presetProfile: 'custom' }"
)
content = content.replace(
    "syncRules: { ...formState.syncRules, syncSpecificTime: e.target.value }",
    "syncRules: { ...formState.syncRules, syncSpecificTime: e.target.value, presetProfile: 'custom' }"
)
content = content.replace(
    "syncRules: { ...formState.syncRules, autoSyncIntervalMinutes: Number(e.target.value) }",
    "syncRules: { ...formState.syncRules, autoSyncIntervalMinutes: Number(e.target.value), presetProfile: 'custom' }"
)
content = content.replace(
    "syncRules: { ...formState.syncRules, conflictPolicy: e.target.value as any }",
    "syncRules: { ...formState.syncRules, conflictPolicy: e.target.value as any, presetProfile: 'custom' }"
)
content = content.replace(
    "syncRules: { ...formState.syncRules, defaultSourceOfTruth: e.target.value as any }",
    "syncRules: { ...formState.syncRules, defaultSourceOfTruth: e.target.value as any, presetProfile: 'custom' }"
)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
