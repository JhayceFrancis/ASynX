const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /isSyncing=\{isSyncing\}\n\s*maintenanceMode=\{settings\.maintenanceMode\}\n\s*onRefresh=\{fetchData\}/,
  `isSyncing={isSyncing}
        isOffline={isOffline}
        maintenanceMode={settings.maintenanceMode}
        onRefresh={fetchData}`
);

fs.writeFileSync('src/App.tsx', code);
