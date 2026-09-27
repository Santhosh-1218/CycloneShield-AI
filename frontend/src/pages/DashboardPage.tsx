import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  AlertTriangle, 
  ClipboardCheck, 
  RefreshCw 
} from 'lucide-react';
import { MapLibreView } from '../components/map/MapLibreView';
import type { MapLayersState } from '../components/map/LayerControls';
import { useUserLocation } from '../hooks/useUserLocation';
import { fetchCurrentWeather, fetchInfrastructureOSM } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useUserLocation();

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number }>({
    lat: location.latitude || 17.6868,
    lng: location.longitude || 83.2185
  });

  const [weatherInfo, setWeatherInfo] = useState<any>(null);
  const [osmData, setOsmData] = useState<any>(null);

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

  useEffect(() => {
    if (location.status === 'granted' && location.latitude && location.longitude) {
      setSelectedLocation({ lat: location.latitude, lng: location.longitude });
    }
  }, [location.status, location.latitude, location.longitude]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const [w, o] = await Promise.all([
        fetchCurrentWeather(selectedLocation.lat, selectedLocation.lng),
        fetchInfrastructureOSM(selectedLocation.lat, selectedLocation.lng)
      ]);

      if (isMounted) {
        setWeatherInfo(w);
        setOsmData(o);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedLocation]);

  const windSpeed = weatherInfo?.values?.windSpeed ?? 155;

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Header Bar matching Mockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-xs text-slate-500">Live cyclone situation and risk summary</p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Last updated: <strong className="text-slate-700">24 Sep 2026, 14:32 IST</strong></span>
        </div>
      </div>

      {/* Active Cyclone Strip matching Mockup */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 font-bold text-[10px] uppercase border border-red-200">
            CYCLONE ACTIVE
          </span>
          <span className="text-base font-extrabold text-slate-900">Cyclone Demo-01</span>
        </div>

        <div className="flex items-center space-x-6 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Wind Speed</span>
            <span className="font-bold text-slate-900">{windSpeed} km/h</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Rainfall</span>
            <span className="font-bold text-blue-600">High</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Storm Surge</span>
            <span className="font-bold text-slate-900">High</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">ETA</span>
            <span className="font-bold text-slate-900">31 hours</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards matching Mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Population Exposed</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">52,400</div>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Critical Infrastructure</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">27</div>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">High Risk Zones</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">14</div>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Needs Action</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">18</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Map Left (8 cols) & Current Risk Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map View Column (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm relative h-[480px]">
          <MapLibreView
            layers={layers}
            selectedLocation={selectedLocation}
            onLocationSelect={(lat: number, lng: number) => setSelectedLocation({ lat, lng })}
            infrastructureFeatures={osmData?.features || []}
            weatherData={weatherInfo}
          />
          {/* Legend Bar Bottom Overlay matching Mockup */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-md text-[11px] flex items-center space-x-3">
            <span className="font-bold text-slate-700">Risk Level:</span>
            <span className="flex items-center text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1" /> Low</span>
            <span className="flex items-center text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1" /> Medium</span>
            <span className="flex items-center text-orange-600"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1" /> High</span>
            <span className="flex items-center text-red-600"><span className="w-2 h-2 rounded-full bg-red-600 mr-1" /> Critical</span>
          </div>
        </div>

        {/* Current Risk Right Column (4 cols) matching Mockup */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Risk</div>
              <span className="px-3 py-1 rounded bg-red-100 text-red-600 font-extrabold text-xs uppercase border border-red-200 inline-block">
                HIGH
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">Primary Concerns</span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center text-red-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                  Coastal flooding
                </li>
                <li className="flex items-center text-red-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                  Hospital accessibility
                </li>
                <li className="flex items-center text-red-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                  Road disruption
                </li>
              </ul>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">Recommended Action</span>
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                • Prepare critical infrastructure in Zone A and Zone B.
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/simulation')}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            Launch Impact Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

