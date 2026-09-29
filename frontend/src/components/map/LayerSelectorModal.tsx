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
        { key: 'wind', label: 'Wind Particles & Direction' },
        { key: 'rainfall', label: 'Rainfall Radar Accumulation' },
        { key: 'temperature', label: 'Surface Temperature' },
        { key: 'pressure', label: 'Atmospheric Pressure' },
        { key: 'humidity', label: 'Relative Humidity' }
      ]
    },
    {
      title: 'SEVERE WEATHER & RISK',
      items: [
        { key: 'cycloneTrack', label: 'Cyclone Tracks & Warning Cones' },
        { key: 'floodIndicator', label: 'Coastal & River Flood Inundation' },
        { key: 'riskZones', label: 'Hazard × Exposure Risk Grid' }
      ]
    },
    {
      title: 'SATELLITE & TERRAIN',
      items: [
        { key: 'satelliteImagery', label: 'High-Res Optical Satellite' },
        { key: 'elevation', label: 'NASADEM Coastal Elevation' }
      ]
    },
    {
      title: 'CRITICAL INFRASTRUCTURE',
      items: [
        { key: 'hospitals', label: 'Hospitals & Medical Centers' },
        { key: 'shelters', label: 'Cyclone Evacuation Shelters' },
        { key: 'schools', label: 'Emergency Relief Camps' },
        { key: 'roads', label: 'Evacuation Highways' },
        { key: 'bridges', label: 'Coastal Bridges & Causeways' }
      ]
    }
  ];

  return (
    <div className="w-80 bg-white border border-[#E5E5E5] rounded-xl shadow-xl p-4 text-[#111111] flex flex-col space-y-3 z-40 select-none max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
        <span className="font-bold text-xs uppercase tracking-wider text-[#16A34A] flex items-center space-x-1.5">
          <Sliders className="w-4 h-4" />
          <span>Layer Control</span>
        </span>
        <button onClick={onClose} className="p-1 text-[#888888] hover:text-[#111111] rounded-md transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Opacity Slider */}
      <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E5E5E5] space-y-1 text-xs">
        <div className="flex justify-between font-medium">
          <span className="text-[#666666]">Overlay Opacity</span>
          <span className="text-[#16A34A] font-bold">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-[#E5E5E5] rounded-lg appearance-none cursor-pointer accent-[#16A34A]"
        />
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block px-1">
              {cat.title}
            </span>
            <div className="space-y-1">
              {cat.items.map((item) => {
                const isChecked = Boolean(layers[item.key as keyof LayerState]);
                return (
                  <button
                    key={item.key}
                    onClick={() => onToggleLayer(item.key as keyof LayerState)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all border cursor-pointer ${
                      isChecked
                        ? 'bg-[#F0FDF4] text-[#111111] border-[#BBF7D0] shadow-xs'
                        : 'bg-white text-[#666666] hover:bg-[#F8FAFC] hover:text-[#111111] border-[#E5E5E5]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        isChecked ? 'bg-[#16A34A] border-[#15803D] text-white' : 'border-[#CCCCCC] bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate font-medium">{item.label}</span>
                    </div>
                    {isChecked ? <Eye className="w-3.5 h-3.5 text-[#16A34A] shrink-0 ml-2" /> : <EyeOff className="w-3.5 h-3.5 text-[#888888] shrink-0 ml-2" />}
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
