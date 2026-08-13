import React, { useState } from 'react';

export interface ASynXLogoProps {
  className?: string;
  animated?: boolean;
  onClick?: () => void;
  title?: string;
  interactive?: boolean;
}

export const ASynXLogo: React.FC<ASynXLogoProps> = ({ 
  className = "w-8 h-8", 
  animated = false,
  onClick,
  title = "ASynX Synchronization Engine — Click to trigger manual sync cycle",
  interactive = true
}) => {
  const [localActive, setLocalActive] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (interactive) {
      setLocalActive(true);
      setTimeout(() => setLocalActive(false), 1500);
    }
    if (onClick) {
      onClick();
    }
  };

  const isAnimating = animated || localActive;

  return (
    <div 
      className={`inline-flex items-center justify-center transition-all duration-300 ${interactive ? 'cursor-pointer hover:scale-110 active:scale-95 group' : ''}`}
      onClick={handleClick}
      title={title}
      role={onClick ? "button" : "img"}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
    >
      <svg 
        viewBox="0 0 400 400" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} overflow-visible transition-transform duration-500`}
      >
        <style>
          {`
            @keyframes asynx-dash-flow {
              0% { stroke-dashoffset: 600; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes asynx-pulse-glow {
              0%, 100% { opacity: 0.85; filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.6)); }
              50% { opacity: 1; filter: drop-shadow(0 0 16px rgba(168, 85, 247, 0.95)); }
            }
            @keyframes asynx-spin-sync {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes asynx-float-gentle {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-3px) scale(1.02); }
            }

            .asynx-animated-flow {
              stroke-dasharray: 250 80;
              animation: asynx-dash-flow 2.5s linear infinite;
            }

            .asynx-animated-glow {
              animation: asynx-pulse-glow 2s ease-in-out infinite;
            }

            .asynx-animated-spin {
              transform-origin: 200px 200px;
              animation: asynx-spin-sync 6s linear infinite;
            }

            .asynx-animated-float {
              transform-origin: 200px 200px;
              animation: asynx-float-gentle 3.5s ease-in-out infinite;
            }
          `}
        </style>
        <defs>
          {/* High compatibility Cross-Browser Energy Gradients */}
          <linearGradient id="asynx-upper-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7B2CBF" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#FF007F" />
          </linearGradient>

          <linearGradient id="asynx-lower-grad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF007F" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#7B2CBF" />
          </linearGradient>

          <linearGradient id="asynx-main-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0E7FF" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>

          {/* Clean ambient drop blur */}
          <filter id="asynx-glow-filter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Orbit Sync Energy Ring (Active when syncing or triggered) */}
        {isAnimating && (
          <circle 
            cx="200" 
            cy="200" 
            r="185" 
            stroke="url(#asynx-upper-grad)" 
            strokeWidth="5" 
            strokeDasharray="45 135" 
            fill="none" 
            opacity="0.8"
            className="asynx-animated-spin"
          />
        )}

        {/* Main Logo Graphic Group */}
        <g className={isAnimating ? "asynx-animated-float" : ""}>
          
          {/* Shadow / Base Structure Bar */}
          <path 
            d="M 180,380 L 280,130" 
            stroke="#1E1B4B" 
            strokeWidth="32" 
            strokeLinecap="round" 
            opacity="0.35"
          />

          {/* Lower Loop / Sync Energy Arrow */}
          <path 
            d="M 200,320 C 170,320 130,310 100,290 L 100,260" 
            stroke="url(#asynx-lower-grad)" 
            strokeWidth="22" 
            strokeLinecap="round" 
            fill="none"
            className={isAnimating ? "asynx-animated-flow" : ""}
          />
          <polygon 
            points="100,250 122,275 78,275" 
            fill="#818CF8" 
            className={isAnimating ? "asynx-animated-glow" : ""}
          />

          {/* Main 'A' Structure - Left Bar */}
          <path 
            d="M 100,350 L 200,100" 
            stroke="url(#asynx-main-grad)" 
            strokeWidth="28" 
            strokeLinecap="round" 
            className={isAnimating ? "asynx-animated-glow" : ""}
            filter="url(#asynx-glow-filter)"
          />

          {/* Main 'A' Structure - Right Bar */}
          <path 
            d="M 200,100 L 300,350" 
            stroke="url(#asynx-main-grad)" 
            strokeWidth="28" 
            strokeLinecap="round" 
            className={isAnimating ? "asynx-animated-glow" : ""}
            filter="url(#asynx-glow-filter)"
          />

          {/* Upper Loop / Sync Energy Arrow */}
          <path 
            d="M 200,80 C 230,80 270,90 300,110 L 300,140" 
            stroke="url(#asynx-upper-grad)" 
            strokeWidth="22" 
            strokeLinecap="round" 
            fill="none"
            className={isAnimating ? "asynx-animated-flow" : ""}
          />
          <polygon 
            points="300,150 278,125 322,125" 
            fill="#FF007F" 
            className={isAnimating ? "asynx-animated-glow" : ""}
          />

        </g>
      </svg>
    </div>
  );
};
