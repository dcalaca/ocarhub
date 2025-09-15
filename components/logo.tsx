import React, { useState, useEffect } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('/logo-ocar.jpeg');

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  useEffect(() => {
    // Testa se a imagem carrega
    const img = new Image();
    img.onload = () => setLogoLoaded(true);
    img.onerror = () => {
      if (currentSrc === '/logo-ocar.jpeg') {
        setCurrentSrc('/logo-ocar.png');
      }
    };
    img.src = currentSrc;
  }, [currentSrc]);

  if (!logoLoaded) {
    // Fallback enquanto carrega
    return (
      <div className={`${sizeClasses[size]} ${className} bg-purple-600 rounded-full flex items-center justify-center`}>
        <div className="text-white font-bold text-xs">OCAR</div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <img 
        src={currentSrc}
        alt="Ocar Logo" 
        className="w-full h-full object-contain"
        style={{ display: 'block' }}
      />
    </div>
  );
}
