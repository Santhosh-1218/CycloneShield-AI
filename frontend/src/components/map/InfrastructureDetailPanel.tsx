import React, { useEffect, useState } from 'react';
import { X, Building2, ShieldAlert, Activity, Navigation, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { fetchInfrastructureRiskDetail, fetchExplainableRiskFactors } from '../../services/api';

interface InfrastructureDetailPanelProps {
  asset: {
    id: string;
    name: string;
    category: string;
    location: string;
    coordinates?: [number, number];
  } | null;
  onClose: () => void;
}

export const InfrastructureDetailPanel: React.FC<InfrastructureDetailPanelProps> = ({ asset, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [detailData, setDetailData] = useState<any>(null);
  const [factorsData, setFactorsData] = useState<any>(null);

  useEffect(() => {
    if (!asset) return;
    setLoading(true);
    const lon = asset.coordinates ? asset.coordinates[0] : 83.2185;
    const lat = asset.coordinates ? asset.coordinates[1] : 17.6868;

    Promise.all([
      fetchInfrastructureRiskDetail(asset.id, lat, lon),
      fetchExplainableRiskFactors(asset.id, lat, lon)
    ]).then(([detail, factors]) => {
      setDetailData(detail);
      setFactorsData(factors);
      setLoading(false);
    });
  }, [asset]);

  if (!asset) return null;

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'Very High': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="absolute right-4 top-20 bottom-8 w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl z-30 flex flex-col overflow-hidden text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 line-clamp-1">{asset.name}</h3>
            <p className="text-xs text-slate-400 flex items-center mt-0.5">
              <Navigation className="w-3 h-3 mr-1 text-slate-500" />
              {asset.category} • {asset.location}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm flex flex-col items-center">
            <Activity className="w-6 h-6 animate-spin text-cyan-400 mb-2" />
            Evaluating Infrastructure Exposure & Risk Factors...
          </div>
        ) : (
          <>
            {/* Risk Index Banner */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Modeled Risk Score</span>
                <div className="text-2xl font-bold text-white mt-0.5">
                  {detailData?.risk_score !== undefined ? (detailData.risk_score * 100).toFixed(0) : '--'}
                  <span className="text-xs font-normal text-slate-400"> / 100</span>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${categoryColor(detailData?.category || 'Moderate')}`}>
                {detailData?.category || 'Moderate'}
              </span>
            </div>

            {/* Sub-Score Bars */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Risk Index Breakdown ($Risk = H \\times E \\times V$)</span>
              
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Hazard (H)</span>
                    <span className="font-mono text-cyan-400">{((detailData?.hazard_score || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(detailData?.hazard_score || 0) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Exposure (E)</span>
                    <span className="font-mono text-amber-400">{((detailData?.exposure_score || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(detailData?.exposure_score || 0) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Vulnerability (V)</span>
                    <span className="font-mono text-purple-400">{((detailData?.vulnerability_score || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(detailData?.vulnerability_score || 0) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Explainable Risk Factors */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                Explainable Risk Drivers
              </span>
              <div className="space-y-2">
                {detailData?.explainable_factors?.map((f: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs">
                    <div className="flex items-center justify-between font-medium text-slate-200">
                      <span>{f.factor}</span>
                      <span className={`px-1.5 py-0.5 text-[10px] rounded font-semibold ${
                        f.impact === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {f.impact} Impact
                      </span>
                    </div>
                    <p className="text-slate-400 mt-1 leading-relaxed">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Directives */}
            {factorsData?.recommendations && (
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs space-y-2">
                <span className="font-semibold text-cyan-300 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                  Recommended Operational Measures
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {factorsData.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="w-3 h-3 mr-1.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        Source: OpenStreetMap Infrastructure + CycloneShield Risk Model
      </div>
    </div>
  );
};
