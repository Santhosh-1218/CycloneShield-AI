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
    { id: 'satellite', label: 'Satellite', icon: Eye, color: 'text-sky-400' },
    { id: 'wind', label: 'Wind Flow', icon: Wind, color: 'text-cyan-400' },
    { id: 'rain', label: 'Rainfall', icon: CloudRain, color: 'text-blue-400' },
    { id: 'temperature', label: 'Temperature', icon: Thermometer, color: 'text-amber-400' },
    { id: 'pressure', label: 'Pressure', icon: Gauge, color: 'text-purple-400' },
    { id: 'cyclone', label: 'Cyclone Track', icon: Radio, color: 'text-red-400' },
    { id: 'flood', label: 'Flood Risk', icon: Waves, color: 'text-teal-400' },
    { id: 'surge', label: 'Storm Surge', icon: Waves, color: 'text-indigo-400' },
    { id: 'infrastructure', label: 'Infrastructure', icon: Building2, color: 'text-emerald-400' },
    { id: 'risk', label: 'Risk Map', icon: ShieldAlert, color: 'text-amber-500' }
  ];

  return (
    <div className="flex flex-col space-y-2 z-30 select-none max-h-[85vh] overflow-y-auto no-scrollbar">
      {/* Primary Map Overlay Modes Toolbar (Zoom-Earth Concept) */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl flex flex-col space-y-1">
        {overlayModes.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeOverlay === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectOverlay(mode.id)}
              title={mode.label}
              className={`p-2 rounded-xl transition-all relative group flex items-center justify-center ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/40 ring-1 ring-cyan-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : mode.color}`} />
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900/95 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-slate-700 z-50">
                {mode.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Utilities & Layer Customization Toolbar */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl flex flex-col space-y-1">
        <button
          onClick={() => onToggleTab('layers')}
          title="Layer Visibility Settings"
          className={`p-2 rounded-xl transition-all relative group flex items-center justify-center ${
            activeTab === 'layers'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900/95 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-slate-700 z-50">
            Layer Controls
          </span>
        </button>

        {onToggleMeasureDistance && (
          <button
            onClick={onToggleMeasureDistance}
            title="Measure Distance"
            className={`p-2 rounded-xl transition-all relative group flex items-center justify-center ${
              isMeasuringDistance ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Ruler className="w-4 h-4 text-amber-400" />
            <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900/95 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-slate-700 z-50">
              Measure Distance
            </span>
          </button>
        )}

        {onToggleMeasureArea && (
          <button
            onClick={onToggleMeasureArea}
            title="Measure Area"
            className={`p-2 rounded-xl transition-all relative group flex items-center justify-center ${
              isMeasuringArea ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Maximize2 className="w-4 h-4 text-amber-400" />
            <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900/95 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-slate-700 z-50">
              Measure Area
            </span>
          </button>
        )}

        <button
          onClick={onMyLocation}
          title="My Location"
          className="p-2 rounded-xl text-cyan-400 hover:bg-slate-800 hover:text-cyan-300 transition-all relative group flex items-center justify-center"
        >
          <Navigation className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900/95 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-slate-700 z-50">
            Locate Me
          </span>
        </button>

        <button
          onClick={() => onToggleTab('settings')}
          title="Map Settings & Basemaps"
          className={`p-2 rounded-xl transition-all relative group flex items-center justify-center ${
            activeTab === 'settings'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900/95 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-slate-700 z-50">
            Map Settings
          </span>
        </button>
      </div>

      {/* Map Zoom & View Controls */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl flex flex-col space-y-1">
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={onResetNorth}
          title="Reset View"
          className="p-2 rounded-xl text-cyan-400 hover:bg-slate-800 transition-all flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
