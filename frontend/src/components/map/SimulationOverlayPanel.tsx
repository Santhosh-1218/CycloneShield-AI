import React, { useState } from 'react';
import { Sliders, Play, RotateCcw, X } from 'lucide-react';
import { runScenarioSimulation } from '../../services/api';

interface SimulationOverlayPanelProps {
  centerLat: number;
  centerLon: number;
  onClose: () => void;
  onSimulationResult?: (res: any) => void;
}

export const SimulationOverlayPanel: React.FC<SimulationOverlayPanelProps> = ({
  centerLat,
  centerLon,
  onClose,
  onSimulationResult
}) => {
  const [windSpeed, setWindSpeed] = useState(165);
  const [rainfall, setRainfall] = useState(280);
  const [stormSurge, setStormSurge] = useState(3.2);
  const [duration, setDuration] = useState('24 hours');

  const [isRunning, setIsRunning] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

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
    if (onSimulationResult) {
      onSimulationResult(res);
    }
  };

  const handleReset = () => {
    setWindSpeed(150);
    setRainfall(250);
    setStormSurge(2.5);
    setDuration('24 hours');
  };

  const riskScore = simResult?.simulated_risk?.score 
    ? Math.round(simResult.simulated_risk.score * 100) 
    : Math.round(Math.min(100, (windSpeed / 280) * 45 + (rainfall / 450) * 35 + (stormSurge / 6) * 20));

  const exposedPop = simResult?.impact_delta?.estimated_exposed_population
    ? simResult.impact_delta.estimated_exposed_population.toLocaleString()
    : (Math.round(windSpeed * 420 + rainfall * 180)).toLocaleString();

  const criticalAssets = simResult?.impact_delta?.critical_facilities_count
    ? simResult.impact_delta.critical_facilities_count
    : Math.round(windSpeed / 8 + stormSurge * 4);

  return (
    <div className="w-96 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl p-5 text-slate-100 flex flex-col space-y-4 z-40 select-none max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Sliders className="w-4 h-4" />
          <span>Cyclone Impact Simulation</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleReset}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Reset Scenario Parameters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Simulate hypothetical cyclone wind speed, 24h rainfall accumulation, and storm surge levels for target coordinates ({centerLat.toFixed(2)}°, {centerLon.toFixed(2)}°).
      </p>

      {/* Sliders Form */}
      <div className="space-y-4 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
        {/* Wind Speed */}
        <div>
          <div className="flex justify-between font-mono mb-1">
            <span className="text-slate-400">Wind Speed</span>
            <span className="text-cyan-400 font-bold">{windSpeed} km/h</span>
          </div>
          <input
            type="range"
            min="40"
            max="280"
            step="5"
            value={windSpeed}
            onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Rainfall */}
        <div>
          <div className="flex justify-between font-mono mb-1">
            <span className="text-slate-400">24h Rainfall</span>
            <span className="text-blue-400 font-bold">{rainfall} mm</span>
          </div>
          <input
            type="range"
            min="10"
            max="450"
            step="10"
            value={rainfall}
            onChange={(e) => setRainfall(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Storm Surge */}
        <div>
          <div className="flex justify-between font-mono mb-1">
            <span className="text-slate-400">Storm Surge Height</span>
            <span className="text-teal-400 font-bold">{stormSurge.toFixed(1)} m</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="6.0"
            step="0.1"
            value={stormSurge}
            onChange={(e) => setStormSurge(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="text-slate-400 block mb-1 font-mono">Simulation Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="12 hours">12 hours</option>
            <option value="24 hours">24 hours</option>
            <option value="48 hours">48 hours</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleRunSimulation}
        disabled={isRunning}
        className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
      >
        <Play className={`w-3.5 h-3.5 fill-white ${isRunning ? 'animate-spin' : ''}`} />
        <span>{isRunning ? 'Running Calculations...' : 'RUN SIMULATION'}</span>
      </button>

      {/* Simulation Result Box */}
      <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
        <span className="text-[11px] font-extrabold font-mono text-cyan-400 uppercase tracking-wider block">
          SIMULATION RESULT SUMMARY
        </span>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block">SIMULATED RISK</span>
            <span className="text-xl font-bold text-red-400 font-mono">{riskScore} / 100</span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block">EXPOSED POPULATION</span>
            <span className="text-sm font-bold text-amber-300 font-mono mt-1 block">{exposedPop}</span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block">CRITICAL ASSETS</span>
            <span className="text-sm font-bold text-cyan-300 font-mono mt-1 block">{criticalAssets} Facilities</span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block">HIGH RISK ROADS</span>
            <span className="text-sm font-bold text-orange-400 font-mono mt-1 block">18 Corridors</span>
          </div>
        </div>
      </div>
    </div>
  );
};
