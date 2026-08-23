import React from 'react';

interface ASynXLoaderProps {
  /**
   * The dimension (width and height) of the loader.
   * Can be a number (pixels) or string (e.g., '100%').
   */
  size?: number | string;
  /**
   * Optional CSS class name for additional styling.
   */
  className?: string;
}

/**
 * ASynXLoader
 * A highly optimised, hardware-accelerated SVG loader component for the ASynX desktop application.
 */
export const ASynXLoader: React.FC<ASynXLoaderProps> = ({
  size = 200,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="ASynX Loading"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <style>{`
            .asynx-interactive {
              transform-origin: 100px 100px;
              transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            svg:hover .asynx-interactive {
              transform: scale(1.05);
            }
          `}</style>

          <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="gradA" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00c698" />
            <stop offset="35%" stopColor="#cd6133" />
            <stop offset="65%" stopColor="#1a40ff" />
            <stop offset="100%" stopColor="#00d2ff" />
          </linearGradient>

          <linearGradient id="gradV" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6c5ce7" />
            <stop offset="45%" stopColor="#e84393" />
            <stop offset="100%" stopColor="#00cec9" />
          </linearGradient>

          <linearGradient id="arcOuterGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c84577" />
            <stop offset="100%" stopColor="#6b2ca0" />
          </linearGradient>

          <linearGradient id="arcInnerGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b2c9d" />
            <stop offset="100%" stopColor="#4897d8" />
          </linearGradient>
        </defs>

        <g className="asynx-interactive">
          
          {/* LAYER 1: High-Speed Orbiting Scanning Orbs */}
          <g filter="url(#neonGlow)">
            <circle cx="100" cy="12" r="2.5" fill="#eab308">
              <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="100" cy="24" r="2.5" fill="#86efac">
              <animateTransform attributeName="transform" type="rotate" from="180 100 100" to="540 100 100" dur="0.9s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* LAYER 2: High-Speed Outer Tracking Spinners */}
          <g filter="url(#neonGlow)">
            <circle cx="100" cy="100" r="88" fill="none" stroke="url(#arcOuterGrad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="140 400">
              <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="0.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="100" cy="100" r="65" fill="none" stroke="url(#arcInnerGrad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="90 400">
              <animateTransform attributeName="transform" type="rotate" from="360 100 100" to="0 100 100" dur="1.2s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* LAYER 3: The Engineered Eject & Implode Sequence */}
          <g style={{ isolation: 'isolate' }}>
            <animateTransform attributeName="transform" type="rotate" dur="10s" repeatCount="indefinite" values="0 100 100; 1800 100 100; 1800 100 100; 0 100 100; 0 100 100" keyTimes="0; 0.4; 0.5; 0.9; 1" calcMode="spline" keySplines="0.8 0 1 1; 0 0 1 1; 0.8 0 1 1; 0 0 1 1" />
            
            <path d="M 100 155 L 155 65 L 125 65 L 100 110 L 75 65 L 45 65 Z" fill="url(#gradV)">
              <animateTransform attributeName="transform" type="translate" dur="10s" repeatCount="indefinite" values="0 0; 0 0; 0 300; 0 300; 0 -300; 0 -300; 0 0; 0 0; 0 300; 0 300; 0 -300; 0 -300; 0 0; 0 0" keyTimes="0; 0.4; 0.42; 0.43; 0.431; 0.45; 0.48; 0.9; 0.92; 0.93; 0.931; 0.95; 0.98; 1" calcMode="spline" keySplines="0 0 1 1; 0.5 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 0.5 1; 0 0 1 1; 0.5 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 0.5 1; 0 0 1 1" />
              <animate attributeName="opacity" dur="10s" repeatCount="indefinite" keyTimes="0; 0.02; 0.04; 0.06; 0.08; 0.1; 0.12; 0.15; 0.5; 0.52; 0.54; 0.56; 0.58; 0.6; 0.62; 0.65; 1" values="1; 0.2; 1; 0.2; 1; 0.2; 1; 1; 1; 1; 0.2; 1; 0.2; 1; 0.2; 1; 1" />
            </path>

            <path d="M 100 45 L 155 135 L 125 135 L 100 90 L 75 135 L 45 135 Z" fill="url(#gradA)">
              <animateTransform attributeName="transform" type="translate" dur="10s" repeatCount="indefinite" values="0 0; 0 0; 0 -300; 0 -300; 0 300; 0 300; 0 0; 0 0; 0 -300; 0 -300; 0 300; 0 300; 0 0; 0 0" keyTimes="0; 0.4; 0.42; 0.43; 0.431; 0.45; 0.48; 0.9; 0.92; 0.93; 0.931; 0.95; 0.98; 1" calcMode="spline" keySplines="0 0 1 1; 0.5 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 0.5 1; 0 0 1 1; 0.5 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 0.5 1; 0 0 1 1" />
              <animate attributeName="opacity" dur="10s" repeatCount="indefinite" keyTimes="0; 0.02; 0.04; 0.06; 0.08; 0.1; 0.12; 0.15; 0.5; 0.52; 0.54; 0.56; 0.58; 0.6; 0.62; 0.65; 1" values="0.2; 1; 0.2; 1; 0.2; 1; 0.2; 1; 1; 0.2; 1; 0.2; 1; 0.2; 1; 1; 1" />
            </path>
          </g>

          {/* LAYER 4: Reactive Centre Node */}
          <circle cx="100" cy="100" r="3" fill="#86efac" filter="url(#neonGlow)">
            <animate attributeName="r" dur="10s" repeatCount="indefinite" keyTimes="0; 0.47; 0.48; 0.52; 0.97; 0.98; 1" values="3; 3; 15; 3; 3; 15; 3" />
            <animate attributeName="opacity" dur="10s" repeatCount="indefinite" keyTimes="0; 0.47; 0.48; 0.52; 0.97; 0.98; 1" values="0.6; 0.6; 1; 0.6; 0.6; 1; 0.6" />
          </circle>
        </g>
      </svg>
    </div>
  );
};

export default ASynXLoader;
