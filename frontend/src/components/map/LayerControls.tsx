import React from 'react';
import { Layers, Wind, CloudRain, Hospital, Home, Navigation, AlertTriangle, Satellite, Waves, Thermometer, Droplets, Gauge } from 'lucide-react';

export interface MapLayersState {
  temperature?: boolean;
  rainfall: boolean;
  precipitationProb?: boolean;
  wind: boolean;
  humidity?: boolean;
  pressure?: boolean;
  satelliteImagery?: boolean;
  floodIndicator?: boolean;
  riskLevel?: boolean;
  cycloneTrack?: boolean;
  riskZones?: boolean;
  elevation?: boolean;
  landCover?: boolean;
  population?: boolean;
  hospitals: boolean;
  shelters: boolean;
  roads: boolean;
  bridges?: boolean;
  buildings?: boolean;
}

interface LayerControlsProps {
  layers: MapLayersState;
  onToggleLayer: (layerKey: keyof MapLayersState) => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({ layers, onToggleLayer }) => {
  const layerButtons: Array<{ key: keyof MapLayersState; label: string; icon: React.ElementType; color: string }> = [
    { key: 'cycloneTrack', label: 'Cyclone Track', icon: Navigation, color: 'text-red-400' },
    { key: 'rainfall', label: 'Precipitation', icon: CloudRain, color: 'text-sky-400' },
    { key: 'wind', label: 'Wind Field', icon: Wind, color: 'text-cyan-400' },
    { key: 'floodIndicator', label: 'Flood Areas', icon: Waves, color: 'text-blue-400' },
    { key: 'riskLevel', label: 'Risk Level', icon: AlertTriangle, color: 'text-amber-400' },
    { key: 'temperature', label: 'Temperature', icon: Thermometer, color: 'text-orange-400' },
    { key: 'humidity', label: 'Humidity', icon: Droplets, color: 'text-teal-400' },
    { key: 'pressure', label: 'Pressure', icon: Gauge, color: 'text-indigo-400' },
    { key: 'satelliteImagery', label: 'Satellite', icon: Satellite, color: 'text-purple-400' },
    { key: 'hospitals', label: 'Hospitals', icon: Hospital, color: 'text-emerald-400' },
    { key: 'shelters', label: 'Shelters', icon: Home, color: 'text-yellow-400' },
    { key: 'roads', label: 'Roads', icon: Layers, color: 'text-slate-400' },
  ];

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl">
      <div className="flex items-center space-x-2 pb-2.5 mb-2.5 border-b border-slate-700/60">
        <Layers className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-extrabold text-white tracking-wider uppercase">Map Layer Controls</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5">
        {layerButtons.map(({ key, label, icon: Icon, color }) => {
          const active = Boolean(layers[key]);
          return (
            <button
              key={key}
              onClick={() => onToggleLayer(key)}
              className={`
                flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all text-left
                ${active 
                  ? 'bg-slate-800 border-cyan-500/50 text-white shadow-sm ring-1 ring-cyan-500/30' 
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
              `}
            >
              <Icon className={`w-3.5 h-3.5 ${color} ${active ? 'opacity-100' : 'opacity-40'}`} />
              <span className="truncate flex-1">{label}</span>
              <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-cyan-400 shadow-sm shadow-cyan-400' : 'bg-slate-700'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

