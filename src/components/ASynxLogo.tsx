import React from 'react';

interface ASynxLogoProps {
  className?: string;
  animated?: boolean;
}

export const ASynxLogo: React.FC<ASynxLogoProps> = ({ 
  className = "w-8 h-8", 
  animated = false 
}) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="a-grad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#e0e7ff" /> {/* indigo-100 */}
          <stop offset="100%" stopColor="#818cf8" /> {/* indigo-400 */}
        </linearGradient>
        <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" /> {/* indigo-500 */}
          <stop offset="50%" stopColor="#a855f7" /> {/* purple-500 */}
          <stop offset="100%" stopColor="#ec4899" /> {/* pink-500 */}
        </linearGradient>
      </defs>

      {/* Orbital Sync Rings */}
      <g className={animated ? "origin-center animate-spin-slow" : "origin-center"}>
        {/* Top-Right Arrow */}
        <path 
          d="M 50,15 A 35,35 0 0,1 83,38" 
          stroke="url(#orbit-grad)" 
          strokeWidth="8" 
          strokeLinecap="round" 
        />
        <path 
          d="M 87,27 L 83,38 L 72,34" 
          stroke="url(#orbit-grad)" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Bottom-Left Arrow */}
        <path 
          d="M 50,85 A 35,35 0 0,1 17,62" 
          stroke="url(#orbit-grad)" 
          strokeWidth="8" 
          strokeLinecap="round" 
        />
        <path 
          d="M 13,73 L 17,62 L 28,66" 
          stroke="url(#orbit-grad)" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </g>

      {/* Central 'A' */}
      <path 
        d="M 50,30 L 32,72" 
        stroke="url(#a-grad)" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M 50,30 L 68,72" 
        stroke="url(#a-grad)" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M 40,58 L 60,58" 
        stroke="url(#a-grad)" 
        strokeWidth="8" 
        strokeLinecap="round" 
      />
    </svg>
  );
};
