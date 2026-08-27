const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

content = content.replace(
  "toggleDarkMode\n}) => {",
  "toggleDarkMode,\n  notifications = [],\n}) => {"
);

fs.writeFileSync('src/components/Navbar.tsx', content);
