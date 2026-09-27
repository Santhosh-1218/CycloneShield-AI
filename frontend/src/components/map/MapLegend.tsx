import React from 'react';
import { Wind, CloudRain, Thermometer, Gauge, ShieldAlert, Radio, Waves, Building2, Eye } from 'lucide-react';

interface MapLegendProps {
  activeOverlay: string | null;
  retrievedAt?: string;
  sourceProvider?: string;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  activeOverlay,
  retrievedAt = 'Just now',
  sourceProvider = 'Open-Meteo & GDACS'
}) => {
  if (!activeOverlay) return null;

  const renderLegendContent = () => {
    switch (activeOverlay) {
      case 'wind':
        return (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center space-x-1.5">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>WIND SPEED FIELD</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">km/h</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 via-amber-400 via-orange-500 to-red-600 shadow-inner" />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0</span>
              <span>20</span>
              <span>40</span>
              <span>60</span>
              <span>90+</span>
            </div>
          </div>
        );

      case 'rain':
        return (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center space-x-1.5">
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                <span>RAINFALL INTENSITY</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">mm / 24h</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 via-purple-600 to-red-500 shadow-inner" />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0</span>
              <span>5</span>
              <span>15</span>
              <span>30</span>
              <span>50+</span>
            </div>
          </div>
        );

      case 'temperature':
        return (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center space-x-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>SURFACE TEMPERATURE</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">°C</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 via-emerald-400 via-amber-400 to-red-600 shadow-inner" />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>10°</span>
              <span>20°</span>
              <span>30°</span>
              <span>40°+</span>
            </div>
          </div>
        );

      case 'pressure':
        return (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center space-x-1.5">
                <Gauge className="w-3.5 h-3.5 text-purple-400" />
                <span>SURFACE PRESSURE</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">hPa</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-purple-700 via-indigo-600 via-cyan-500 via-amber-400 to-emerald-500 shadow-inner" />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>LOW (&lt;990)</span>
              <span>1000</span>
              <span>1013</span>
              <span>HIGH (&gt;1025)</span>
            </div>
          </div>
        );

      case 'cyclone':
        return (
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-red-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>CYCLONE TRACK &amp; ALERT CONE</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-600 border border-white" />
                <span>Storm Center</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-4 h-1 bg-red-500 rounded" />
                <span>Observed Track</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-4 h-1 bg-amber-500 rounded border-b border-dashed" />
                <span>Forecast Track</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-400" />
                <span>Warning Polygon</span>
              </div>
            </div>
          </div>
        );

      case 'flood':
        return (
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-cyan-400">
              <Waves className="w-3.5 h-3.5" />
              <span>COASTAL FLOOD &amp; INUNDATION</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-slate-300">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-red-500/60 border border-red-400" />
                <span>High Inundation Risk</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-cyan-500/40 border border-cyan-400" />
                <span>Lowland Vulnerability Zone</span>
              </div>
            </div>
          </div>
        );

      case 'surge':
        return (
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-purple-400">
              <Waves className="w-3.5 h-3.5" />
              <span>STORM SURGE INUNDATION MODEL</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-red-600 shadow-inner" />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0.5m</span>
              <span>1.5m</span>
              <span>3.0m</span>
              <span>5.0m+</span>
            </div>
          </div>
        );

      case 'infrastructure':
        return (
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-emerald-400">
              <Building2 className="w-3.5 h-3.5" />
              <span>CRITICAL INFRASTRUCTURE GIS</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Hospitals &amp; Medical</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Evacuation Shelters</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Schools &amp; Public</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                <span>Bridges &amp; Passages</span>
              </div>
            </div>
          </div>
        );

      case 'risk':
        return (
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>COMPOSITE RISK INDEX (H*E*V)</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 via-orange-500 to-red-600 shadow-inner" />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span className="text-emerald-400 font-bold">LOW</span>
              <span className="text-amber-400 font-bold">MODERATE</span>
              <span className="text-orange-400 font-bold">HIGH</span>
              <span className="text-red-400 font-bold">CRITICAL</span>
            </div>
          </div>
        );

      case 'satellite':
        return (
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-sky-400">
              <Eye className="w-3.5 h-3.5" />
              <span>SATELLITE EARTH OBSERVATION</span>
            </div>
            <div className="text-[11px] text-slate-300">
              High resolution optical &amp; SAR orbital basemap.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-2xl shadow-2xl space-y-2 max-w-xs w-full text-slate-100 select-none">
      {renderLegendContent()}
      <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-400">
        <span>Source: {sourceProvider}</span>
        <span>Updated: {retrievedAt}</span>
      </div>
    </div>
  );
};
