const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Import
content = content.replace(
  "const SyncMatrixView = React.lazy(() => import('./components/SyncMatrixView').then(module => ({ default: module.SyncMatrixView })));",
  "const SyncMatrixView = React.lazy(() => import('./components/SyncMatrixView').then(module => ({ default: module.SyncMatrixView })));\nimport { SyncScheduleView } from './components/SyncScheduleView';"
);

// Add the view rendering block
const scheduleRender = `          {activeTab === 'schedule' && (
            <SyncScheduleView 
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}`;

content = content.replace(
  "          {activeTab === 'plex' && (",
  scheduleRender + "\n          {activeTab === 'plex' && ("
);

fs.writeFileSync('src/App.tsx', content);
