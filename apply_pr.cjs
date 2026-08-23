const fs = require('fs');

// 1. App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  /const handleSubmitOverride = async \(itemId: string, simklEp: number, malEp: number, anilistEp: number, status: WatchStatus\) => \{[\s\S]*?body: JSON.stringify\(\{ itemId, simklEp, malEp, anilistEp, status \}\)/m,
  "const handleSubmitOverride = async (\n    itemId: string,\n    targetEpisode: number,\n    targetStatus: WatchStatus,\n    targetScore: number,\n    applyToPlatforms: PlatformType[]\n  ) => {\n    try {\n      const res = await fetch('/api/sync/override', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ itemId, targetEpisode, targetStatus, targetScore, applyToPlatforms })"
);
fs.writeFileSync('src/App.tsx', appCode);

// 3. ConflictResolutionView.tsx
let conflictCode = fs.readFileSync('src/components/ConflictResolutionView.tsx', 'utf8');
conflictCode = conflictCode.replace(
  /const initialSOT = \(settings\?\.syncRules\?\.defaultSourceOfTruth \|\| settings\?\.syncRules\?\.primarySource \|\| 'anilist'\) as 'anilist' \| 'simkl' \| 'mal' \| 'highest_episode';/g,
  "const initialSOT = (settings?.syncRules?.defaultSourceOfTruth || 'anilist') as 'anilist' | 'simkl' | 'mal' | 'highest_episode';"
);
conflictCode = conflictCode.replace(
  /const sot = \(settings\.syncRules\?\.defaultSourceOfTruth \|\| settings\.sourceOfTruth \|\| 'anilist'\) as 'anilist' \| 'simkl' \| 'mal' \| 'highest_episode';/g,
  "const sot = (settings.syncRules?.defaultSourceOfTruth || 'anilist') as 'anilist' | 'simkl' | 'mal' | 'highest_episode';"
);
fs.writeFileSync('src/components/ConflictResolutionView.tsx', conflictCode);

// 4. SettingsView.tsx
let settingsCode = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');
settingsCode = settingsCode.replace(
  /setImportState\(\{ file, parsedData, headers \}\);/g,
  "setImportState({ id: `${file.name}-${Date.now()}`, file, parsedData, headers });"
);
fs.writeFileSync('src/components/SettingsView.tsx', settingsCode);

// 5. SyncMatrixView.tsx
let matrixCode = fs.readFileSync('src/components/SyncMatrixView.tsx', 'utf8');
matrixCode = matrixCode.replace(
  /if \(activeFilter !== 'all' && activeFilter !== 'history' && activeFilter !== 'conflicts'\) return item\.mediaType === activeFilter;/g,
  "if (activeFilter !== 'all' && activeFilter !== 'history') return item.mediaType === activeFilter;"
);
matrixCode = matrixCode.replace(
  /<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">\{log\.message\}<\/p>/g,
  '<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{log.message ?? log.details}</p>'
);
matrixCode = matrixCode.replace(
  /onClick=\{\(\) => onUndoAction\(log\.itemId\)\}/g,
  "onClick={() => onUndoAction(log.itemId ?? log.id)}"
);
fs.writeFileSync('src/components/SyncMatrixView.tsx', matrixCode);

// 6. Win11TitleBar.tsx
let titleBarCode = fs.readFileSync('src/components/Win11TitleBar.tsx', 'utf8');
titleBarCode = titleBarCode.replace(
  /isSyncing\?: boolean;/,
  "isSyncing?: boolean;\n  isOffline?: boolean;"
);
fs.writeFileSync('src/components/Win11TitleBar.tsx', titleBarCode);

// 7. types.ts
let typesCode = fs.readFileSync('src/types.ts', 'utf8');
typesCode = typesCode.replace(
  /id: string;\n  timestamp: string;/,
  "id: string;\n  itemId?: string;\n  timestamp: string;"
);
typesCode = typesCode.replace(
  /status: 'success' \| 'conflict' \| 'warning' \| 'failed';\n  details: string;/,
  "status: 'success' | 'conflict' | 'warning' | 'failed';\n  message?: string;\n  details: string;"
);
fs.writeFileSync('src/types.ts', typesCode);

console.log("Applied PR20/21 changes");
