import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Truck, 
  Home, 
  CheckSquare, 
  AlertTriangle,
  Layers
} from 'lucide-react';
import { MapLibreView } from '../components/map/MapLibreView';
import type { MapLayersState } from '../components/map/LayerControls';
import { useUserLocation } from '../hooks/useUserLocation';
import { generateActionPlan, fetchInfrastructureOSM } from '../services/api';

export const ActionCenterPage: React.FC = () => {
  const { location } = useUserLocation();
  const lat = location.latitude || 17.6868;
  const lon = location.longitude || 83.2185;

  const [loading, setLoading] = useState(true);
  const [actionPlan, setActionPlan] = useState<any>(null);
  const [osmData, setOsmData] = useState<any>(null);

  const [layers, setLayers] = useState<MapLayersState>({
    riskLevel: true,
    cycloneTrack: true,
    rainfall: true,
    wind: true,
    population: true,
    hospitals: true,
    shelters: true,
    roads: true
  });

  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    async function loadActionPlan() {
      setLoading(true);
      const [plan, osm] = await Promise.all([
        generateActionPlan({
          lat,
          lon,
          risk_score: 0.65,
          risk_category: 'High',
          hazard_score: 0.6,
          exposure_score: 0.55,
          vulnerability_score: 0.8,
          factors: ['Severe sustained wind speed', 'Low elevation coastal terrain']
        }),
        fetchInfrastructureOSM(lat, lon)
      ]);

      if (isMounted) {
        setActionPlan(plan);
        setOsmData(osm);
        setLoading(false);
      }
    }

    loadActionPlan();
    return () => { isMounted = false; };
  }, [lat, lon]);

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    if (type === 'hospitals') {
      setLayers({ ...layers, hospitals: true, shelters: false, roads: false });
    } else if (type === 'shelters') {
      setLayers({ ...layers, hospitals: false, shelters: true, roads: false });
    } else if (type === 'roads') {
      setLayers({ ...layers, hospitals: false, shelters: false, roads: true });
    } else {
      setLayers({ ...layers, hospitals: true, shelters: true, roads: true });
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
              OPERATIONAL DIRECTIVES
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Coordinates: {lat.toFixed(4)}°, {lon.toFixed(4)}°
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Emergency Action Plan & Action Map</h1>
          <p className="text-xs text-slate-400">
            Categorized verification checklist and interactive GIS map for decision-support managers.
          </p>
        </div>
      </div>

      {/* Main Grid Layout: Checklist (6 cols) & Action Map (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Categorized Verification Checklist (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-cyan-400" />
              <span>Emergency Verification Directive Checklist</span>
            </h2>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm bg-navy-800/80 rounded-2xl border border-slate-700">
              Generating operational verification action plan...
            </div>
          ) : actionPlan ? (
            <div className="space-y-4">
              {/* Infrastructure Actions */}
              <div className="p-4 bg-navy-800/90 border border-slate-700/80 rounded-2xl shadow-lg space-y-2">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                  Infrastructure Verification
                </h3>
                <ul className="space-y-2 text-xs text-slate-200">
                  {actionPlan.infrastructure_actions?.map((act: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <input type="checkbox" className="mt-0.5 mr-2 accent-cyan-500 rounded" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Population Actions */}
              <div className="p-4 bg-navy-800/90 border border-slate-700/80 rounded-2xl shadow-lg space-y-2">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                  Population Sector Review
                </h3>
                <ul className="space-y-2 text-xs text-slate-200">
                  {actionPlan.population_actions?.map((act: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <input type="checkbox" className="mt-0.5 mr-2 accent-purple-500 rounded" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Transport Actions */}
              <div className="p-4 bg-navy-800/90 border border-slate-700/80 rounded-2xl shadow-lg space-y-2">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center">
                  <Truck className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  Transport & Road Corridor Assessment
                </h3>
                <ul className="space-y-2 text-xs text-slate-200">
                  {actionPlan.transport_actions?.map((act: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <input type="checkbox" className="mt-0.5 mr-2 accent-amber-500 rounded" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shelter Actions */}
              <div className="p-4 bg-navy-800/90 border border-slate-700/80 rounded-2xl shadow-lg space-y-2">
                <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center">
                  <Home className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
                  Primary Shelter Readiness
                </h3>
                <ul className="space-y-2 text-xs text-slate-200">
                  {actionPlan.shelter_actions?.map((act: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <input type="checkbox" className="mt-0.5 mr-2 accent-teal-500 rounded" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Data Limitations Box */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                <span className="font-semibold text-slate-400 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  Data Limitations Notice
                </span>
                <ul className="space-y-1 text-slate-400 text-[11px]">
                  {actionPlan.data_limitations?.map((lim: string, i: number) => (
                    <li key={i}>• {lim}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Column: Action Map (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Action Map (Potentially Affected Assets)</span>
            </h2>

            {/* Layer Filter Buttons */}
            <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterType === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange('hospitals')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterType === 'hospitals' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Hospitals
              </button>
              <button
                onClick={() => handleFilterChange('shelters')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterType === 'shelters' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Shelters
              </button>
              <button
                onClick={() => handleFilterChange('roads')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterType === 'roads' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Roads
              </button>
            </div>
          </div>

          {/* Action MapLibre View */}
          <div className="h-[600px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-xl relative">
            <MapLibreView
              layers={layers}
              selectedLocation={{ lat, lng: lon }}
              onLocationSelect={() => {}}
              infrastructureFeatures={osmData?.features || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
