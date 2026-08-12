import React, { useState } from 'react';

interface TooltipProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  description,
  children,
  position = 'bottom',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2'
  };

  return (
    <div 
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          role="tooltip"
          className={`absolute z-50 w-64 p-2.5 rounded-xl bg-gray-900/95 dark:bg-black/95 text-white border border-gray-700/80 dark:border-neutral-800 shadow-2xl backdrop-blur-md pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95 ${positionClasses[position]}`}
        >
          <div className="font-bold text-xs text-indigo-400 dark:text-indigo-300 mb-0.5 flex items-center gap-1.5">
            <span>{title}</span>
          </div>
          {description && (
            <p className="text-[11px] leading-snug text-gray-300 dark:text-gray-400 font-normal">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
