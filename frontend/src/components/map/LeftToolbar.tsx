import React from 'react';
import { 
  Eye,
  Wind, 
  CloudRain, 
  Thermometer, 
  Gauge, 
  Radio, 
  Waves, 
  Building2, 
  ShieldAlert, 
  Layers,
  Ruler, 
  Maximize2, 
  Navigation, 
  Settings,
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react';

interface LeftToolbarProps {
  activeOverlay: string | null;
  onSelectOverlay: (overlayId: string) => void;
  activeTab: string | null;
  onToggleTab: (tab: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetNorth: () => void;
  onMyLocation: () => void;
  isMeasuringDistance?: boolean;
  onToggleMeasureDistance?: () => void;
  isMeasuringArea?: boolean;
  onToggleMeasureArea?: () => void;
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  activeOverlay,
  onSelectOverlay,
  activeTab,
  onToggleTab,
  onZoomIn,
  onZoomOut,
  onResetNorth,
  onMyLocation,
  isMeasuringDistance = false,
  onToggleMeasureDistance,
  isMeasuringArea = false,
  onToggleMeasureArea
}) => {
  const overlayModes = [
    { id: 'wind', label: 'Wind Velocity Flow', icon: Wind },
    { id: 'rain', label: 'Precipitation Radar', icon: CloudRain },
    { id: 'cyclone', label: 'Tropical Cyclone Tracks', icon: Radio },
    { id: 'temperature', label: 'Surface Temperature', icon: Thermometer },
    { id: 'pressure', label: 'Atmospheric Pressure MSL', icon: Gauge },
    { id: 'satellite', label: 'SAR Satellite Imagery', icon: Eye },
    { id: 'flood', label: 'Inundation / Flood Model', icon: Waves },
    { id: 'infrastructure', label: 'Critical Assets & Shelters', icon: Building2 },
    { id: 'risk', label: 'Composite Risk Grid', icon: ShieldAlert }
  ];

  return (
    <div className="flex flex-col space-y-2 z-30 select-none max-h-[85vh] overflow-y-auto no-scrollbar">
      {/* Primary Map Intelligence Layers */}
      <div className="bg-white/90 backdrop-blur-md border border-[#E5E5E5] p-1.5 rounded-xl shadow-sm flex flex-col space-y-1">
        {overlayModes.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeOverlay === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectOverlay(mode.id)}
              className={`p-2 rounded-lg transition-all relative group flex items-center justify-center cursor-pointer ${
                isActive
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-[#666666] hover:bg-[#F8FAFC] hover:text-[#111111]'
              }`}
              aria-label={mode.label}
            >
              <Icon className="w-4 h-4" />
              <span className="absolute left-full ml-2.5 px-2.5 py-1 bg-white text-[#111111] text-xs font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg border border-[#E5E5E5] z-50">
                {mode.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Tools & Utilities */}
      <div className="bg-white/90 backdrop-blur-md border border-[#E5E5E5] p-1.5 rounded-xl shadow-sm flex flex-col space-y-1">
        <button
          onClick={() => onToggleTab('layers')}
          className={`p-2 rounded-lg transition-all relative group flex items-center justify-center cursor-pointer ${
            activeTab === 'layers'
              ? 'bg-[#16A34A] text-white shadow-xs'
              : 'text-[#666666] hover:bg-[#F8FAFC] hover:text-[#111111]'
          }`}
          aria-label="Layer Visibility Controls"
        >
          <Layers className="w-4 h-4" />
          <span className="absolute left-full ml-2.5 px-2.5 py-1 bg-white text-[#111111] text-xs font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg border border-[#E5E5E5] z-50">
            Layer Visibility Settings
          </span>
        </button>

        {onToggleMeasureDistance && (
          <button
            onClick={onToggleMeasureDistance}
            className={`p-2 rounded-lg transition-all relative group flex items-center justify-center cursor-pointer ${
              isMeasuringDistance ? 'bg-[#16A34A] text-white' : 'text-[#666666] hover:bg-[#F8FAFC] hover:text-[#111111]'
            }`}
            aria-label="Measure Distance"
          >
            <Ruler className="w-4 h-4" />
            <span className="absolute left-full ml-2.5 px-2.5 py-1 bg-white text-[#111111] text-xs font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg border border-[#E5E5E5] z-50">
              Measure Distance
            </span>
          </button>
        )}

        {onToggleMeasureArea && (
          <button
            onClick={onToggleMeasureArea}
            className={`p-2 rounded-lg transition-all relative group flex items-center justify-center cursor-pointer ${
              isMeasuringArea ? 'bg-[#16A34A] text-white' : 'text-[#666666] hover:bg-[#F8FAFC] hover:text-[#111111]'
            }`}
            aria-label="Measure Area"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="absolute left-full ml-2.5 px-2.5 py-1 bg-white text-[#111111] text-xs font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg border border-[#E5E5E5] z-50">
              Measure Area
            </span>
          </button>
        )}

        <button
          onClick={onMyLocation}
          className="p-2 rounded-lg text-[#16A34A] hover:bg-[#F0FDF4] transition-all relative group flex items-center justify-center cursor-pointer"
          aria-label="Center on My Location"
        >
          <Navigation className="w-4 h-4" />
          <span className="absolute left-full ml-2.5 px-2.5 py-1 bg-white text-[#111111] text-xs font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg border border-[#E5E5E5] z-50">
            Center on GPS Location
          </span>
        </button>

        <button
          onClick={() => onToggleTab('settings')}
          className={`p-2 rounded-lg transition-all relative group flex items-center justify-center cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#16A34A] text-white'
              : 'text-[#666666] hover:bg-[#F8FAFC] hover:text-[#111111]'
          }`}
          aria-label="Map Configuration Settings"
        >
          <Settings className="w-4 h-4" />
          <span className="absolute left-full ml-2.5 px-2.5 py-1 bg-white text-[#111111] text-xs font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg border border-[#E5E5E5] z-50">
            Map Settings
          </span>
        </button>
      </div>

      {/* Map Zoom & Orientation Controls */}
      <div className="bg-white/90 backdrop-blur-md border border-[#E5E5E5] p-1.5 rounded-xl shadow-sm flex flex-col space-y-1">
        <button
          onClick={onZoomIn}
          className="p-2 rounded-lg text-[#666666] hover:bg-[#F8FAFC] hover:text-[#111111] transition-all flex items-center justify-center cursor-pointer"
          aria-label="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-2 rounded-lg text-[#666666] hover:bg-[#F8FAFC] hover:text-[#111111] transition-all flex items-center justify-center cursor-pointer"
          aria-label="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={onResetNorth}
          className="p-2 rounded-lg text-[#16A34A] hover:bg-[#F0FDF4] transition-all flex items-center justify-center cursor-pointer"
          aria-label="Reset Orientation to North"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
