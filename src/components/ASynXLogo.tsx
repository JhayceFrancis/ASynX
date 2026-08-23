import React from 'react';
import loopSvg from './ASynX (loop).svg';
import staticSvg from './ASynX (static).svg';

interface ASynXLogoProps {
  isSyncing?: boolean;
  size?: number | string;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const ASynXLogo: React.FC<ASynXLogoProps> = ({
  isSyncing = false,
  size = '100%',
  className = '',
  onClick,
  title,
}) => {
  const commonImageStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    transformOrigin: 'center',
    backfaceVisibility: 'hidden',
    pointerEvents: 'none',
  };

  const loopStyle: React.CSSProperties = {
    ...commonImageStyle,
    opacity: isSyncing ? 1 : 0,
    transform: isSyncing ? 'rotateY(0deg)' : 'rotateY(180deg)',
  };

  const staticStyle: React.CSSProperties = {
    ...commonImageStyle,
    opacity: isSyncing ? 0 : 1,
    transform: isSyncing ? 'rotateY(-180deg)' : 'rotateY(0deg)',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-transparent overflow-hidden select-none cursor-pointer ${className}`}
      style={{ width: size, height: size, perspective: '1000px' }}
      aria-label="ASynX Logo"
      onClick={onClick}
      title={title}
    >
      <object
        data={staticSvg}
        type="image/svg+xml"
        aria-label="ASynX Static Logo"
        style={staticStyle}
      />
      <object
        data={loopSvg}
        type="image/svg+xml"
        aria-label="ASynX Loop Logo"
        style={loopStyle}
      />
    </div>
  );
};

export default ASynXLogo;
