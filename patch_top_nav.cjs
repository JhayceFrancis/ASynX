const fs = require('fs');

let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// The top row had duplicate icons for extension (Compass) and api-docs (Terminal) that are now in the bottom row.
// Let's remove them to keep it clean.
code = code.replace(
  /\{\/\* Documentation Button \*\/\}([\s\S]*?)<\/Tooltip>/,
  ''
);

code = code.replace(
  /\{\/\* Extension Companion Button \*\/\}([\s\S]*?)<\/Tooltip>/,
  ''
);

fs.writeFileSync('src/components/Navbar.tsx', code);
