const fs = require('fs');

// 1. App.tsx: Win11TitleBar isOffline prop issue
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/<Win11TitleBar appName="ASynX" isSyncing=\{isSyncing\} isOffline=\{!isOnline\} onTriggerSync=\{handleTriggerSync\} \/>/g, 
  `<Win11TitleBar appName="ASynX" isSyncing={isSyncing} onTriggerSync={handleTriggerSync} />`);
app = app.replace(/<Win11TitleBar appName="ASynX" isSyncing=\{isSyncing\} isOffline=\{false\} onTriggerSync=\{handleTriggerSync\} \/>/g, 
  `<Win11TitleBar appName="ASynX" isSyncing={isSyncing} onTriggerSync={handleTriggerSync} />`);

// 2. App.tsx: handleResolveConflict signature
// Current: handleResolveConflict={(itemId, simklEp, malEp, anilistEp, status) => {
// Expected: (itemId: string, targetEpisode: number, targetStatus: WatchStatus, targetScore: number, applyToPlatforms: PlatformType[]) => void
app = app.replace(
  /handleResolveConflict=\{\(itemId, simklEp, malEp, anilistEp, status\) => \{/g,
  `handleResolveConflict={(itemId, targetEpisode, targetStatus, targetScore, applyToPlatforms) => {`
);
fs.writeFileSync('src/App.tsx', app);

// 3. ConflictResolutionView.tsx: 'sourceOfTruth'
let conflict = fs.readFileSync('src/components/ConflictResolutionView.tsx', 'utf8');
conflict = conflict.replace(/settings\?\.sourceOfTruth/g, `settings?.syncRules?.primarySource`);
fs.writeFileSync('src/components/ConflictResolutionView.tsx', conflict);

// 4. SettingsView.tsx: id missing in parsedData
let settings = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');
settings = settings.replace(
  /setManualImports\(\(prev\) => \[\.\.\.prev, \{ file, parsedData: data, headers \} \]\);/g,
  `setManualImports((prev) => [...prev, { id: Math.random().toString(36).substr(2, 9), file, parsedData: data, headers } ]);`
);
fs.writeFileSync('src/components/SettingsView.tsx', settings);

// 5. SyncMatrixView.tsx: status === 'conflicts' overlap
let matrix = fs.readFileSync('src/components/SyncMatrixView.tsx', 'utf8');
matrix = matrix.replace(/m\.type === 'conflicts'/g, `m.status === 'conflicts' as any`); // Wait, maybe it's checking status instead of type?
// let's look at it closer
