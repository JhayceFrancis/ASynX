const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('const [notifications,')) {
  content = content.replace(
    "const [settings, setSettings] = useState<AppSettings>({",
    "const [notifications, setNotifications] = useState<NotificationItem[]>([]);\n  const [settings, setSettings] = useState<AppSettings>({"
  );
}

// Add import for NotificationItem if missing
if (!content.includes('NotificationItem')) {
  content = content.replace("import { AppSettings,", "import { AppSettings, NotificationItem,");
}

fs.writeFileSync('src/App.tsx', content);
