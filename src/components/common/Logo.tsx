import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon SVG combining Leaf + Sprout + Subtle Tech Circuit */}
      <div className={`relative flex-shrink-0 ${iconDimensions[size]} rounded-2xl bg-gradient-to-br from-forest to-forest-950 p-1.5 shadow-md flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tech Circuit Base Line */}
          <path
            d="M 22 82 L 40 82 L 50 68"
            stroke="#6EE7B7"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 78 82 L 60 82 L 50 68"
            stroke="#6EE7B7"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="22" cy="82" r="4" fill="#6EE7B7" />
          <circle cx="78" cy="82" r="4" fill="#6EE7B7" />

          {/* Central Sprout Stem */}
          <path
            d="M 50 72 Q 50 48 50 30"
            stroke="#F0FDF4"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Left Green Leaf with Circuit Vein */}
          <path
            d="M 50 52 C 30 50 20 34 32 20 C 44 28 48 40 50 52 Z"
            fill="#4ADE80"
          />
          <path
            d="M 48 46 Q 38 38 34 30"
            stroke="#DCFCE7"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="34" cy="30" r="2.5" fill="#FFFFFF" />

          {/* Right Vibrant Sprout Leaf */}
          <path
            d="M 50 42 C 68 38 74 22 62 14 C 52 20 48 32 50 42 Z"
            fill="#A7F3D0"
          />

          {/* Smart AI / Pulse Dot at apex */}
          <circle cx="50" cy="18" r="4.5" fill="#F4B740" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`font-extrabold tracking-tight text-forest-900 ${titleSizes[size]}`}>
            Farm<span className="text-primaryGreen">Veda</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-forest-100 text-forest-800 px-1.5 py-0.5 rounded-full border border-forest-200">
            PWA
          </span>
        </div>
        {showTagline && (
          <span className="text-xs font-semibold text-earth-dark tracking-wide">
            Smart Farming. Smarter Living.
          </span>
        )}
      </div>
    </div>
  );
};

