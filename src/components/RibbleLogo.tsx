import React from 'react';

interface RibbleLogoProps {
  className?: string;
  showWordmark?: boolean;
  showBackground?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'signature' | 'mint' | 'lavender' | 'minimal' | 'monochrome' | 'reverse' | 'black' | 'white';
  animated?: boolean;
}

export const RibbleLogo: React.FC<RibbleLogoProps> = ({
  className = '',
  showWordmark = true,
  showBackground = true,
  size = 'md',
  variant = 'signature',
  animated = false,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const dimensions = {
    sm: { iconSize: 26, textSize: 'text-base', gap: 'gap-2' },
    md: { iconSize: 32, textSize: 'text-lg', gap: 'gap-2.5' },
    lg: { iconSize: 48, textSize: 'text-2xl', gap: 'gap-3' },
    xl: { iconSize: 72, textSize: 'text-4xl', gap: 'gap-4' },
  }[size];

  let bgFill: string | null = '#1677F2';
  let glyphFill = '#FFFFFF';

  if (variant === 'monochrome') {
    bgFill = '#1D1D1F';
    glyphFill = '#FFFFFF';
  } else if (variant === 'minimal') {
    bgFill = '#F5F5F7';
    glyphFill = '#1D1D1F';
  } else if (variant === 'reverse') {
    bgFill = '#FFFFFF';
    glyphFill = '#1677F2';
  } else if (variant === 'black') {
    bgFill = null;
    glyphFill = '#1D1D1F';
  } else if (variant === 'white') {
    bgFill = null;
    glyphFill = '#FFFFFF';
  }

  if (!showBackground) {
    bgFill = null;
    if (variant === 'signature') {
      glyphFill = '#1677F2';
    }
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`inline-flex items-center ${dimensions.gap} ${className} cursor-pointer select-none group`}
    >
      <div 
        className={`relative shrink-0 transition-transform duration-300 ease-out ${
          isHovered || animated ? 'scale-105 rotate-[-1deg]' : 'scale-100'
        }`}
        style={{ width: dimensions.iconSize, height: dimensions.iconSize }}
      >
        <svg
          viewBox="0 0 112 112"
          width={dimensions.iconSize}
          height={dimensions.iconSize}
          className={`w-full h-full ${bgFill ? 'drop-shadow-sm rounded-[22%]' : ''}`}
          role="img"
          aria-label="Ribble Logo"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {bgFill && <rect width="112" height="112" rx="24" fill={bgFill} />}
          <path
            d="M42.15 25.4H56.2c14.65 0 26.52 11.86 26.52 26.5 0 9.43-5.01 18.15-13.16 22.9L35.08 94.94c-5.16 3.01-11.36-1.7-9.73-7.45l14.04-57.17a6.62 6.62 0 0 1 2.76-4.92Z"
            fill={glyphFill}
          />
          <circle cx="75.2" cy="87.6" r="8.45" fill={glyphFill} />
        </svg>
      </div>

      {showWordmark && (
        <span className={`ribble-wordmark text-[#1D1D1F] dark:text-[#F5F5F7] ${dimensions.textSize} tracking-tight font-black transition-colors duration-200`}>
          Ribble
        </span>
      )}
    </div>
  );
};
