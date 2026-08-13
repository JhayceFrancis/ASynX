import React, { useState } from 'react';

export interface ASynXLogoProps {
  className?: string;
  animated?: boolean;
  onClick?: () => void;
  title?: string;
  interactive?: boolean;
  useImageFallback?: boolean;
}

export const ASynXLogo: React.FC<ASynXLogoProps> = ({ 
  className = "w-8 h-8", 
  animated = false,
  onClick,
  title = "ASynX Synchronization Engine — Click to trigger manual sync cycle",
  interactive = true,
  useImageFallback = false
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

  if (useImageFallback) {
    return (
      <div 
        className={`inline-flex items-center justify-center transition-all duration-300 ${interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}`}
        onClick={handleClick}
        title={title}
        role={onClick ? "button" : "img"}
      >
        <img 
          src="/ASynX_logo.png" 
          alt="ASynX Logo" 
          className={`${className} object-contain ${isAnimating ? 'animate-spin' : ''}`}
        />
      </div>
    );
  }

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
              0% { stroke-dashoffset: 400; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes asynx-pulse-glow {
              0%, 100% { opacity: 0.9; filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.6)); }
              50% { opacity: 1; filter: drop-shadow(0 0 18px rgba(236, 72, 153, 0.9)); }
            }
            @keyframes asynx-spin-sync {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes asynx-float-gentle {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-3px) scale(1.02); }
            }

            .asynx-ring-spin {
              transform-origin: 200px 200px;
              animation: asynx-spin-sync 10s linear infinite;
            }

            .asynx-animated-flow {
              stroke-dasharray: 200 60;
              animation: asynx-dash-flow 2.2s linear infinite;
            }

            .asynx-animated-glow {
              animation: asynx-pulse-glow 2s ease-in-out infinite;
            }

            .asynx-animated-float {
              transform-origin: 200px 200px;
              animation: asynx-float-gentle 3.5s ease-in-out infinite;
            }
          `}
        </style>

        <defs>
          {/* Ring Conic / Linear Multi-Stop Gradient matching attached ASynX_logo.png */}
          <linearGradient id="asynx-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="30%" stopColor="#C084FC" />
            <stop offset="60%" stopColor="#EC4899" />
            <stop offset="85%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>

          {/* Left Leg Gradient: Deep Violet -> Bright Cyan-Blue */}
          <linearGradient id="asynx-left-leg-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Right Leg Gradient: Soft Ice White/Purple -> Purple/Magenta */}
          <linearGradient id="asynx-right-leg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0E7FF" />
            <stop offset="50%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>

          {/* Top Arc & Downward Arrow Gradient */}
          <linearGradient id="asynx-top-arc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>

          {/* Bottom Loop & Upward Arrow Gradient */}
          <linearGradient id="asynx-bottom-loop-grad" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="asynx-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Outer Dashed Ring (Matching attached ASynX_logo.png ring design) */}
        <circle 
          cx="200" 
          cy="200" 
          r="178" 
          stroke="url(#asynx-ring-grad)" 
          strokeWidth="6" 
          strokeDasharray="24 14" 
          fill="none" 
          opacity="0.9"
          className={isAnimating ? "asynx-ring-spin" : ""}
        />

        {/* 2. Main Logo Graphic Group */}
        <g className={isAnimating ? "asynx-animated-float" : ""}>
          
          {/* Dark Translucent Shadow Bar in Background */}
          <path 
            d="M 192,82 L 235,355" 
            stroke="#17153A" 
            strokeWidth="32" 
            strokeLinecap="round" 
            opacity="0.45"
          />

          {/* Main 'A' Left Leg */}
          <path 
            d="M 98,348 L 192,82" 
            stroke="url(#asynx-left-leg-grad)" 
            strokeWidth="28" 
            strokeLinecap="round" 
            className={isAnimating ? "asynx-animated-glow" : ""}
            filter="url(#asynx-glow-filter)"
          />

          {/* Main 'A' Right Leg */}
          <path 
            d="M 192,82 L 292,348" 
            stroke="url(#asynx-right-leg-grad)" 
            strokeWidth="28" 
            strokeLinecap="round" 
            className={isAnimating ? "asynx-animated-glow" : ""}
            filter="url(#asynx-glow-filter)"
          />

          {/* Crossbar Curved Bridge */}
          <path 
            d="M 112,295 C 145,310 185,318 210,312" 
            stroke="url(#asynx-left-leg-grad)" 
            strokeWidth="22" 
            strokeLinecap="round" 
            fill="none"
          />

          {/* Bottom-Left Upward Arrow Loop */}
          <path 
            d="M 120,292 C 100,292 80,278 80,252 L 80,238" 
            stroke="url(#asynx-bottom-loop-grad)" 
            strokeWidth="18" 
            strokeLinecap="round" 
            fill="none"
            className={isAnimating ? "asynx-animated-flow" : ""}
          />
          {/* Upward Arrowhead ▲ */}
          <polygon 
            points="80,218 64,240 96,240" 
            fill="#A855F7" 
            className={isAnimating ? "asynx-animated-glow" : ""}
          />
          {/* Base Dot for Upward Arrow */}
          <circle cx="80" cy="248" r="6" fill="#818CF8" />

          {/* Top-Right Arc & Downward Arrow */}
          <path 
            d="M 188,82 C 225,80 282,85 288,105 L 288,120" 
            stroke="url(#asynx-top-arc-grad)" 
            strokeWidth="20" 
            strokeLinecap="round" 
            fill="none"
            className={isAnimating ? "asynx-animated-flow" : ""}
          />
          {/* Downward Arrowhead ▼ */}
          <polygon 
            points="288,136 272,112 304,112" 
            fill="#FF007F" 
            className={isAnimating ? "asynx-animated-glow" : ""}
          />
          {/* Cyan Dot beneath Downward Arrowhead */}
          <circle cx="288" cy="146" r="7" fill="#38BDF8" />

        </g>
      </svg>
    </div>
  );
};
