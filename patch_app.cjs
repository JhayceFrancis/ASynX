const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importTarget = `import { DockerBackendView } from './components/DockerBackendView';`;
const importReplacement = `import { DockerBackendView } from './components/DockerBackendView';
import { SystemHealthView } from './components/SystemHealthView';`;

const tabTarget = `const [activeTab, setActiveTab] = useState<'matrix' | 'conflicts' | 'plex' | 'extension' | 'settings' | 'api-docs' | 'docker-backend' | 'performance'>(() => {`;
const tabReplacement = `const [activeTab, setActiveTab] = useState<'matrix' | 'conflicts' | 'plex' | 'extension' | 'settings' | 'api-docs' | 'docker-backend' | 'performance' | 'health'>(() => {`;

const renderTarget = `          {activeTab === 'performance' && (
            <SyncPerformanceView
              items={libraryItems}
              logs={syncLogs}
              onRefreshData={fetchData}
              settings={settings}
              onNavigateSettings={() => setActiveTab('settings')}
            />
          )}`;
const renderReplacement = `          {activeTab === 'performance' && (
            <SyncPerformanceView
              items={libraryItems}
              logs={syncLogs}
              onRefreshData={fetchData}
              settings={settings}
              onNavigateSettings={() => setActiveTab('settings')}
            />
          )}

          {activeTab === 'health' && (
            <SystemHealthView />
          )}`;

code = code.replace(importTarget, importReplacement);
code = code.replace(tabTarget, tabReplacement);
code = code.replace(renderTarget, renderReplacement);

fs.writeFileSync('src/App.tsx', code);
