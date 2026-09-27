import React from 'react';
import type { CycloneData } from '../../services/api';
import DataProvenanceBadge from '../common/DataProvenanceBadge';

interface CycloneInfoCardProps {
  cycloneData: CycloneData;
  onClose: () => void;
  onFlyToStorm?: () => void;
}

const CycloneInfoCard: React.FC<CycloneInfoCardProps> = ({
  cycloneData,
  onClose,
  onFlyToStorm
}) => {
  const storm = cycloneData.storm;
  if (!storm && !cycloneData.hasActiveCyclone) return null;

  const isDemo = cycloneData.isDemoMode;

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-red-500/40 p-4 rounded-2xl shadow-2xl w-80 text-white select-none animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
              {isDemo ? 'DEMO MODE (SCENARIO)' : 'LIVE OFFICIAL BULLETIN'}
            </span>
            <h3 className="text-base font-extrabold text-white leading-none mt-0.5">
              {storm?.name || 'Active Cyclonic Storm'}
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 p-1.5 rounded-full transition-colors"
          title="Close card"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Category Pill */}
      <div className="my-3 flex items-center justify-between">
        <span className="px-2.5 py-1 rounded-full bg-red-950/80 border border-red-700/60 text-red-300 text-xs font-bold">
          {storm?.category || 'Severe Cyclonic Storm'}
        </span>
        {onFlyToStorm && (
          <button
            onClick={onFlyToStorm}
            className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 px-2.5 py-1 rounded-lg border border-cyan-800/60 flex items-center space-x-1 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Track Eye</span>
          </button>
        )}
      </div>

      {/* Key Meteorological Stats Grid */}
      <div className="grid grid-cols-2 gap-2 my-3">
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-medium block">Max Sustained Wind</span>
          <span className="text-base font-extrabold text-amber-400 font-mono">
            {storm?.maxWindSpeedKmh ? `${storm.maxWindSpeedKmh} km/h` : 'Not available'}
          </span>
        </div>
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-medium block">Central Pressure</span>
          <span className="text-base font-extrabold text-cyan-400 font-mono">
            {storm?.centralPressureHpa ? `${storm.centralPressureHpa} hPa` : 'Not available'}
          </span>
        </div>
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 col-span-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Movement</span>
            <span className="text-xs font-bold text-slate-200">
              {storm?.movementDirection || 'NW'} {storm?.movementSpeedKmh ? `at ${storm.movementSpeedKmh} km/h` : ''}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-medium block">Eye Coordinates</span>
            <span className="text-xs font-mono font-semibold text-slate-300">
              {storm?.currentPosition ? `${storm.currentPosition.lat.toFixed(2)}°N, ${storm.currentPosition.lon.toFixed(2)}°E` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Source & Provenance */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
        <span className="text-slate-400">
          Source: <strong className="text-slate-300 font-semibold">{cycloneData.source || 'IMD RSMC'}</strong>
        </span>
        {cycloneData.provenance && (
          <DataProvenanceBadge provenance={cycloneData.provenance} compact />
        )}
      </div>
    </div>
  );
};

export default CycloneInfoCard;
