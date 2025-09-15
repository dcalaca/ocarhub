import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} bg-purple-600 rounded-full flex items-center justify-center text-white font-bold`}>
      <div className="text-center">
        <div className="leading-none">OCAR</div>
        <div className="text-xs leading-none">HUB</div>
      </div>
    </div>
  );
}
