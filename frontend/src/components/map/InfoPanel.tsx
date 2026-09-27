import React from 'react';
import type { RiskLevel } from '../../types';
import { getRiskBadgeClass } from '../../utils/formatters';
import { Users, Wind, CloudRain, Waves, MapPin, X, ArrowRight } from 'lucide-react';

interface ZoneData {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  population: string;
  windSpeed: string;
  rainfall: string;
  stormSurge: string;
  coordinates: string;
  status: string;
}

interface InfoPanelProps {
  zone: ZoneData | null;
  onClose: () => void;
  onActionClick: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ zone, onClose, onActionClick }) => {
  if (!zone) {
    return (
      <div className="bg-navy-800/90 border border-slate-700/80 rounded-2xl p-6 text-center text-slate-400">
        <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-300">No Zone Selected</h4>
        <p className="text-xs text-slate-500 mt-1">
          Click on any interactive marker or risk ring on the map to inspect detailed coastal vulnerability metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-navy-800/95 border border-slate-700/80 rounded-2xl p-5 text-slate-100 shadow-2xl relative animate-in fade-in duration-200">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center space-x-2 mb-2">
        <span className={`px-2.5 py-0.5 rounded text-xs uppercase font-mono ${getRiskBadgeClass(zone.riskLevel)}`}>
          {zone.riskLevel} Risk
        </span>
        <span className="text-xs text-slate-400 font-mono">{zone.coordinates}</span>
      </div>

      <h3 className="text-xl font-bold text-white mb-1">{zone.name}</h3>
      <p className="text-xs text-slate-400 mb-4">{zone.status}</p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Population</span>
          </div>
          <div className="text-base font-bold text-white font-mono">{zone.population}</div>
        </div>

        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>Peak Wind</span>
          </div>
          <div className="text-base font-bold text-white font-mono">{zone.windSpeed}</div>
        </div>

        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>Rainfall / 24h</span>
          </div>
          <div className="text-base font-bold text-white font-mono">{zone.rainfall}</div>
        </div>

        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
            <Waves className="w-3.5 h-3.5 text-sky-400" />
            <span>Storm Surge</span>
          </div>
          <div className="text-base font-bold text-white font-mono">{zone.stormSurge}</div>
        </div>
      </div>

      <button
        onClick={onActionClick}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-shield-blue to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-sky-900/30"
      >
        <span>Run Infrastructure & Evacuation Simulation</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
