import React from 'react';
import { AlertTriangle, Users, Building2, Wind, CloudRain, Waves } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface ComparisonViewProps {
  baseline: {
    score: number;
    category: string;
    hazard_score: number;
    exposure_score: number;
    vulnerability_score: number;
  };
  simulated: {
    score: number;
    category: string;
    hazard_score: number;
    exposure_score: number;
    vulnerability_score: number;
    explainable_factors?: any[];
  };
  delta: {
    risk_score_increase: number;
    category_change: string;
    estimated_exposed_population: number;
    total_area_population: number;
    critical_facilities_count: number;
  };
  scenarioParams: {
    wind_speed_kmh: number;
    rainfall_24h_mm: number;
    storm_surge_m: number;
  };
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ baseline, simulated, delta, scenarioParams }) => {
  const chartData = [
    {
      name: 'Hazard (H)',
      Baseline: Math.round(baseline.hazard_score * 100),
      Simulated: Math.round(simulated.hazard_score * 100),
    },
    {
      name: 'Exposure (E)',
      Baseline: Math.round(baseline.exposure_score * 100),
      Simulated: Math.round(simulated.exposure_score * 100),
    },
    {
      name: 'Vulnerability (V)',
      Baseline: Math.round(baseline.vulnerability_score * 100),
      Simulated: Math.round(simulated.vulnerability_score * 100),
    },
    {
      name: 'Total Risk Index',
      Baseline: Math.round(baseline.score * 100),
      Simulated: Math.round(simulated.score * 100),
    },
  ];

  const categoryBadge = (cat: string) => {
    switch (cat) {
      case 'Very High': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Current Baseline Risk</span>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${categoryBadge(baseline.category)}`}>
              {baseline.category}
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-white">{(baseline.score * 100).toFixed(0)}</span>
            <span className="text-sm text-slate-400 font-medium">/ 100 Baseline Index</span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Hazard Sub-Score</span>
              <span className="font-mono text-cyan-400">{(baseline.hazard_score * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Exposure Sub-Score</span>
              <span className="font-mono text-amber-400 font-medium">{(baseline.exposure_score * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Vulnerability Sub-Score</span>
              <span className="font-mono text-purple-400 font-medium">{(baseline.vulnerability_score * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Simulated Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl border-l border-b border-cyan-500/30">
            Scenario Impact
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-cyan-300">Hypothetical Cyclone Scenario</span>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${categoryBadge(simulated.category)}`}>
              {simulated.category}
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-cyan-400">{(simulated.score * 100).toFixed(0)}</span>
            <span className="text-sm text-slate-400 font-medium">/ 100 Modeled Risk</span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="flex items-center"><Wind className="w-3 h-3 mr-1 text-cyan-400" /> Wind Speed</span>
              <span className="font-mono text-white font-semibold">{scenarioParams.wind_speed_kmh} km/h</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="flex items-center"><CloudRain className="w-3 h-3 mr-1 text-blue-400" /> 24h Rainfall</span>
              <span className="font-mono text-white font-semibold">{scenarioParams.rainfall_24h_mm} mm</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="flex items-center"><Waves className="w-3 h-3 mr-1 text-teal-400" /> Storm Surge</span>
              <span className="font-mono text-white font-semibold">{scenarioParams.storm_surge_m} m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delta Metrics Summary */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" /> Risk Delta
          </div>
          <div className="text-xl font-bold text-amber-400">
            +{Math.round(delta.risk_score_increase * 100)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{delta.category_change}</div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Population Impact
          </div>
          <div className="text-xl font-bold text-white">
            {delta.estimated_exposed_population.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Estimated people in impact zone</div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 mr-1 text-purple-400" /> Infrastructure Exposure
          </div>
          <div className="text-xl font-bold text-purple-400">
            {delta.critical_facilities_count} Assets
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Hospitals, shelters, power</div>
        </div>
      </div>

      {/* Comparison Recharts Bar Chart */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-300">
          Risk Component Comparison (Baseline vs Scenario)
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Baseline" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Simulated" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
