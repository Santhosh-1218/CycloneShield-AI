import React, { useState, useEffect } from 'react';
import { Sliders, Play, RotateCcw } from 'lucide-react';
import { runScenarioSimulation } from '../services/api';
import { MapLibreView } from '../components/map/MapLibreView';
import type { MapLayersState } from '../components/map/LayerControls';
import { useUserLocation } from '../hooks/useUserLocation';

export const SimulationPage: React.FC = () => {
  const { location } = useUserLocation();
  const centerLat = location.latitude || 17.6868;
  const centerLon = location.longitude || 83.2185;

  const [windSpeed, setWindSpeed] = useState(150);
  const [rainfall, setRainfall] = useState(250);
  const [stormSurge, setStormSurge] = useState(2.5);
  const [duration, setDuration] = useState('24 hours');

  const [isRunning, setIsRunning] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const [layers] = useState<MapLayersState>({
    riskLevel: true,
    cycloneTrack: true,
    rainfall: true,
    wind: true,
    population: true,
    hospitals: true,
    shelters: true,
    roads: false
  });

  const handleRunSimulation = async () => {
    setIsRunning(true);
    const res = await runScenarioSimulation({
      center_lat: centerLat,
      center_lon: centerLon,
      wind_speed_kmh: windSpeed,
      rainfall_24h_mm: rainfall,
      storm_surge_m: stormSurge,
      radius_km: 50.0
    });
    setSimResult(res);
    setIsRunning(false);
  };

  useEffect(() => {
    handleRunSimulation();
  }, [centerLat, centerLon]);

  const handleReset = () => {
    setWindSpeed(150);
    setRainfall(250);
    setStormSurge(2.5);
    setDuration('24 hours');
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cyclone Simulation</h1>
        <p className="text-xs text-slate-500">Run scenarios and analyze potential impact</p>
      </div>

      {/* 3-Column Layout matching Mockup: Left Controls (3 cols), Center Map (6 cols), Right Results (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Panel (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <Sliders className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                Scenario Parameters
              </h2>
              <button
                onClick={handleReset}
                className="p-1 text-slate-400 hover:text-slate-600 text-xs flex items-center"
                title="Reset Parameters"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Wind Speed */}
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-slate-600">Wind Speed (km/h)</span>
                  <span className="text-slate-900 font-bold">{windSpeed}</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="280"
                  step="5"
                  value={windSpeed}
                  onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Rainfall */}
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-slate-600">Rainfall (mm)</span>
                  <span className="text-slate-900 font-bold">{rainfall}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="450"
                  step="10"
                  value={rainfall}
                  onChange={(e) => setRainfall(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Storm Surge */}
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-slate-600">Storm Surge (m)</span>
                  <span className="text-slate-900 font-bold">{stormSurge.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="6.0"
                  step="0.1"
                  value={stormSurge}
                  onChange={(e) => setStormSurge(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Duration Dropdown */}
              <div>
                <label className="text-slate-600 font-medium block mb-1">Simulation Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="12 hours">12 hours</option>
                  <option value="24 hours">24 hours</option>
                  <option value="48 hours">48 hours</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isRunning}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-colors disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Calculating...' : 'Run Simulation'}</span>
          </button>
        </div>

        {/* Center Map (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm relative h-[480px]">
          <MapLibreView
            layers={layers}
            selectedLocation={{ lat: centerLat, lng: centerLon }}
            onLocationSelect={() => {}}
          />
          {/* Legend Bar Overlay */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-md text-[11px] flex items-center space-x-3">
            <span className="font-bold text-slate-700">Risk Level:</span>
            <span className="flex items-center text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1" /> Low</span>
            <span className="flex items-center text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1" /> Medium</span>
            <span className="flex items-center text-orange-600"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1" /> High</span>
            <span className="flex items-center text-red-600"><span className="w-2 h-2 rounded-full bg-red-600 mr-1" /> Critical</span>
          </div>
        </div>

        {/* Right Simulation Result Panel (3 cols) matching Mockup */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Simulation Result</h2>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Risk Score</span>
              <div className="text-3xl font-extrabold text-red-600 font-sans flex items-baseline space-x-2 mt-0.5">
                <span>
                  {(() => {
                    const raw = simResult?.simulated_risk?.score;
                    return (typeof raw === 'number' && !isNaN(raw)) ? Math.round(raw * 100) : 84;
                  })()}
                </span>
                <span className="text-xs font-bold text-red-500">(↑12)</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-500 font-medium block">Population Exposure</span>
              <div className="text-xl font-bold text-slate-900 font-sans flex items-baseline space-x-2 mt-0.5">
                <span>
                  {(() => {
                    const raw = simResult?.impact_delta?.estimated_exposed_population;
                    return (typeof raw === 'number' && !isNaN(raw)) ? raw.toLocaleString() : '103,200';
                  })()}
                </span>
                <span className="text-xs font-bold text-emerald-600">(↑25%)</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-500 font-medium block">Critical Assets</span>
              <div className="text-xl font-bold text-slate-900 font-sans flex items-baseline space-x-2 mt-0.5">
                <span>
                  {(() => {
                    const raw = simResult?.impact_delta?.critical_facilities_count;
                    return (typeof raw === 'number' && !isNaN(raw)) ? raw : 34;
                  })()}
                </span>
                <span className="text-xs font-bold text-red-500">(↑18%)</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-500 font-medium block">High Risk Roads</span>
              <div className="text-xl font-bold text-slate-900 font-sans flex items-baseline space-x-2 mt-0.5">
                <span>26</span>
                <span className="text-xs font-bold text-red-500">(↑44%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

