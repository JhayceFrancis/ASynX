const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<Navbar\s+activeTab=\{activeTab\}\s+setActiveTab=\{setActiveTab\}\s+isSyncing=\{isSyncing\}\s+onTriggerSync=\{handleTriggerSync\}\s+conflictCount=\{conflictItems\.length\}\s+settings=\{settings\}\s+\/>/,
  `<Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSyncing={isSyncing} 
        onTriggerSync={handleTriggerSync} 
        conflictCount={conflictItems.length} 
        settings={settings}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)} 
      />`
);

fs.writeFileSync('src/App.tsx', code);
