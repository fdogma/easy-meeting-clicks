
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
      src="/lovable-uploads/78a03c35-39d9-4b9a-8b7f-6ad969c59756.png" 
      alt="Felipe Diogo Advogados Logo" 
      className={`object-contain ${className}`}
      width={width}
      height={height}
    />
  );
};

export default Logo;
