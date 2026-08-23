import React from 'react';

interface AnimatedLogoProps {
  isSyncing?: boolean;
  size?: number | string;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  isSyncing = false,
  size = '100%',
  className = '',
  onClick,
  title
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size }}
      aria-label="ASynX Logo"
      onClick={onClick}
      title={title}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
      >
        <defs>
          {/* Cyberpunk Gradients */}
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f3ff" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          <linearGradient id="leftLegGrad" x1="0%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#00f3ff" />
          </linearGradient>

          {/* Deep Indigo/Violet Gradient for the Right Leg */}
          <linearGradient id="rightLegGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>

          <linearGradient id="topSwoopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f3ff" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          {/* Neon Glow Filter */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Rotating Dashed Ring */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="4.5"
          strokeDasharray="24 18"
          strokeLinecap="round"
        >
          {isSyncing && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 100 100"
              to="360 100 100"
              dur="12s"
              repeatCount="indefinite"
            />
          )}
        </circle>

        {/* Central 'A' Sync Structure */}
        <g filter="url(#neonGlow)">
          {/* Deep Indigo Right Leg */}
          <path
            d="M 100 45 L 145 160"
            fill="none"
            stroke="url(#rightLegGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={isSyncing ? '130' : 'none'}
            strokeDashoffset={isSyncing ? '130' : '0'}
          >
            {isSyncing && (
              <animate
                attributeName="stroke-dashoffset"
                values="130; 0; 0; 130"
                dur="4s"
                repeatCount="indefinite"
              />
            )}
          </path>

          {/* Bright Left Leg (Foreground) */}
          <path
            d="M 60 160 L 100 45"
            fill="none"
            stroke="url(#leftLegGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={isSyncing ? '130' : 'none'}
            strokeDashoffset={isSyncing ? '130' : '0'}
          >
            {isSyncing && (
              <animate
                attributeName="stroke-dashoffset"
                values="130; 0; 0; 130"
                dur="4s"
                repeatCount="indefinite"
              />
            )}
          </path>

          {/* Bottom Sync Crossbar */}
          <path
            d="M 50 140 Q 100 155 130 140"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={isSyncing ? '90' : 'none'}
            strokeDashoffset={isSyncing ? '90' : '0'}
          >
            {isSyncing && (
              <animate
                attributeName="stroke-dashoffset"
                values="90; 0; 0; 90"
                dur="4s"
                repeatCount="indefinite"
                begin="0.5s"
              />
            )}
          </path>

          {/* Up Arrow (Left Side) */}
          <polygon points="45,140 75,140 60,110" fill="#8b5cf6">
            {isSyncing && (
              <animate
                attributeName="transform"
                type="translate"
                values="0,2; 0,-2; 0,2"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </polygon>

          {/* Top Sync Swoop */}
          <path
            d="M 100 45 Q 150 45 160 75"
            fill="none"
            stroke="url(#topSwoopGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={isSyncing ? '80' : 'none'}
            strokeDashoffset={isSyncing ? '80' : '0'}
          >
            {isSyncing && (
              <animate
                attributeName="stroke-dashoffset"
                values="80; 0; 0; 80"
                dur="4s"
                repeatCount="indefinite"
                begin="0.5s"
              />
            )}
          </path>

          {/* Down Arrow (Right Side) */}
          <polygon points="145,75 175,75 160,100" fill="#ec4899">
            {isSyncing && (
              <animate
                attributeName="transform"
                type="translate"
                values="0,-2; 0,2; 0,-2"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </polygon>
        </g>
      </svg>
    </div>
  );
};

