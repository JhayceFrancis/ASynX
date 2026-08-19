const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /nav \{\n          background-color: var\(--header-bg\) !important;\n        \}/g,
  `header, .win11-titlebar-container, nav {
          background-color: var(--header-bg) !important;
        }`
);
fs.writeFileSync('src/App.tsx', code);
