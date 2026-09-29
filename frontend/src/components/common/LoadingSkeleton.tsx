import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'weather' | 'forecast' | 'text' | 'table';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 1,
  className = '',
}) => {
  const renderItem = (key: number) => {
    switch (type) {
      case 'weather':
        return (
          <div key={key} className="bg-white border border-[#E5E5E5] rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-[#E5E5E5] rounded w-1/3 mb-4"></div>
            <div className="h-12 bg-[#E5E5E5] rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-[#E5E5E5] rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-[#E5E5E5] rounded w-1/4"></div>
          </div>
        );
      case 'forecast':
        return (
          <div key={key} className="flex gap-4 overflow-x-auto py-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="min-w-[90px] h-24 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl p-3 animate-pulse flex flex-col items-center justify-between">
                <div className="h-3 bg-[#E5E5E5] rounded w-10"></div>
                <div className="h-6 w-6 bg-[#E5E5E5] rounded-full"></div>
                <div className="h-4 bg-[#E5E5E5] rounded w-12"></div>
              </div>
            ))}
          </div>
        );
      case 'text':
        return (
          <div key={key} className="space-y-2 animate-pulse">
            <div className="h-4 bg-[#E5E5E5] rounded w-full"></div>
            <div className="h-4 bg-[#E5E5E5] rounded w-5/6"></div>
            <div className="h-4 bg-[#E5E5E5] rounded w-4/6"></div>
          </div>
        );
      case 'card':
      default:
        return (
          <div key={key} className="bg-white border border-[#E5E5E5] rounded-xl p-5 animate-pulse">
            <div className="h-5 bg-[#E5E5E5] rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-[#E5E5E5] rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-[#E5E5E5] rounded w-1/3"></div>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => renderItem(i))}
    </div>
  );
};
