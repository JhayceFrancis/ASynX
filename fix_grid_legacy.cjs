const fs = require('fs');
let content = fs.readFileSync('src/components/GridLayoutEngine.tsx', 'utf8');

content = content.replace(
  /import \{ Responsive, Layout \} from 'react-grid-layout';/,
  `import { Responsive, WidthProvider } from 'react-grid-layout/dist/legacy.js';`
);

content = content.replace(
  /\/\/ In new RGL, maybe Responsive doesn't need WidthProvider\? Or use width=1200\nconst ResponsiveGridLayout = Responsive;/,
  `const ResponsiveGridLayout = WidthProvider(Responsive);`
);

fs.writeFileSync('src/components/GridLayoutEngine.tsx', content);

