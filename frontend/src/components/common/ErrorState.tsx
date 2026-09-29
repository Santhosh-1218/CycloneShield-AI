import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Data Unavailable',
  message = 'Unable to load current weather information. Please check your connection and try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-[#E5E5E5] rounded-xl p-8 text-center max-w-lg mx-auto my-6 shadow-xs ${className}`}>
      <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FCA5A5] flex items-center justify-center mx-auto mb-4 text-[#DC2626]">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-[#111111] mb-1">{title}</h3>
      <p className="text-xs text-[#666666] mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          icon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Retry
        </Button>
      )}
    </div>
  );
};
