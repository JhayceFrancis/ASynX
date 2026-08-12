import React from 'react';

interface ASynXLogoProps {
  className?: string;
  animated?: boolean;
}

export const ASynXLogo: React.FC<ASynXLogoProps> = ({ 
  className = "w-8 h-8", 
  animated = false 
}) => {
  return (
    <svg 
      viewBox="0 0 400 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <style>
        {`
          .asynx-logo-move-x {
            animation: asynx-move-x 10s ease-in-out infinite alternate;
          }
          .asynx-logo-move-y {
            animation: asynx-move-y 15s ease-in-out infinite alternate;
          }
          @keyframes asynx-move-x {
            0% { transform: translateX(0px); }
            100% { transform: translateX(10px); }
          }
          @keyframes asynx-move-y {
            0% { transform: translateY(0px); }
            100% { transform: translateY(15px); }
          }
        `}
      </style>
      <defs>
        {/* Glow Effects corresponding to XAML DropShadowEffect */}
        <filter id="BlueGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="12.5" floodColor="#DDEEFF" floodOpacity="0.9">
            {animated && <animate attributeName="flood-opacity" values="0.9; 0.75; 0.9" dur="16s" repeatCount="indefinite" />}
          </feDropShadow>
        </filter>
        <filter id="MagentaGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="12.5" floodColor="#FF007F" floodOpacity="0.9" />
        </filter>
        <filter id="PurpleGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="12.5" floodColor="#7B2CBF" floodOpacity="0.9" />
        </filter>

        {/* Energy Flow Gradients */}
        <linearGradient id="UpperArrowGradient" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#7B2CBF" />
          <stop offset="0" stopColor="#FFFFCC">
            {animated && <animate attributeName="offset" from="0" to="0.9" dur="6s" repeatCount="indefinite" />}
          </stop>
          <stop offset="0.1" stopColor="#FFDDEE">
            {animated && <animate attributeName="offset" from="0.1" to="1.0" dur="6s" repeatCount="indefinite" />}
          </stop>
          <stop offset="1" stopColor="#FF007F" />
        </linearGradient>

        <linearGradient id="LowerArrowGradient" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF007F" />
          <stop offset="0" stopColor="#FFFFCC">
            {animated && <animate attributeName="offset" from="0" to="0.9" begin="-3s" dur="6s" repeatCount="indefinite" />}
          </stop>
          <stop offset="0.1" stopColor="#FFDDEE">
            {animated && <animate attributeName="offset" from="0.1" to="1.0" begin="-3s" dur="6s" repeatCount="indefinite" />}
          </stop>
          <stop offset="1" stopColor="#7B2CBF" />
        </linearGradient>
      </defs>

      {/* Figure-8 Cyclic Movement via Nested CSS Transforms */}
      <g className={animated ? "asynx-logo-move-x" : ""}>
        <g className={animated ? "asynx-logo-move-y" : ""}>
          
          {/* 1. Background Structure (Parallel to Left) */}
          <path 
            d="M 180,380 L 280,130" 
            stroke="#DDEEFF" 
            strokeWidth="30" 
            strokeLinecap="round" 
            filter="url(#BlueGlow)" 
          />

          {/* 2. Lower Arrow (Interweaves Behind Main Structure) */}
          <path 
            d="M 200,320 C 170,320 130,310 100,290 L 100,260" 
            stroke="url(#LowerArrowGradient)" 
            strokeWidth="20" 
            strokeLinecap="round" 
            fill="none"
          />
          <polygon 
            points="100,260 120,270 80,270" 
            fill="#7B2CBF" 
            filter="url(#PurpleGlow)" 
          />

          {/* 3. Main 'A' Structure */}
          {/* Left Bar */}
          <path 
            d="M 100,350 L 200,100" 
            stroke="#DDEEFF" 
            strokeWidth="30" 
            strokeLinecap="round" 
            filter="url(#BlueGlow)"
          />
          {/* Right Bar */}
          <path 
            d="M 200,100 L 300,350" 
            stroke="#DDEEFF" 
            strokeWidth="30" 
            strokeLinecap="round" 
            filter="url(#BlueGlow)"
          />

          {/* 4. Upper Arrow (Foreground) */}
          <path 
            d="M 200,80 C 230,80 270,90 300,110 L 300,140" 
            stroke="url(#UpperArrowGradient)" 
            strokeWidth="20" 
            strokeLinecap="round" 
            fill="none"
          />
          <polygon 
            points="300,140 280,130 320,130" 
            fill="#FF007F" 
            filter="url(#MagentaGlow)" 
          />

        </g>
      </g>
    </svg>
  );
};
