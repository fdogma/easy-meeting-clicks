
import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  width = 200, 
  height = 150 
}) => {
  return (
    <img 
      src="/lovable-uploads/e11b6448-4abf-4e5c-8a32-8751b6859995.png" 
      alt="Felipe Diogo Advogados Logo" 
      className={`object-contain ${className}`}
      style={{ background: 'transparent' }}
      width={width}
      height={height}
    />
  );
};

export default Logo;
