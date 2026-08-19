const fs = require('fs');

let content = fs.readFileSync('src/components/GridLayoutEngine.tsx', 'utf8');

// Replace WidthProvider if it's missing, wait, in v2 of react-grid-layout maybe it's useContainerWidth or WidthProvider is in legacy?
content = content.replace(
  /import { Responsive, WidthProvider, Layout } from 'react-grid-layout';/,
  `import { Responsive, Layout } from 'react-grid-layout';`
);

content = content.replace(
  /const ResponsiveGridLayout = WidthProvider\(Responsive\);/,
  `// In new RGL, maybe Responsive doesn't need WidthProvider? Or use width=1200
const ResponsiveGridLayout = Responsive;`
);

// We need to type 'Layout' properly or handle any for currentLayout.
content = content.replace(
  /const handleLayoutChange = \(currentLayout: Layout\[\], allLayouts: any\) => \{/,
  `const handleLayoutChange = (currentLayout: any[], allLayouts: any) => {`
);

fs.writeFileSync('src/components/GridLayoutEngine.tsx', content);

