import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationTickerProps {
  notifications: NotificationItem[];
  isScrolled: boolean;
}

export const NotificationTicker: React.FC<NotificationTickerProps> = ({ notifications, isScrolled }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  

  useEffect(() => {
    if (notifications.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, 5000); // Rotate every 5 seconds
    
    return () => clearInterval(interval);
  }, [notifications.length]);

  
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
    <div className={`flex items-center overflow-hidden flex-1 ${isScrolled ? 'max-w-[200px] sm:max-w-[300px]' : 'max-w-full'} h-5 ml-4 text-[11px]`}>
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
};


export default NotificationTicker;
