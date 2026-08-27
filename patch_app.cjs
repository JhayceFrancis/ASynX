const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  "{activeTab === 'health' && <SystemHealthView isEditMode={isEditMode} />}\n          {activeTab === 'performance' && <SyncPerformanceView isEditMode={isEditMode} />}",
  "{activeTab === 'health' && <div className=\"space-y-6\"><SystemHealthView isEditMode={isEditMode} /><SyncPerformanceView isEditMode={isEditMode} /></div>}"
);
fs.writeFileSync('src/App.tsx', content);
