const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  /export import \{ LayoutDashboard \} from 'lucide-react';/,
  `import { LayoutDashboard } from 'lucide-react';\nexport `
);

fs.writeFileSync('src/components/Navbar.tsx', code);
