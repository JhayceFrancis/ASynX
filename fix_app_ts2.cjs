const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/<Win11TitleBar appName="ASynX" isSyncing=\{isSyncing\} isOffline=\{!isOnline\} onTriggerSync=\{handleTriggerSync\} \/>/g, `<Win11TitleBar appName="ASynX" isSyncing={isSyncing} onTriggerSync={handleTriggerSync} />`);
app = app.replace(/<Win11TitleBar appName="ASynX" isSyncing=\{isSyncing\} isOffline=\{false\} onTriggerSync=\{handleTriggerSync\} \/>/g, `<Win11TitleBar appName="ASynX" isSyncing={isSyncing} onTriggerSync={handleTriggerSync} />`);

app = app.replace(/handleResolveConflict=\{\(itemId, simklEp, malEp, anilistEp, status\) => \{/g, `handleResolveConflict={(itemId, simklEp, malEp, anilistEp, applyToPlatforms) => {`);

fs.writeFileSync('src/App.tsx', app);
