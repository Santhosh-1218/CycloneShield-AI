import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface DataFreshnessProps {
  source: string;
  retrievedAt?: string | null;
  observationTime?: string | null;
  status: 'available' | 'loading' | 'unavailable' | 'error' | 'configured_notice' | string;
  freshnessLabel?: string;
  message?: string;
  className?: string;
}

export const DataFreshnessBadge: React.FC<DataFreshnessProps> = ({
  source,
  observationTime,
  status,
  freshnessLabel,
  message,
  className = ''
}) => {
  if (status === 'loading') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700 ${className}`}>
        <RefreshCw className="w-3 h-3 animate-spin text-shield-accent" />
        <span>Loading {source}...</span>
      </span>
    );
  }

  if (status === 'unavailable' || status === 'error') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 ${className}`} title={message || 'Data source currently unavailable'}>
        <AlertTriangle className="w-3 h-3 text-amber-400" />
        <span>Data unavailable ({source})</span>
      </span>
    );
  }

  const label = freshnessLabel || (observationTime ? `Observed: ${observationTime}` : 'Latest available');

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${className}`}>
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span>{label}</span>
      <span className="text-[10px] text-slate-400">({source})</span>
    </span>
  );
};
