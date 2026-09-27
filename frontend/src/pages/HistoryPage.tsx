import React, { useState, useEffect } from 'react';
import { Shield, Sliders, FileText, Clock } from 'lucide-react';
import { fetchRiskHistory, fetchAdvisoryHistory } from '../services/api';

export const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assessments' | 'simulations' | 'advisories'>('assessments');
  const [riskHistory, setRiskHistory] = useState<any[]>([]);
  const [advisoryHistory, setAdvisoryHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const simulationRuns = [
    {
      id: 'sim-101',
      timestamp: '2026-09-24T22:30:00Z',
      location: 'Visakhapatnam Harbor Sector',
      scenario_inputs: { wind_speed_kmh: 185, rainfall_24h_mm: 240, storm_surge_m: 3.8 },
      simulated_risk_score: 0.78,
      category: 'Very High',
      type: 'HYPOTHETICAL SIMULATION'
    },
    {
      id: 'sim-102',
      timestamp: '2026-09-24T18:15:00Z',
      location: 'Kakinada Coastal Corridor',
      scenario_inputs: { wind_speed_kmh: 140, rainfall_24h_mm: 180, storm_surge_m: 2.2 },
      simulated_risk_score: 0.58,
      category: 'High',
      type: 'HYPOTHETICAL SIMULATION'
    }
  ];

  useEffect(() => {
    let isMounted = true;
    async function loadHistories() {
      setLoading(true);
      const [rHist, aHist] = await Promise.all([
        fetchRiskHistory(20),
        fetchAdvisoryHistory()
      ]);
      if (isMounted) {
        setRiskHistory(rHist);
        setAdvisoryHistory(aHist);
        setLoading(false);
      }
    }
    loadHistories();
    return () => { isMounted = false; };
  }, []);

  const badgeColor = (cat: string) => {
    switch (cat) {
      case 'Very High': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
              AUDIT TRAIL LOGS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Risk Assessment & Simulation History</h1>
          <p className="text-xs text-slate-400">
            Historical records of real data-based risk evaluations, hypothetical scenario runs, and human-approved advisories.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('assessments')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'assessments' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Risk Assessments</span>
          </button>
          <button
            onClick={() => setActiveTab('simulations')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'simulations' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulations</span>
          </button>
          <button
            onClick={() => setActiveTab('advisories')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'advisories' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Advisories</span>
          </button>
        </div>
      </div>

      {/* Content Body */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm bg-navy-800/80 rounded-2xl border border-slate-700">
          Fetching history log entries...
        </div>
      ) : activeTab === 'assessments' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Real Data Assessments Log ({riskHistory.length})</span>
            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider text-[10px]">
              DATA-BASED ASSESSMENT
            </span>
          </div>

          {riskHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-navy-800/80 rounded-2xl border border-slate-700">
              No historical data-based risk assessments logged yet. Explore the Risk Map to calculate live risk scores.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {riskHistory.map((item, idx) => (
                <div key={idx} className="p-4 bg-navy-800/90 border border-slate-700/80 rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor(item.category || 'Moderate')}`}>
                        {item.category || 'Moderate'}
                      </span>
                      <span className="font-bold text-white">Score: {((item.score || 0) * 100).toFixed(0)} / 100</span>
                      <span className="text-slate-400 font-mono">({item.lat?.toFixed(2)}° N, {item.lon?.toFixed(2)}° E)</span>
                    </div>
                    <p className="text-slate-300">
                      Drivers: {item.factors ? item.factors.join(', ') : 'Baseline environmental observation'}
                    </p>
                  </div>
                  <div className="text-slate-500 font-mono shrink-0 flex items-center text-[11px]">
                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                    {item.created_at || item.timestamp || 'Recent'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'simulations' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Simulated Scenario Runs Log ({simulationRuns.length})</span>
            <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider text-[10px]">
              HYPOTHETICAL SIMULATION
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {simulationRuns.map((sim) => (
              <div key={sim.id} className="p-4 bg-navy-800/90 border border-amber-500/30 rounded-xl shadow-md space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold rounded">
                      {sim.type}
                    </span>
                    <span className="font-bold text-white">{sim.location}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{sim.timestamp}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div>Wind: <span className="font-mono text-cyan-400 font-semibold">{sim.scenario_inputs.wind_speed_kmh} km/h</span></div>
                  <div>Rainfall: <span className="font-mono text-blue-400 font-semibold">{sim.scenario_inputs.rainfall_24h_mm} mm</span></div>
                  <div>Surge: <span className="font-mono text-teal-400 font-semibold">{sim.scenario_inputs.storm_surge_m} m</span></div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                  <span>Simulated Risk Score: <strong className="text-amber-400">{(sim.simulated_risk_score * 100).toFixed(0)} / 100 ({sim.category})</strong></span>
                  <span className="text-[10px] text-slate-500 font-mono">Decision-Support Test Only</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Human-Approved Advisories ({advisoryHistory.length})</span>
            <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase tracking-wider text-[10px]">
              APPROVED ADVISORY LOG
            </span>
          </div>

          {advisoryHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-navy-800/80 rounded-2xl border border-slate-700">
              No advisories approved yet. Open the Alerts & Action Center to generate and review draft advisories.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {advisoryHistory.map((adv, idx) => (
                <div key={idx} className="p-4 bg-navy-800/90 border border-slate-700/80 rounded-xl shadow-md space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{adv.title}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                      {adv.status}
                    </span>
                  </div>
                  <p className="text-slate-300 line-clamp-2">{adv.message}</p>
                  <div className="text-[10px] text-slate-500 font-mono">Created: {adv.created_at} | Lang: {adv.language.toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
