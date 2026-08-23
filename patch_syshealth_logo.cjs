const fs = require('fs');
let content = fs.readFileSync('src/components/SystemHealthView.tsx', 'utf8');

if (!content.includes('ASynXLogo')) {
  content = content.replace(
    "import { GridLayoutEngine } from './GridLayoutEngine';",
    "import { GridLayoutEngine } from './GridLayoutEngine';\nimport { ASynXLogo } from './ASynXLogo';"
  );
}

const target = `<Activity className="w-6 h-6 text-indigo-500" />`;
const replace = `<ASynXLogo className="w-6 h-6 text-indigo-500" />`;

content = content.replace(target, replace);
fs.writeFileSync('src/components/SystemHealthView.tsx', content);
