const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = /\{activeTab === 'performance' \{activeTab === 'performance' && \(\{activeTab === 'performance' && \( \(\n            <SyncPerformanceView \/>\n          \)\}\n          \{activeTab === 'health' \{activeTab === 'performance' && \(\{activeTab === 'performance' && \( \(\n            <SystemHealthView \/>\n          \)\}\n          \{activeTab === 'FAKE_PERFORMANCE_FOR_SED' \{activeTab === 'performance' && \(\{activeTab === 'performance' && \( \(\n            <SyncPerformanceView \/>\n          \)\}/;

const replacement = `{activeTab === 'performance' && (
            <SyncPerformanceView />
          )}
          {activeTab === 'health' && (
            <SystemHealthView />
          )}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
