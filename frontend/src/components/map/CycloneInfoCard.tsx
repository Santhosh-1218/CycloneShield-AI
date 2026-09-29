import React from 'react';
import type { CycloneData } from '../../services/api';
import DataProvenanceBadge from '../common/DataProvenanceBadge';
import { ShieldAlert, Crosshair, X } from 'lucide-react';

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
    <div className="bg-white border border-[#E5E5E5] p-4 rounded-xl shadow-lg w-80 text-[#111111] select-none animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-[#E5E5E5]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-[#DC2626]">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#DC2626] block">
              {isDemo ? 'DEMO MODE (SCENARIO)' : 'ACTIVE CYCLONE'}
            </span>
            <h3 className="text-sm font-extrabold text-[#111111] leading-none mt-0.5">
              {storm?.name || 'Active Cyclonic Storm'}
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-[#888888] hover:text-[#111111] bg-[#F8FAFC] hover:bg-[#E5E5E5] p-1.5 rounded-lg transition-colors cursor-pointer"
          title="Close card"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category Pill */}
      <div className="my-3 flex items-center justify-between">
        <span className="px-2.5 py-1 rounded-md bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-xs font-bold">
          {storm?.category || 'Severe Cyclonic Storm'}
        </span>
        {onFlyToStorm && (
          <button
            onClick={onFlyToStorm}
            className="text-xs font-semibold text-[#16A34A] hover:text-[#15803D] bg-[#F0FDF4] hover:bg-[#DCFCE7] px-2.5 py-1 rounded-md border border-[#BBF7D0] flex items-center space-x-1 transition-all cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Track Eye</span>
          </button>
        )}
      </div>

      {/* Key Meteorological Stats Grid */}
      <div className="grid grid-cols-2 gap-2 my-3">
        <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E5E5E5]">
          <span className="text-[10px] text-[#666666] font-medium block">Max Sustained Wind</span>
          <span className="text-sm font-extrabold text-[#111111]">
            {storm?.maxWindSpeedKmh ? `${storm.maxWindSpeedKmh} km/h` : 'N/A'}
          </span>
        </div>
        <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E5E5E5]">
          <span className="text-[10px] text-[#666666] font-medium block">Central Pressure</span>
          <span className="text-sm font-extrabold text-[#111111]">
            {storm?.centralPressureHpa ? `${storm.centralPressureHpa} hPa` : 'N/A'}
          </span>
        </div>
        <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E5E5E5] col-span-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#666666] font-medium block">Movement</span>
            <span className="text-xs font-bold text-[#111111]">
              {storm?.movementDirection || 'NW'} {storm?.movementSpeedKmh ? `at ${storm.movementSpeedKmh} km/h` : ''}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#666666] font-medium block">Eye Coordinates</span>
            <span className="text-xs font-mono font-semibold text-[#111111]">
              {storm?.currentPosition ? `${storm.currentPosition.lat.toFixed(2)}°N, ${storm.currentPosition.lon.toFixed(2)}°E` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Source & Provenance */}
      <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-[11px]">
        <span className="text-[#666666]">
          Source: <strong className="text-[#111111] font-semibold">{cycloneData.source || 'IMD / GDACS'}</strong>
        </span>
        {cycloneData.provenance && (
          <DataProvenanceBadge provenance={cycloneData.provenance} compact />
        )}
      </div>
    </div>
  );
};

export default CycloneInfoCard;
