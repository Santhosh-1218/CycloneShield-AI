import React from 'react';
import type { MapLayersState } from './LayerControls';
import { useUserLocation } from '../../hooks/useUserLocation';
import type { RiskLevel } from '../../types';
import { AlertTriangle, Hospital, Home, Navigation, Shield } from 'lucide-react';

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

interface MapVisualizationProps {
  layers: MapLayersState;
  onSelectZone: (zone: ZoneData) => void;
  onProtectedFeatureClick?: () => void;
}

export const MapVisualization: React.FC<MapVisualizationProps> = ({
  layers,
  onSelectZone,
  onProtectedFeatureClick
}) => {
  const { location } = useUserLocation();

  const zones: ZoneData[] = [
    {
      id: 'zone-1',
      name: 'Visakhapatnam Urban & Port',
      riskLevel: 'Critical',
      population: '1,730,000',
      windSpeed: '185 km/h',
      rainfall: '240 mm',
      stormSurge: '3.8 m',
      coordinates: '17.6868° N, 83.2185° E',
      status: 'Mandatory Evacuation Advised'
    },
    {
      id: 'zone-2',
      name: 'Kakinada Coastal Belt',
      riskLevel: 'High',
      population: '890,000',
      windSpeed: '145 km/h',
      rainfall: '190 mm',
      stormSurge: '2.5 m',
      coordinates: '16.9891° N, 82.2475° E',
      status: 'High Alert / Shelters Open'
    },
    {
      id: 'zone-3',
      name: 'Srikakulam North Coastal',
      riskLevel: 'Medium',
      population: '540,000',
      windSpeed: '110 km/h',
      rainfall: '130 mm',
      stormSurge: '1.4 m',
      coordinates: '18.2969° N, 83.8968° E',
      status: 'Monitoring Rain & Surge'
    },
    {
      id: 'zone-4',
      name: 'Machilipatnam Lowlands',
      riskLevel: 'Low',
      population: '320,000',
      windSpeed: '75 km/h',
      rainfall: '85 mm',
      stormSurge: '0.8 m',
      coordinates: '16.1809° N, 81.1303° E',
      status: 'Standby Advisory'
    }
  ];

  return (
    <div className="relative w-full h-[520px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between select-none">
      {/* Top Header Badge Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono font-semibold flex items-center space-x-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Demo Data — Prototype Scenario</span>
        </span>
        <span className="hidden sm:inline-block px-3 py-1 bg-navy-800/80 text-slate-300 border border-slate-700 rounded-full text-xs font-mono">
          Cyclone Demo-01 (Cat 4)
        </span>
      </div>

      {/* Map Interactive Canvas via SVG */}
      <div className="relative w-full h-full bg-[#080d1a] overflow-hidden flex items-center justify-center">
        {/* Synthetic Map Background Mesh */}
        <svg className="w-full h-full absolute inset-0 text-slate-800/40" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>

            <radialGradient id="cycloneGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
              <stop offset="40%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Coastal Line Path Representation */}
          <path
            d="M 120,40 C 220,120 320,180 380,260 C 420,320 480,420 540,500"
            fill="none"
            stroke="#1e293b"
            strokeWidth="32"
            strokeLinecap="round"
          />
          <path
            d="M 120,40 C 220,120 320,180 380,260 C 420,320 480,420 540,500"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="6 4"
            className="opacity-40"
          />

          {/* Risk Level Radii (Zone 1 Impact Circle) */}
          {layers.riskLevel && (
            <g>
              <circle cx="380" cy="260" r="140" fill="url(#cycloneGrad)" />
              <circle cx="380" cy="260" r="140" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" fill="none" className="animate-ping opacity-25" />
              <circle cx="380" cy="260" r="90" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
              <circle cx="380" cy="260" r="40" stroke="#ef4444" strokeWidth="2" fill="none" />
            </g>
          )}

          {/* Cyclone Track Vector Line */}
          {layers.cycloneTrack && (
            <g>
              <path
                d="M 680,440 C 580,380 480,310 380,260"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeDasharray="8 6"
              />
              {/* Cyclone Eye Position */}
              <g transform="translate(380, 260)">
                <circle r="12" fill="#ef4444" className="animate-pulse" />
                <circle r="22" stroke="#ef4444" strokeWidth="2" fill="none" />
                <path d="M -16,0 A 16,16 0 0,1 16,0" stroke="#ffffff" strokeWidth="2" fill="none" />
              </g>
              <text x="395" y="245" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">
                EYE (Cat 4 - 185 km/h)
              </text>
            </g>
          )}

          {/* Road Network Overlays */}
          {layers.roads && (
            <g stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" className="opacity-60">
              <line x1="180" y1="100" x2="380" y2="260" />
              <line x1="380" y1="260" x2="480" y2="380" />
              <line x1="380" y1="260" x2="280" y2="340" />
            </g>
          )}
        </svg>

        {/* Interactive Zone Hotspots Overlay */}
        <div className="absolute inset-0 pointer-events-auto">
          {/* Zone 1: Vizag */}
          <button
            onClick={() => onSelectZone(zones[0])}
            className="absolute top-[48%] left-[46%] -translate-x-1/2 -translate-y-1/2 p-3 group focus:outline-none"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-red-500/40 animate-ping" />
              <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-lg">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-navy-800/95 border border-red-500/50 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white whitespace-nowrap shadow-xl">
              Visakhapatnam (Critical)
            </div>
          </button>

          {/* Zone 2: Kakinada */}
          <button
            onClick={() => onSelectZone(zones[1])}
            className="absolute top-[68%] left-[58%] -translate-x-1/2 -translate-y-1/2 p-3 group focus:outline-none"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-lg">
                <AlertTriangle className="w-3 h-3" />
              </div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-navy-800/95 border border-orange-500/50 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white whitespace-nowrap shadow-xl">
              Kakinada (High)
            </div>
          </button>

          {/* Zone 3: Srikakulam */}
          <button
            onClick={() => onSelectZone(zones[2])}
            className="absolute top-[28%] left-[28%] -translate-x-1/2 -translate-y-1/2 p-3 group focus:outline-none"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-lg">
                <AlertTriangle className="w-3 h-3" />
              </div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-navy-800/95 border border-amber-500/50 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white whitespace-nowrap shadow-xl">
              Srikakulam (Medium)
            </div>
          </button>

          {/* Hospital Markers */}
          {layers.hospitals && (
            <div className="absolute top-[44%] left-[42%] flex items-center space-x-1 bg-emerald-950/80 border border-emerald-500/40 rounded px-1.5 py-0.5 text-[10px] text-emerald-300 font-mono">
              <Hospital className="w-3 h-3 text-emerald-400" />
              <span>General Hospital</span>
            </div>
          )}

          {/* Shelter Markers */}
          {layers.shelters && (
            <div className="absolute top-[72%] left-[52%] flex items-center space-x-1 bg-amber-950/80 border border-amber-500/40 rounded px-1.5 py-0.5 text-[10px] text-amber-300 font-mono">
              <Home className="w-3 h-3 text-amber-400" />
              <span>Primary Shelter (Cap: 2,500)</span>
            </div>
          )}

          {/* Browser Location Marker if Granted */}
          {location.status === 'granted' && location.latitude !== null && location.longitude !== null && (
            <div className="absolute top-[52%] left-[40%] flex items-center space-x-1.5 bg-sky-950/90 border border-shield-accent rounded-full px-2.5 py-1 text-[11px] text-shield-accent font-mono shadow-lg animate-bounce">
              <Navigation className="w-3.5 h-3.5 text-shield-accent fill-shield-accent" />
              <span>Your Location ({location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°)</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Footer Legend & Controls */}
      <div className="bg-navy-900/90 border-t border-slate-800 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 z-10 text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-slate-300">Risk Spectrum:</span>
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Low</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Medium</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>High</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <span>Critical</span>
            </span>
          </div>
        </div>

        {onProtectedFeatureClick && (
          <button
            onClick={onProtectedFeatureClick}
            className="px-3 py-1.5 rounded-lg bg-shield-blue/20 hover:bg-shield-blue/30 text-shield-accent border border-shield-blue/30 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Run Advanced Predictive Overlay</span>
          </button>
        )}
      </div>
    </div>
  );
};
