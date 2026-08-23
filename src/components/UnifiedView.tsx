import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface UnifiedViewProps {
  title: string;
  icon: React.ReactNode;
  tabs: { id: string; label: string; icon: React.ReactNode; component: React.ReactNode }[];
}

export const UnifiedView: React.FC<UnifiedViewProps> = ({ title, icon, tabs }) => {
  const [activeSubTab, setActiveSubTab] = useState(tabs[0].id);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
          {icon}
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                activeSubTab === tab.id
                  ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {tabs.map((tab) => activeSubTab === tab.id && (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-y-auto"
            >
              {tab.component}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
