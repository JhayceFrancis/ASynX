import re

with open('src/types.ts', 'r') as f:
    content = f.read()

new_sync_rules = """  syncRules: {
    presetProfile?: 'aggressive' | 'manual' | 'hybrid' | 'custom';
    autoSyncIntervalMinutes: number;
    syncScheduleMode?: 'interval' | 'specific_time';
    syncSpecificTime?: string;
    conflictPolicy: 'ask_user' | 'source_of_truth' | 'highest_episode';
    defaultSourceOfTruth: PlatformType;
    autoResolveWithAI: boolean;
    syncDramasFromSimklToMAL: boolean;
    scheduledRules?: Array<{
      id: string;
      source: string;
      target: string;
      time: string;
      enabled: boolean;
    }>;
  };"""

content = re.sub(r'  syncRules: \{.*?\  \};', new_sync_rules, content, flags=re.DOTALL)

with open('src/types.ts', 'w') as f:
    f.write(content)
