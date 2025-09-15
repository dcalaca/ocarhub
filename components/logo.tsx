import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center shadow-lg border-2 border-purple-400">
        <div className="text-white font-bold text-center leading-none">
          <div className="text-xs sm:text-sm font-black tracking-wider">OCAR</div>
          <div className="text-[8px] sm:text-[10px] font-medium opacity-90">HUB</div>
        </div>
      </div>
    </div>
  );
}
