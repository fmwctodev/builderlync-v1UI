import React from 'react';

interface LogoProps {
  type: 'icon' | 'light' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ type, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const logoSrc = {
    icon: '/logo/icon.jpeg',
    light: '/logo/lightlogo.jpeg',
    dark: '/logo/darklogo.jpeg'
  };

  return (
    <img
      src={logoSrc[type]}
      alt="BuilderLync Logo"
      className={`${sizeClasses[size]} object-contain ${className}`}
    />
  );
};

export default Logo;