const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const dispatchFn = `
  const dispatchNotification = async (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const notifItem = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [notifItem, ...prev].slice(0, 50)); // Keep last 50

    // Native Browser Notification (Fallback for Desktop OS)
    if (settings.pushNotifications?.browserNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(\`ASynX: \${title}\`, { body: message });
      }
    }

    // Webhook Integrations
    try {
      fetch('/api/notifications/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type, settings })
      });
    } catch (e) {
      console.error("Failed to dispatch webhook notifications", e);
    }
  };
`;

content = content.replace("const handleConfirmBulkSync = async () => {", dispatchFn + "\n  const handleConfirmBulkSync = async () => {");

// Inject inside handleConfirmBulkSync
content = content.replace(
  "addToast('success', 'Sync Successful', 'API calls validated and records synchronized successfully.');",
  "addToast('success', 'Sync Successful', 'API calls validated and records synchronized successfully.');\n        dispatchNotification('Sync Successful', 'Bulk synchronization completed without errors.', 'success');"
);

content = content.replace(
  "addToast('error', 'Sync Failed', 'API validation failed during synchronization.');",
  "addToast('error', 'Sync Failed', 'API validation failed during synchronization.');\n      dispatchNotification('Sync Failed', 'An error occurred during bulk synchronization.', 'error');"
);

// Inject inside handleTriggerSyncItem
content = content.replace(
  "addToast('success', 'Item Synced', `Successfully synchronized ${item?.title || itemId}`);",
  "addToast('success', 'Item Synced', `Successfully synchronized ${item?.title || itemId}`);\n      dispatchNotification('Item Synced', `Successfully synchronized ${item?.title || 'item'}.`, 'success');"
);

content = content.replace(
  "addToast('error', 'Sync Failed', `Failed to synchronize ${item?.title || itemId}`);",
  "addToast('error', 'Sync Failed', `Failed to synchronize ${item?.title || itemId}`);\n      dispatchNotification('Sync Failed', `Failed to synchronize ${item?.title || 'item'}.`, 'error');"
);

// Add global enablement default in AppSettings state init if not present
content = content.replace(
  "const [settings, setSettings] = useState<AppSettings>(() => {",
  `const [settings, setSettings] = useState<AppSettings>(() => {
    const handlePushNotificationSupport = (parsed: any) => {
      if (!parsed.pushNotifications) {
        parsed.pushNotifications = {
          enabled: true,
          browserNotifications: false,
          discordWebhookUrl: '',
          appriseUrl: '',
          pushbulletToken: '',
          triggers: { onSyncSuccess: true, onSyncFailure: true, onConflict: true }
        };
      }
      return parsed;
    };`
);

content = content.replace(
  "try { return JSON.parse(saved); } catch (e) {}",
  "try { return handlePushNotificationSupport(JSON.parse(saved)); } catch (e) {}"
);

fs.writeFileSync('src/App.tsx', content);
