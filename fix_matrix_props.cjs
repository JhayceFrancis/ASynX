const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "onUndoAction={handleUndoAction}\n            />",
  "onUndoAction={handleUndoAction}\n              isEditMode={isEditMode}\n              notifications={notifications}\n            />"
);

fs.writeFileSync('src/App.tsx', content);
