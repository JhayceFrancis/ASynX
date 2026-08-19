const fs = require('fs');
let content = fs.readFileSync('src/components/GridLayoutEngine.tsx', 'utf8');

content = content.replace(
  /import RGL from 'react-grid-layout';\nconst \{ Responsive, WidthProvider \} = RGL;/,
  `import { Responsive, WidthProvider } from 'react-grid-layout';`
);

fs.writeFileSync('src/components/GridLayoutEngine.tsx', content);

