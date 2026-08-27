const fs = require('fs');
let content = fs.readFileSync('src/components/ConflictResolutionView.tsx', 'utf8');

content = content.replace("Run AI Analysis", "Smart Resolve");

fs.writeFileSync('src/components/ConflictResolutionView.tsx', content);
