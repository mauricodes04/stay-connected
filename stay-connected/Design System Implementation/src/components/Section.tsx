import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'default' | 'card';
}

export const Section: React.FC<SectionProps> = ({ 
  children, 
  className = '', 
  background = 'default' 
}) => {
  const baseClasses = 'px-4 py-6';
  const backgroundClasses = background === 'card' ? 'bg-card' : 'bg-background';
  
  return (
    <div className={`${baseClasses} ${backgroundClasses} ${className}`}>
      {children}
    </div>
  );
};