const fs = require('fs');
let content = fs.readFileSync('src/components/SyncMatrixView.tsx', 'utf8');

// Update imports
if (!content.includes('NotificationItem')) {
  content = content.replace("AppSettings", "AppSettings,\n  NotificationItem");
}

if (!content.includes('notifications?: NotificationItem[];')) {
  content = content.replace("isEditMode?: boolean;", "isEditMode?: boolean;\n  notifications?: NotificationItem[];");
}

if (!content.includes('notifications = [],')) {
  content = content.replace("isEditMode = false", "isEditMode = false,\n  notifications = []");
}

// Ensure Bell is imported
if (!content.includes('Bell,')) {
  content = content.replace("Palette, X", "Palette, X, Bell");
}

fs.writeFileSync('src/components/SyncMatrixView.tsx', content);
