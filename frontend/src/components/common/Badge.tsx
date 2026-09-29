import React from 'react';

export type BadgeStatus = 'LIVE' | 'FORECAST' | 'MODELLED' | 'SATELLITE' | 'HISTORICAL' | 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS';

interface BadgeProps {
  status?: BadgeStatus;
  children?: React.ReactNode;
  pulse?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  status = 'INFO',
  children,
  pulse = false,
  className = '',
  size = 'md',
}) => {
  const styles: Record<BadgeStatus, { bg: string; text: string; border: string; dot?: string }> = {
    LIVE: { bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]', border: 'border-[#BBF7D0]', dot: 'bg-[#16A34A]' },
    FORECAST: { bg: 'bg-[#F8FAFC]', text: 'text-[#475569]', border: 'border-[#E2E8F0]' },
    MODELLED: { bg: 'bg-[#FEFCE8]', text: 'text-[#CA8A04]', border: 'border-[#FEF08A]' },
    SATELLITE: { bg: 'bg-[#F0F9FF]', text: 'text-[#0284C7]', border: 'border-[#BAE6FD]' },
    HISTORICAL: { bg: 'bg-[#F8FAFC]', text: 'text-[#64748B]', border: 'border-[#E2E8F0]' },
    INFO: { bg: 'bg-[#F8FAFC]', text: 'text-[#334155]', border: 'border-[#E2E8F0]' },
    SUCCESS: { bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]', border: 'border-[#BBF7D0]' },
    WARNING: { bg: 'bg-[#FEFCE8]', text: 'text-[#CA8A04]', border: 'border-[#FEF08A]' },
    DANGER: { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', border: 'border-[#FCA5A5]' },
  };

  const current = styles[status] || styles.INFO;
  const label = children || status;
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-md border tracking-wider uppercase ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
    >
      {(pulse || status === 'LIVE') && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.dot || 'bg-current'}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot || 'bg-current'}`}></span>
        </span>
      )}
      {label}
    </span>
  );
};
