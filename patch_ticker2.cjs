const fs = require('fs');
let content = fs.readFileSync('src/components/NotificationTicker.tsx', 'utf8');

const lines = content.split('\\n');
content = lines.slice(0, 71).join('\\n') + '\\n\\nexport default NotificationTicker;\\n';

fs.writeFileSync('src/components/NotificationTicker.tsx', content);
