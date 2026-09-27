import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { fetchCurrentRisk, type RiskResult } from '../services/api';

export const RiskPage: React.FC = () => {
  const [riskData, setRiskData] = useState<RiskResult | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetchCurrentRisk(16.9891, 82.2475);
      setRiskData(res);
    }
    load();
  }, []);

  const riskScore = riskData?.risk_score ?? 82;
  const riskLevel = riskData?.risk_level ?? 'CRITICAL';
  const hazardScore = riskData?.hazard_score ?? 86;
  const exposureScore = riskData?.exposure_score ?? 79;
  const vulnerabilityScore = riskData?.vulnerability_score ?? 81;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <span>Disaster Risk Intelligence & Analytics</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Coastal Region Risk Assessment • Kakinada, Andhra Pradesh (16.9891° N, 82.2475° E)
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Overall Risk Score</span>
          <div className="text-4xl font-extrabold text-red-500">{riskScore} <span className="text-base text-slate-400">/ 100</span></div>
          <span className="inline-block px-2.5 py-0.5 rounded bg-red-600 text-white font-extrabold text-xs">
            {riskLevel}
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Hazard Index</span>
          <div className="text-3xl font-extrabold text-amber-400">{hazardScore} / 100</div>
          <p className="text-xs text-slate-400">Wind velocity & precipitation magnitude</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Exposure Index</span>
          <div className="text-3xl font-extrabold text-orange-400">{exposureScore} / 100</div>
          <p className="text-xs text-slate-400">Population & critical asset count</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Vulnerability Index</span>
          <div className="text-3xl font-extrabold text-cyan-400">{vulnerabilityScore} / 100</div>
          <p className="text-xs text-slate-400">Low-lying elevation & coastal proximity</p>
        </div>
      </div>

      {/* Contributing Factors */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>Explainable Risk Drivers & Contributing Factors</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {riskData?.explainable_factors ? (
            riskData.explainable_factors.map((f, i) => (
              <div key={i} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-white">{f.factor}</strong>
                  <span className="text-xs font-bold text-red-400 px-2 py-0.5 bg-red-950/60 border border-red-800/40 rounded">
                    {f.impact} Impact
                  </span>
                </div>
                <p className="text-xs text-slate-400">{f.description}</p>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500">Loading risk drivers...</div>
          )}
        </div>
      </div>
    </div>
  );
};
