import React from 'react';
import { X, Check, Eye, EyeOff, Sliders } from 'lucide-react';

export interface LayerState {
  // Weather
  temperature: boolean;
  rainfall: boolean;
  precipitationProb: boolean;
  wind: boolean;
  humidity: boolean;
  pressure: boolean;

  // Satellite
  satelliteImagery: boolean;

  // Disaster
  floodIndicator: boolean;
  cycloneTrack: boolean;
  riskZones: boolean;

  // Terrain
  elevation: boolean;
  landCover: boolean;

  // Infrastructure
  hospitals: boolean;
  shelters: boolean;
  schools: boolean;
  roads: boolean;
  bridges: boolean;
  buildings: boolean;
}

interface LayerSelectorModalProps {
  layers: LayerState;
  onToggleLayer: (key: keyof LayerState) => void;
  opacity: number;
  onOpacityChange: (val: number) => void;
  onClose: () => void;
}

export const LayerSelectorModal: React.FC<LayerSelectorModalProps> = ({
  layers,
  onToggleLayer,
  opacity,
  onOpacityChange,
  onClose
}) => {
  const categories = [
    {
      title: 'LIVE WEATHER',
      items: [
        { key: 'temperature', label: 'Temperature Overlay' },
        { key: 'rainfall', label: 'Rainfall Accumulation' },
        { key: 'precipitationProb', label: 'Precipitation Probability' },
        { key: 'wind', label: 'Wind Vector Speed & Direction' },
        { key: 'humidity', label: 'Relative Humidity' },
        { key: 'pressure', label: 'Surface Pressure' }
      ]
    },
    {
      title: 'SATELLITE',
      items: [
        { key: 'satelliteImagery', label: 'Sentinel-1 SAR Satellite Observation' }
      ]
    },
    {
      title: 'DISASTER & RISK',
      items: [
        { key: 'floodIndicator', label: 'Potential Flood Area Inundation' },
        { key: 'cycloneTrack', label: 'Cyclone Track & Cone of Uncertainty' },
        { key: 'riskZones', label: 'Disaster Risk Heatmap' }
      ]
    },
    {
      title: 'TERRAIN',
      items: [
        { key: 'elevation', label: 'NASADEM Topographical Elevation' },
        { key: 'landCover', label: 'Dynamic World Land Cover' }
      ]
    },
    {
      title: 'OSM INFRASTRUCTURE',
      items: [
        { key: 'hospitals', label: 'Hospitals & Medical Centers' },
        { key: 'shelters', label: 'Evacuation Cyclone Shelters' },
        { key: 'schools', label: 'Schools & Relief Camps' },
        { key: 'roads', label: 'Evacuation Roads & Highways' },
        { key: 'bridges', label: 'Bridges & Coastal Causeways' },
        { key: 'buildings', label: 'Infrastructure Footprints' }
      ]
    }
  ];

  return (
    <div className="w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl p-4 text-slate-100 flex flex-col space-y-3 z-40 select-none max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
          <Sliders className="w-4 h-4" />
          <span>Layer Control</span>
        </span>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Opacity Slider */}
      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 space-y-1 text-xs">
        <div className="flex justify-between font-mono">
          <span className="text-slate-400">Overlay Opacity</span>
          <span className="text-cyan-400 font-bold">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-1.5">
            <span className="text-[10px] font-extrabold font-mono text-slate-400 uppercase tracking-widest block px-1">
              {cat.title}
            </span>
            <div className="space-y-1">
              {cat.items.map((item) => {
                const isChecked = Boolean(layers[item.key as keyof LayerState]);
                return (
                  <button
                    key={item.key}
                    onClick={() => onToggleLayer(item.key as keyof LayerState)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all border ${
                      isChecked
                        ? 'bg-cyan-950/50 text-cyan-200 border-cyan-500/40 shadow-sm'
                        : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        isChecked ? 'bg-cyan-600 border-cyan-400 text-white' : 'border-slate-600 bg-slate-900'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {isChecked ? <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-2" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
