import React, { useState } from 'react';
import { Info, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';
import type { DataProvenance } from '../../services/api';

interface DataProvenanceBadgeProps {
  provenance?: DataProvenance;
  inlineLabel?: string;
  size?: 'sm' | 'md';
  compact?: boolean;
}

export const DataProvenanceBadge: React.FC<DataProvenanceBadgeProps> = ({
  provenance,
  inlineLabel,
  size = 'sm',
  compact = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!provenance) {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
        <span>SOURCE UNVERIFIED</span>
      </span>
    );
  }

  const statusConfig: Record<string, { bg: string; text: string; border: string; label: string; icon: any }> = {
    LIVE: {
      bg: 'bg-emerald-950/80',
      text: 'text-emerald-400',
      border: 'border-emerald-700/60',
      label: 'LIVE OBSERVATION',
      icon: Radio
    },
    FORECAST: {
      bg: 'bg-cyan-950/80',
      text: 'text-cyan-400',
      border: 'border-cyan-700/60',
      label: 'FORECAST',
      icon: CheckCircle2
    },
    SATELLITE: {
      bg: 'bg-purple-950/80',
      text: 'text-purple-300',
      border: 'border-purple-700/60',
      label: 'SATELLITE OBSERVATION',
      icon: Radio
    },
    MODELED: {
      bg: 'bg-amber-950/80',
      text: 'text-amber-300',
      border: 'border-amber-700/60',
      label: 'MODELLED ESTIMATE',
      icon: Info
    },
    HISTORICAL: {
      bg: 'bg-slate-900',
      text: 'text-slate-300',
      border: 'border-slate-700',
      label: 'HISTORICAL BASELINE',
      icon: Info
    },
    UNAVAILABLE: {
      bg: 'bg-red-950/80',
      text: 'text-red-400',
      border: 'border-red-700/60',
      label: 'DATA UNAVAILABLE',
      icon: AlertTriangle
    }
  };

  const config = statusConfig[provenance.status] || statusConfig.MODELED;
  const IconComponent = config.icon;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`inline-flex items-center space-x-1.5 ${compact ? 'px-1.5 py-0.5 text-[9px]' : (size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs')} rounded-full font-mono font-semibold border ${config.bg} ${config.text} ${config.border} shadow-sm transition-all hover:scale-105`}
      >
        <IconComponent className="w-3 h-3 animate-pulse" />
        <span>{inlineLabel || config.label}</span>
        <Info className="w-2.5 h-2.5 opacity-60 ml-0.5" />
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-200 pointer-events-none space-y-1.5 font-sans">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-extrabold text-cyan-400 uppercase tracking-wider text-[10px]">Data Provenance</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${config.bg} ${config.text} border ${config.border}`}>
              {config.label}
            </span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Data Source:</span>
              <span className="font-medium text-white truncate max-w-[140px]">{provenance.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Provider:</span>
              <span className="font-medium text-slate-300">{provenance.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Data Type:</span>
              <span className="font-medium text-slate-300">{provenance.dataType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Observed/Model Time:</span>
              <span className="font-mono text-slate-300 text-[10px]">{provenance.observedAt || 'N/A'}</span>
            </div>
            {provenance.confidence !== undefined && provenance.confidence !== null && (
              <div className="flex justify-between">
                <span className="text-slate-400">Model Confidence:</span>
                <span className="font-mono font-bold text-emerald-400">{Math.round(provenance.confidence * 100)}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataProvenanceBadge;
