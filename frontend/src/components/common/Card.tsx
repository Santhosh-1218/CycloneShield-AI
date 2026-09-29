import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hoverEffect = false,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`bg-white border border-[#E5E5E5] rounded-xl shadow-xs ${paddingStyles[padding]} ${
        hoverEffect ? 'transition-all duration-200 hover:shadow-md hover:border-[#D4D4D4]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
