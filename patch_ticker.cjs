const fs = require('fs');
let content = fs.readFileSync('src/components/NotificationTicker.tsx', 'utf8');

const newRender = `
  const hasNotifications = notifications.length > 0;
  const currentNotif = hasNotifications ? notifications[currentIndex] : null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case 'error': return <XCircle className="w-3.5 h-3.5 text-rose-500" />;
      default: return <Info className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div className={\`flex items-center overflow-hidden flex-1 \${isScrolled ? 'max-w-[200px] sm:max-w-[300px]' : 'max-w-full'} h-5 ml-4 text-[11px]\`}>
      {hasNotifications && (
        <>
          <Bell className="w-3.5 h-3.5 text-indigo-400 mr-2 flex-shrink-0 animate-pulse" />
          <div className="relative flex-1 h-full overflow-hidden flex items-center">
            <AnimatePresence mode="wait">
              {currentNotif && (
                <motion.div
                  key={currentNotif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center space-x-2 whitespace-nowrap"
                >
                  {getIcon(currentNotif.type)}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {currentNotif.title}
                  </span>
                  <span className="text-gray-500 dark:text-gray-500 truncate">
                    — {currentNotif.message}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
`;

const startIndex = content.indexOf('const currentNotif');
const endIndex = content.indexOf('};', startIndex);
content = content.slice(0, startIndex) + newRender + content.slice(endIndex);

// replace the dummy data logic
content = content.replace(/const displayNotifications = (.*?)\];/s, '');
content = content.replace(/displayNotifications/g, 'notifications');

fs.writeFileSync('src/components/NotificationTicker.tsx', content);
