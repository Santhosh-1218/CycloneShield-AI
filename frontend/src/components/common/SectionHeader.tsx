import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  badge,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E5E5E5] ${className}`}>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-[#111111] tracking-tight">{title}</h2>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-[#666666] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="shrink-0">{action}</div>
      )}
    </div>
  );
};
