import React from 'react';
import { Info } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-[#E5E5E5] rounded-xl p-8 text-center max-w-md mx-auto my-4 shadow-xs ${className}`}>
      <div className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-[#E5E5E5] flex items-center justify-center mx-auto mb-3 text-[#666666]">
        {icon || <Info className="h-5 w-5" />}
      </div>
      <h3 className="text-sm font-semibold text-[#111111] mb-1">{title}</h3>
      <p className="text-xs text-[#666666] mb-4 leading-relaxed">{description}</p>
      {action}
    </div>
  );
};
