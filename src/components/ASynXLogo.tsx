import React, { useState, useEffect, useRef } from 'react';

interface ASynXLogoProps {
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
  const [frameIndex, setFrameIndex] = useState(0);
  const requestRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const TOTAL_FRAMES = 324;
  const FPS = 60;
  const FRAME_DUR = 1000 / FPS;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (interactive) {
      setLocalActive(true);
      setTimeout(() => setLocalActive(false), 5400); // 324 frames at 60fps = 5.4s
    }
    if (onClick) {
      onClick();
    }
  };

  const isAnimating = animated || localActive || isHovered;

  // Preload frames optimization (optional, but good if we want smooth playback without canvas)
  useEffect(() => {
    // Only preload a few to save bandwidth unless we are animating
  }, []);

  const animate = (time: number) => {
    if (lastUpdateRef.current === 0) {
      lastUpdateRef.current = time;
    }
    const deltaTime = time - lastUpdateRef.current;

    if (deltaTime > FRAME_DUR) {
      setFrameIndex(prev => (prev + 1) % TOTAL_FRAMES);
      lastUpdateRef.current = time;
    }
    
    if (isAnimating) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isAnimating) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastUpdateRef.current = 0;
      setFrameIndex(0); // Reset to first frame when not animating
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isAnimating]);

  const frameStr = String(frameIndex).padStart(3, '0');
  const imageSrc = `/ASynX-split/ASynX_${frameStr}.png`;

  return (
    <div 
      className={`inline-flex items-center justify-center transition-transform duration-300 ${interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => {
         setIsHovered(true);
         if (!isAnimating) {
            requestRef.current = requestAnimationFrame(animate);
         }
      }}
      onMouseLeave={() => {
         setIsHovered(false);
      }}
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
      <img 
         src={imageSrc} 
         alt="ASynX Logo" 
         className={`${className} object-contain`}
         draggable={false}
      />
    </div>
  );
};
