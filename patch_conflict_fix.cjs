const fs = require('fs');
const file = 'src/components/ConflictResolutionView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('Failed completion threshold (55% < 80%)', 'Failed completion threshold (55% &lt; 80%)');
fs.writeFileSync(file, content);
console.log("Fixed JSX error");
