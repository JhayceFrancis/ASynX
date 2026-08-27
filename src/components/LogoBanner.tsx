import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogoBannerProps {
  gradientColors?: string[];
  accentColor?: string;
  isScrolled?: boolean;
  isSyncing?: boolean;
  onAnimationPhaseChange?: (phase: 'idle' | 'flying-right' | 'returning' | 'dropped') => void;
}

export const LogoBanner: React.FC<LogoBannerProps> = ({
  gradientColors,
  accentColor = 'cyan',
  isScrolled = false,
  isSyncing = false,
  onAnimationPhaseChange
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [animPhase, setAnimPhase] = useState<'idle' | 'flying-right' | 'returning' | 'dropped'>('idle');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Handle the scroll trigger sequence
  useEffect(() => {
    if (isScrolled && animPhase === 'idle') {
      setAnimPhase('flying-right');
      if (onAnimationPhaseChange) onAnimationPhaseChange('flying-right');
      
      // Sequence timing
      setTimeout(() => {
        setAnimPhase('returning');
        if (onAnimationPhaseChange) onAnimationPhaseChange('returning');
        
        setTimeout(() => {
          setAnimPhase('dropped');
          if (onAnimationPhaseChange) onAnimationPhaseChange('dropped');
        }, 600); // return duration
      }, 800); // fly right duration
    } else if (!isScrolled) {
      setAnimPhase('idle');
      if (onAnimationPhaseChange) onAnimationPhaseChange('idle');
    }
  }, [isScrolled]);

  const defaultGradient = ['violet', 'purple', 'blue', 'green'];
  const colors = (gradientColors && gradientColors.length > 0) ? gradientColors : defaultGradient;
  const gradientString = `linear-gradient(to right, ${colors.join(', ')})`;

  // Calculate shuriken animation variants
  const shurikenVariants = {
    idle: { x: 0, rotate: 0, scale: 1 },
    'flying-right': { 
      x: 'calc(100vw - 250px)', // Move to the right side
      rotate: 720, // Spin fast
      scale: 1.2,
      transition: { duration: 0.8, ease: "easeInOut" as const }
    },
    'returning': {
      x: 0,
      rotate: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "backOut" as const }
    },
    'dropped': { x: 0, rotate: 0, scale: 1 }
  };

  return (
    <div className="flex items-center">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center relative z-20">
        <span style={{ 
          backgroundImage: gradientString,
          WebkitBackgroundClip: 'text',
          color: 'transparent' 
        }}>
          ASyn
        </span>
      </h1>
      
      <motion.span 
        className="inline-flex items-center relative z-10"
        variants={shurikenVariants}
        initial="idle"
        animate={animPhase}
        style={{
          width: '4rem',
          height: '4rem',
          marginLeft: '-1.25rem',
          '--accent-color': accentColor
        } as React.CSSProperties}
      >
        {hasMounted && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
            <defs>
              <radialGradient id="hub-glow-lb" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--accent-color, #22D3EE)" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="var(--accent-color, #22D3EE)" stopOpacity="0"/>
              </radialGradient>
              <style>
                {`
                  .shuriken-entry-lb {
                    animation: flyInLb 1.2s cubic-bezier(0.2, 0.8, 0.2, 1.1) forwards;
                    transform-origin: 200px 200px;
                  }
                  
                  .shuriken-idle-lb {
                    animation: xPatternSpinLb 5s infinite;
                    transform-origin: 200px 200px;
                  }
                  .shuriken-syncing-lb {
                    animation: infiniteSpinLb 1.5s linear infinite;
                    transform-origin: 200px 200px;
                  }
                  .shuriken-fast-lb {
                    animation: infiniteSpinLb 0.5s linear infinite;
                    transform-origin: 200px 200px;
                  }
                  @keyframes flyInLb {
                    0% { transform: translateX(100vw) rotate(1080deg) scale(0.5); opacity: 0; }
                    100% { transform: translateX(0px) rotate(0deg) scale(1); opacity: 1; }
                  }
                  @keyframes xPatternSpinLb {
                    0% { transform: rotate(45deg); animation-timing-function: ease-in; }
                    25% { transform: rotate(765deg); animation-timing-function: linear; }
                    40% { transform: rotate(1035deg); animation-timing-function: ease-out; }
                    60% { transform: rotate(1125deg); }
                    100% { transform: rotate(1125deg); }
                  }
                  @keyframes infiniteSpinLb {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                  .blade-base-lb { fill: #0B1120; }
                  .blade-left-lb { fill: #0891B2; }
                  .blade-right-lb { fill: var(--accent-color, #22D3EE); }
                  .blade-accent-lb { fill: #A855F7; }
                `}
              </style>
              <g id="master-blade-lb">
                <path d="M 200 10 L 240 85 L 225 95 L 230 145 L 215 165 L 185 165 L 160 145 L 180 105 L 145 85 L 175 50 Z" className="blade-base-lb" stroke="#0B1120" strokeWidth="4" strokeLinejoin="round"/>
                <path d="M 200 13 L 200 165 L 185 165 L 160 145 L 180 105 L 145 85 L 175 50 Z" className="blade-left-lb" stroke="#0891B2" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M 200 13 L 240 85 L 225 95 L 230 145 L 215 165 L 200 165 Z" className="blade-right-lb" stroke="var(--accent-color, #22D3EE)" strokeWidth="1.5" strokeLinejoin="round"/>
                <line x1="200" y1="13" x2="200" y2="165" stroke="#0B1120" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M 190 40 L 165 75 L 185 95" fill="none" stroke="#0B1120" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M 195 110 L 175 135 L 190 150" fill="none" stroke="#0B1120" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M 210 40 L 225 75 L 215 90" fill="none" stroke="#0B1120" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M 205 110 L 215 135 L 205 150" fill="none" stroke="#0B1120" strokeWidth="2" strokeLinejoin="round"/>
                <polygon points="176,106 182,103 186,111 180,114" className="blade-accent-lb"/>
                <polygon points="218,91 224,88 228,96 222,99" className="blade-accent-lb"/>
              </g>
            </defs>
            <g className={animPhase === 'idle' ? "shuriken-entry-lb" : ""}>
              <g className={
                animPhase === 'flying-right' || animPhase === 'returning' ? "shuriken-fast-lb" : 
                isSyncing ? "shuriken-syncing-lb" : "shuriken-idle-lb"
              }>
                <use href="#master-blade-lb" transform="rotate(0, 200, 200)" />
                <use href="#master-blade-lb" transform="rotate(90, 200, 200)" />
                <use href="#master-blade-lb" transform="rotate(180, 200, 200)" />
                <use href="#master-blade-lb" transform="rotate(270, 200, 200)" />
                <circle cx="200" cy="200" r="50" fill="url(#hub-glow-lb)" />
                <g stroke="#0B1120" strokeWidth="3">
                  <rect x="174" y="174" width="52" height="52" rx="6" className="blade-base-lb" />
                  <rect x="174" y="174" width="52" height="52" rx="6" className="blade-base-lb" transform="rotate(45, 200, 200)" />
                </g>
                <circle cx="200" cy="200" r="20" fill="#0F172A" stroke="var(--accent-color, #22D3EE)" strokeWidth="2.5"/>
                <polygon points="194,188 206,188 212,194 212,206 206,212 194,212 188,206 188,194" fill="#38BDF8" stroke="#E0FFFF" strokeWidth="1.5"/>
                <polygon points="194,188 206,188 200,200" fill="#BAE6FD" opacity="0.6"/>
              </g>
            </g>
          </svg>
        )}
      </motion.span>
    </div>
  );
};
