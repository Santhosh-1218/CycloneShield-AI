import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ShieldAlert, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  Mountain, 
  Bot, 
  AlertTriangle,
  Bookmark,
  Navigation,
  Activity,
  FileText,
  Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { RiskResult } from '../../services/api';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { fetchSafeEvacuationRoute, fetchParametricMonitor, fetchDistrictBriefing, generateActionPlan } from '../../services/api';

interface RightLocationDrawerProps {
  location: { lat: number; lng: number; name?: string; admin1?: string; country?: string };
  riskData: RiskResult | null;
  weatherData: any;
  hourlyWeather: any[];
  forecastDaily: any[];
  elevationData: any;
  landcoverData: any;
  infrastructureCount?: number;
  floodData: any;
  isLoading?: boolean;
  onClose: () => void;
  onAskCopilot: (prompt: string) => void;
  onSaveLocation?: () => void;
  isSaved?: boolean;
}

export const RightLocationDrawer: React.FC<RightLocationDrawerProps> = ({
  location,
  riskData,
  weatherData,
  hourlyWeather,
  forecastDaily,
  elevationData,
  isLoading = false,
  onClose,
  onAskCopilot,
  onSaveLocation,
  isSaved = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'routing' | 'parametric' | 'forecast'>('overview');

  // Safe Route State
  const [routeData, setRouteData] = useState<any>(null);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);

  // Parametric Monitor State
  const [parametricData, setParametricData] = useState<any>(null);
  const [loadingParametric, setLoadingParametric] = useState<boolean>(false);

  // Action Plan State
  const [actionPlan, setActionPlan] = useState<any>(null);
  const [loadingActionPlan, setLoadingActionPlan] = useState<boolean>(false);

  // District Briefing State
  const [briefingText, setBriefingText] = useState<string | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState<boolean>(false);

  const values = weatherData?.values || {};
  const temp = values.temperature;
  const feelsLike = values.feelsLike;
  const windSpeed = values.windSpeed;
  const windDir = values.windDirection;
  const rain24h = values.accumulatedRain24h;
  const rainProb = values.precipitationProbability;

  const riskScore = riskData?.risk_score;
  const riskLevel = riskData?.risk_level || 'LOW';
  const hazardScore = riskData?.hazard_score;
  const exposureScore = riskData?.exposure_score;
  const vulnerabilityScore = riskData?.vulnerability_score;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400', badge: 'bg-red-600', hex: '#ef4444' };
      case 'HIGH': return { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-400', badge: 'bg-orange-600', hex: '#f97316' };
      case 'MODERATE': return { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', badge: 'bg-amber-600', hex: '#f59e0b' };
      default: return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', badge: 'bg-emerald-600', hex: '#10b981' };
    }
  };

  const riskColors = getRiskColor(riskLevel);

  const handleFetchRoute = async () => {
    setLoadingRoute(true);
    const res = await fetchSafeEvacuationRoute(location.lat, location.lng);
    setRouteData(res);
    setLoadingRoute(false);
  };

  const handleFetchParametric = async () => {
    setLoadingParametric(true);
    const res = await fetchParametricMonitor(location.lat, location.lng);
    setParametricData(res);
    setLoadingParametric(false);
  };

  const handleFetchActionPlan = async () => {
    setLoadingActionPlan(true);
    const res = await generateActionPlan({
      lat: location.lat,
      lon: location.lng,
      risk_score: riskScore || 50,
      risk_category: riskLevel,
      hazard_score: hazardScore || 50,
      exposure_score: exposureScore || 50,
      vulnerability_score: vulnerabilityScore || 50,
      factors: (riskData?.explainable_factors || []).map(f => f.factor)
    });
    setActionPlan(res);
    setLoadingActionPlan(false);
  };

  const handleGenerateBriefing = async () => {
    setLoadingBriefing(true);
    const res = await fetchDistrictBriefing(location.name || 'Coastal District', location.lat, location.lng);
    if (res && res.briefing) {
      setBriefingText(res.briefing);
    }
    setLoadingBriefing(false);
  };

  return (
    <div className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-2xl border-l border-slate-700/80 text-slate-100 flex flex-col h-full shadow-2xl overflow-hidden z-40 select-none">
      {/* Glassmorphic Loading Blur Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4 p-6 text-center animate-fadeIn">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <ShieldAlert className="w-6 h-6 absolute text-cyan-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="font-extrabold text-sm text-white block tracking-tight">Fetching Live Operational Data...</span>
            <span className="text-xs text-slate-400 font-mono block">
              Querying Open-Meteo, GEE & OSM for {location.name || 'Selected Location'}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <h2 className="text-lg font-bold text-white tracking-tight truncate">
              {location.name || 'Selected Location'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {[location.admin1, location.country].filter(Boolean).join(', ') || 'Coastal Zone'} • {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          {onSaveLocation && (
            <button
              onClick={onSaveLocation}
              title={isSaved ? 'Saved to Favorites' : 'Save Location'}
              className={`p-2 rounded-xl border transition-all ${
                isSaved ? 'bg-cyan-600/30 text-cyan-400 border-cyan-500/50' : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-semibold shrink-0">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 border-b-2 text-center transition-all ${
            activeTab === 'overview' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => { setActiveTab('actions'); if (!actionPlan) handleFetchActionPlan(); }}
          className={`flex-1 py-2.5 border-b-2 text-center transition-all ${
            activeTab === 'actions' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Action Plan
        </button>
        <button
          onClick={() => { setActiveTab('routing'); if (!routeData) handleFetchRoute(); }}
          className={`flex-1 py-2.5 border-b-2 text-center transition-all ${
            activeTab === 'routing' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Safe Route
        </button>
        <button
          onClick={() => { setActiveTab('parametric'); if (!parametricData) handleFetchParametric(); }}
          className={`flex-1 py-2.5 border-b-2 text-center transition-all ${
            activeTab === 'parametric' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Parametric
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`flex-1 py-2.5 border-b-2 text-center transition-all ${
            activeTab === 'forecast' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Forecast
        </button>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'overview' && (
          <>
            {/* Risk Assessment Card */}
            <div className={`p-4 rounded-2xl border ${riskColors.bg} ${riskColors.border} space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className={`w-5 h-5 ${riskColors.text}`} />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">Risk Assessment</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-white font-extrabold text-xs shadow-md ${riskColors.badge}`}>
                  {riskLevel}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-extrabold text-white tracking-tight">
                    {riskScore != null ? riskScore : '--'} <span className="text-sm font-normal text-slate-400">/ 100</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">Composite Coastal Hazard Score</p>
                </div>
                <DataProvenanceBadge provenance={riskData?.provenance} inlineLabel="RISK ENGINE v4" />
              </div>

              {/* Sub-scores */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/50 text-center font-mono">
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">HAZARD</span>
                  <span className="text-sm font-bold text-red-400">{hazardScore != null ? hazardScore : '--'}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">EXPOSURE</span>
                  <span className="text-sm font-bold text-amber-400">{exposureScore != null ? exposureScore : '--'}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">VULNERABILITY</span>
                  <span className="text-sm font-bold text-orange-400">{vulnerabilityScore != null ? vulnerabilityScore : '--'}</span>
                </div>
              </div>

              {/* Explainable Factors */}
              {riskData?.explainable_factors && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-semibold text-slate-300 block">Contributing Risk Drivers (Why?):</span>
                  <div className="space-y-1 text-xs">
                    {riskData.explainable_factors.map((f, i) => (
                      <div key={i} className="flex items-start space-x-2 text-slate-300 bg-slate-900/40 p-2 rounded-xl border border-slate-800/60">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block">{f.factor}</strong>
                          <span className="text-[11px] text-slate-400 leading-tight">{f.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Weather Overview Grid */}
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  <span>Current Weather</span>
                </span>
                <DataProvenanceBadge provenance={weatherData?.provenance} inlineLabel="OPEN-METEO LIVE" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                  <Thermometer className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Temperature</span>
                    <strong className="text-base text-white">{temp != null ? `${temp}°C` : 'N/A'}</strong>
                    <span className="text-[10px] text-slate-500 block">{feelsLike != null ? `Feels like ${feelsLike}°C` : 'Live telemetry'}</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                  <Wind className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Wind Speed</span>
                    <strong className="text-base text-white">{windSpeed != null ? `${windSpeed} km/h` : 'N/A'}</strong>
                    <span className="text-[10px] text-slate-500 block">{windDir != null ? `${windDir}° Direction` : 'Live wind flow'}</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                  <Droplets className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">24h Rainfall</span>
                    <strong className="text-base text-white">{rain24h != null ? `${rain24h} mm` : '0 mm'}</strong>
                    <span className="text-[10px] text-slate-500 block">{rainProb != null ? `${rainProb}% rain prob` : 'Precipitation model'}</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                  <Mountain className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Terrain Elevation</span>
                    <strong className="text-base text-white">{elevationData?.elevation_m != null ? `${elevationData.elevation_m}m` : (elevationData?.elevationMeters != null ? `${elevationData.elevationMeters}m` : '0m')}</strong>
                    <span className="text-[10px] text-slate-500 block">NASADEM SRTM 30m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleGenerateBriefing}
                disabled={loadingBriefing}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>{loadingBriefing ? 'Generating...' : 'Generate Briefing'}</span>
              </button>

              <button
                onClick={() => onAskCopilot(`Why is ${location.name || 'this location'} classified as ${riskLevel} risk with score ${riskScore}/100?`)}
                className="py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <Bot className="w-4 h-4" />
                <span>Ask AI Copilot</span>
              </button>
            </div>

            {/* District Briefing Output Display */}
            {briefingText && (
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-extrabold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-4 h-4" />
                    <span>District Risk Briefing</span>
                  </span>
                  <button onClick={() => setBriefingText(null)} className="text-slate-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="prose prose-invert max-w-none text-slate-300 text-xs leading-relaxed font-sans whitespace-pre-wrap max-h-60 overflow-y-auto pr-1">
                  {briefingText}
                </div>
              </div>
            )}
          </>
        )}

        {/* Phase 13 — AI Action Planner Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
              <span className="text-xs font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Decision Support Action Directive</span>
              </span>
              <button
                onClick={handleFetchActionPlan}
                disabled={loadingActionPlan}
                className="text-[10px] text-cyan-400 hover:underline font-mono"
              >
                {loadingActionPlan ? 'Updating...' : 'Refresh'}
              </button>
            </div>

            {actionPlan?.plan ? (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl space-y-2">
                  <span className="font-extrabold text-cyan-400 block tracking-wide">NEXT 6 HOURS DIRECTIVES</span>
                  <ul className="space-y-1.5 pl-3 list-disc text-slate-300">
                    {(actionPlan.plan.next_6h || []).map((act: string, idx: number) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl space-y-2">
                  <span className="font-extrabold text-amber-400 block tracking-wide">NEXT 12 HOURS DIRECTIVES</span>
                  <ul className="space-y-1.5 pl-3 list-disc text-slate-300">
                    {(actionPlan.plan.next_12h || []).map((act: string, idx: number) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl space-y-2">
                  <span className="font-extrabold text-purple-400 block tracking-wide">NEXT 24 HOURS DIRECTIVES</span>
                  <ul className="space-y-1.5 pl-3 list-disc text-slate-300">
                    {(actionPlan.plan.next_24h || []).map((act: string, idx: number) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-8">
                {loadingActionPlan ? 'Generating emergency directives...' : 'Click Refresh to generate action plan.'}
              </div>
            )}
          </div>
        )}

        {/* Phase 14 — Evacuation Route Resilience Tab */}
        {activeTab === 'routing' && (
          <div className="space-y-3">
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <span>Safe Route to Shelter</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Resilient Corridor</span>
              </div>
              <p className="text-xs text-slate-400">
                Calculates an evacuation route avoiding low-lying inundation zones and risky causeways.
              </p>
            </div>

            {loadingRoute ? (
              <div className="text-xs text-slate-400 text-center py-6">Calculating resilient evacuation path...</div>
            ) : routeData ? (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-900/90 border border-emerald-500/30 p-3.5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{routeData.destination?.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
                      {routeData.route_risk_level} RISK
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center font-mono pt-1">
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">DISTANCE</span>
                      <span className="text-sm font-bold text-white">{routeData.distance_km} km</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">EST. TIME</span>
                      <span className="text-sm font-bold text-cyan-400">{routeData.estimated_travel_time_mins} mins</span>
                    </div>
                  </div>

                  {routeData.avoided_hazards && routeData.avoided_hazards.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-300 block">Avoided Hazards ({routeData.avoided_hazards_count}):</span>
                      {routeData.avoided_hazards.map((h: any, i: number) => (
                        <div key={i} className="text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-400">
                          <strong className="text-amber-400">{h.type}:</strong> {h.reason}
                        </div>
                      ))}
                    </div>
                  )}

                  <DataProvenanceBadge provenance={routeData.provenance} inlineLabel="DECISION SUPPORT ROUTING" />
                </div>
              </div>
            ) : (
              <button
                onClick={handleFetchRoute}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Calculate Resilient Shelter Route</span>
              </button>
            )}
          </div>
        )}

        {/* Phase 15 — Parametric Trigger Monitor Tab */}
        {activeTab === 'parametric' && (
          <div className="space-y-3">
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Parametric Trigger Monitor</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Disaster Liquidity</span>
              </div>
              <p className="text-xs text-slate-400">
                Monitors wind, rainfall & surge thresholds for parametric disaster financing decision support.
              </p>
            </div>

            {loadingParametric ? (
              <div className="text-xs text-slate-400 text-center py-6">Evaluating parametric indices...</div>
            ) : parametricData ? (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">TRIGGER STATUS</span>
                    <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-white text-xs" style={{ backgroundColor: parametricData.status_color }}>
                      {parametricData.trigger_status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{parametricData.summary}</p>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {(parametricData.metrics || []).map((m: any, i: number) => (
                      <div key={i} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-white block">{m.name}</strong>
                          <span className="text-[10px] text-slate-400">Threshold: {m.threshold} | Forecast: {m.currentForecast}</span>
                        </div>
                        <div className="text-right">
                          <span className={`font-mono font-bold block ${m.triggered ? 'text-red-400' : 'text-slate-300'}`}>{m.probability}</span>
                          <span className="text-[9px] font-mono text-slate-500 uppercase">{m.triggered ? 'BREACHED' : 'Watch'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-500 italic pt-1">{parametricData.disclaimer}</p>
                  <DataProvenanceBadge provenance={parametricData.provenance} inlineLabel="PARAMETRIC MONITOR" />
                </div>
              </div>
            ) : (
              <button
                onClick={handleFetchParametric}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <Activity className="w-4 h-4" />
                <span>Evaluate Parametric Indices</span>
              </button>
            )}
          </div>
        )}

        {/* Forecast Tab */}
        {activeTab === 'forecast' && (
          <div className="space-y-4">
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Hourly Temperature Forecast (°C)</span>
              <div className="h-40 w-full pt-2">
                {hourlyWeather && hourlyWeather.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyWeather.slice(0, 12)}>
                      <defs>
                        <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="temperature" stroke="#38bdf8" fillOpacity={1} fill="url(#tempGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">Hourly weather loading...</div>
                )}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-slate-300 block">7-Day Daily Forecast</span>
              <div className="space-y-2">
                {forecastDaily && forecastDaily.length > 0 ? (
                  forecastDaily.map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl text-xs border border-slate-800">
                      <span className="font-mono text-slate-300 w-24">{d.date}</span>
                      <div className="flex items-center space-x-2 text-slate-200">
                        <span className="text-cyan-400 font-bold">{d.tempMax}°C</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-slate-400">{d.tempMin}°C</span>
                      </div>
                      <span className="text-blue-400 font-mono text-[11px]">{d.precipitationSum} mm rain</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 text-center py-4">7-day forecast loading...</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Timestamp */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 text-[10px] font-mono text-slate-500 flex items-center justify-between shrink-0">
        <span>Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span>Sources: Open-Meteo • GEE • OSM</span>
      </div>
    </div>
  );
};
