import React, { useState } from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const [imgSrc, setImgSrc] = useState('/logo-ocar.jpeg');
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc('/logo-ocar.png');
    }
  };

  if (hasError && imgSrc === '/logo-ocar.png') {
    // Fallback para texto se ambas as imagens falharem
    return (
      <div className={`${sizeClasses[size]} ${className} bg-purple-600 rounded-full flex items-center justify-center text-white font-bold`}>
        <div className="text-center">
          <div className="leading-none text-xs">OCAR</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <Image 
        src={imgSrc}
        alt="Ocar Logo" 
        fill 
        className="object-contain"
        priority
        onError={handleError}
      />
    </div>
  );
}
