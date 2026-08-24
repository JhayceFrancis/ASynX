import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, Search, Info, AlertTriangle, AlertCircle, CheckCircle2, ChevronDown, Trash2, Wrench } from 'lucide-react';

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'maintenance';
  message: string;
  category?: string;
}

interface SystemLogOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SystemLog[];
  onClearLogs?: () => void;
}

export const SystemLogOverlay: React.FC<SystemLogOverlayProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [autoScroll, setAutoScroll] = React.useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = React.useMemo(() => {
    return logs.filter(log => 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (log.category && log.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [logs, searchTerm]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll, isOpen]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-500';
      case 'warn': return 'text-yellow-500';
      case 'error': return 'text-rose-500';
      case 'success': return 'text-emerald-500';
      case 'maintenance': return 'text-purple-500';
      default: return 'text-gray-400';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info className="w-3.5 h-3.5" />;
      case 'warn': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'error': return <AlertCircle className="w-3.5 h-3.5" />;
      case 'success': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'maintenance': return <Wrench className="w-3.5 h-3.5" />;
      default: return <Info className="w-3.5 h-3.5" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 h-[45vh] bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-neutral-900 shadow-2xl flex flex-col font-mono"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-neutral-900 bg-gray-50/50 dark:bg-black/50 backdrop-blur-md">
              <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
                <Terminal className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold font-sans uppercase tracking-wider">System Log & Diagnostics</h3>
                <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                  {logs.length} events
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48 bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 rounded px-2 pl-7 py-1 text-[11px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="h-4 w-px bg-gray-300 dark:bg-neutral-800" />
                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-sans transition-colors ${autoScroll ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
                  title="Toggle Auto-Scroll"
                >
                  <ChevronDown className="w-3 h-3" />
                  <span>Auto-scroll</span>
                </button>
                {onClearLogs && (
                  <button
                    onClick={onClearLogs}
                    className="p-1 rounded text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Clear Logs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="h-4 w-px bg-gray-300 dark:bg-neutral-800" />
                <button
                  onClick={onClose}
                  className="p-1 rounded text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Log View */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-2 space-y-1 bg-[#FAFAFA] dark:bg-[#050505] text-[11px] leading-relaxed relative"
            >
              {filteredLogs.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 font-sans">
                  <Terminal className="w-8 h-8 mb-2 opacity-20" />
                  <p>No system events recorded yet.</p>
                </div>
              ) : (
                filteredLogs.map(log => (
                  <div key={log.id} className="flex group hover:bg-white dark:hover:bg-neutral-900/50 px-2 py-0.5 rounded transition-colors break-all">
                    <div className="w-20 shrink-0 text-gray-400 dark:text-gray-500 select-none">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className={`w-6 shrink-0 flex justify-center mt-0.5 ${getLevelColor(log.level)}`}>
                      {getLevelIcon(log.level)}
                    </div>
                    <div className="flex-1 text-gray-700 dark:text-gray-300 ml-2">
                      {log.category && (
                        <span className="font-bold text-gray-500 dark:text-gray-400 mr-2 select-none">[{log.category}]</span>
                      )}
                      <span className={log.level === 'error' ? 'text-red-600 dark:text-red-400' : ''}>
                        {log.message}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
