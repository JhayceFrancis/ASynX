const fs = require('fs');
let content = fs.readFileSync('src/components/GridLayoutEngine.tsx', 'utf8');

content = content.replace(
  /import \{ Responsive, WidthProvider \} from 'react-grid-layout\/dist\/legacy\.js';/,
  `import RGL from 'react-grid-layout';
const { Responsive, WidthProvider } = RGL;`
);

fs.writeFileSync('src/components/GridLayoutEngine.tsx', content);

