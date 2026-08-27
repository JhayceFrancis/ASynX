const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('const [notifications, setNotifications]')) {
  // Add notifications state near other states
  content = content.replace(
    "const [settings, setSettings] = useState<AppSettings>(() => {",
    "const [notifications, setNotifications] = useState<any[]>([]);\n  const [settings, setSettings] = useState<AppSettings>(() => {"
  );

  // Pass to Navbar
  content = content.replace(
    "toggleDarkMode={() => setIsDarkMode(!isDarkMode)}",
    "toggleDarkMode={() => setIsDarkMode(!isDarkMode)}\n          notifications={notifications}"
  );

  // Pass to SyncMatrixView
  content = content.replace(
    "<SyncMatrixView isEditMode={isEditMode} items={items} logs={logs} settings={settings}",
    "<SyncMatrixView isEditMode={isEditMode} items={items} logs={logs} settings={settings} notifications={notifications}"
  );
}

fs.writeFileSync('src/App.tsx', content);
