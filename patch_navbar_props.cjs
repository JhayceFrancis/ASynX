const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Update imports
if (!content.includes('NotificationItem')) {
  content = content.replace("import { AppSettings, BrowserExtensionState } from '../types';", "import { AppSettings, BrowserExtensionState, NotificationItem } from '../types';\nimport NotificationTicker from './NotificationTicker';");
}

// Update props
content = content.replace(
  "toggleDarkMode: () => void;\n}",
  "toggleDarkMode: () => void;\n  notifications?: NotificationItem[];\n}"
);

content = content.replace(
  "  toggleDarkMode,\n}) => {",
  "  toggleDarkMode,\n  notifications = [],\n}) => {"
);

fs.writeFileSync('src/components/Navbar.tsx', content);
