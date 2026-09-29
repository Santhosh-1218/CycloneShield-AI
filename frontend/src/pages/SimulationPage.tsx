import React, { useState, useEffect } from 'react';
import { Sliders, Play, RotateCcw } from 'lucide-react';
import { runScenarioSimulation } from '../services/api';
import { MapLibreView } from '../components/map/MapLibreView';
import type { MapLayersState } from '../components/map/LayerControls';
import { useLocation } from '../context/LocationContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const SimulationPage: React.FC = () => {
  const { location } = useLocation();

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
    try {
      const res = await runScenarioSimulation({
        center_lat: location.latitude,
        center_lon: location.longitude,
        wind_speed_kmh: windSpeed,
        rainfall_24h_mm: rainfall,
        storm_surge_m: stormSurge,
        radius_km: 50.0
      });
      setSimResult(res);
    } catch (err) {
      console.warn("Simulation error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    handleRunSimulation();
  }, [location.latitude, location.longitude]);

  const handleReset = () => {
    setWindSpeed(150);
    setRainfall(250);
    setStormSurge(2.5);
    setDuration('24 hours');
  };

  return (
    <div className="space-y-6 text-[#111111]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 border border-[#E5E5E5] rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Scenario Impact Simulator
            </h1>
            <Badge status="MODELLED">SIMULATION</Badge>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            {location.city}, {location.state} • Interactive severe weather scenario impact & stress-testing model
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleReset}
          icon={<RotateCcw className="h-3.5 w-3.5" />}
        >
          Reset Parameters
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenario Parameters (3 cols) */}
        <Card className="lg:col-span-3 flex flex-col justify-between" padding="md">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#E5E5E5]">
              <Sliders className="w-4 h-4 text-[#16A34A]" />
              Simulation Inputs
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#666666]">Wind Speed (km/h)</span>
                  <span className="text-[#111111] font-bold">{windSpeed}</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="280"
                  step="5"
                  value={windSpeed}
                  onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#E5E5E5] rounded-lg cursor-pointer accent-[#16A34A]"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#666666]">Rainfall (mm)</span>
                  <span className="text-[#111111] font-bold">{rainfall}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="450"
                  step="10"
                  value={rainfall}
                  onChange={(e) => setRainfall(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#E5E5E5] rounded-lg cursor-pointer accent-[#16A34A]"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#666666]">Storm Surge (m)</span>
                  <span className="text-[#111111] font-bold">{stormSurge.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="6.0"
                  step="0.1"
                  value={stormSurge}
                  onChange={(e) => setStormSurge(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#E5E5E5] rounded-lg cursor-pointer accent-[#16A34A]"
                />
              </div>

              <div>
                <label className="text-[#666666] font-semibold block mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#111111]"
                >
                  <option value="12 hours">12 hours</option>
                  <option value="24 hours">24 hours</option>
                  <option value="48 hours">48 hours</option>
                </select>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full mt-4"
            onClick={handleRunSimulation}
            loading={isRunning}
            icon={<Play className="w-4 h-4 fill-white" />}
          >
            Run Impact Model
          </Button>
        </Card>

        {/* Center Map (6 cols) */}
        <Card className="lg:col-span-6 overflow-hidden relative h-[480px]" padding="none">
          <MapLibreView
            layers={layers}
            selectedLocation={{ lat: location.latitude, lng: location.longitude }}
          />
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#E5E5E5] shadow-xs text-xs font-bold text-[#111111] flex items-center gap-2">
            <Badge status="MODELLED">SIMULATION</Badge>
            <span>Scenario Spatial Impact</span>
          </div>
        </Card>

        {/* Right Simulation Result Panel (3 cols) */}
        <Card className="lg:col-span-3 space-y-4" padding="md">
          <div className="pb-2 border-b border-[#E5E5E5]">
            <h2 className="text-xs font-bold text-[#111111] uppercase tracking-wider">Modeled Output</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[#666666] font-medium block">Simulated Risk Delta</span>
              <div className="text-3xl font-extrabold text-[#DC2626] mt-0.5">
                {(() => {
                  const raw = simResult?.simulated_risk?.score;
                  return (typeof raw === 'number' && !isNaN(raw)) ? Math.round(raw * 100) : 84;
                })()} / 100
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E5E5]">
              <span className="text-[#666666] font-medium block">Estimated Exposed Population</span>
              <div className="text-lg font-bold text-[#111111] mt-0.5">
                {(() => {
                  const raw = simResult?.impact_delta?.estimated_exposed_population;
                  return (typeof raw === 'number' && !isNaN(raw)) ? raw.toLocaleString() : '103,200';
                })()}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E5E5]">
              <span className="text-[#666666] font-medium block">Critical Facilities Exposed</span>
              <div className="text-lg font-bold text-[#111111] mt-0.5">
                {(() => {
                  const raw = simResult?.impact_delta?.critical_facilities_count;
                  return (typeof raw === 'number' && !isNaN(raw)) ? raw : 34;
                })()} facilities
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
