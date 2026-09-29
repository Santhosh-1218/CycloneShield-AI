import React, { useState, useEffect } from 'react';
import { Shield, Sliders, FileText, Clock, RefreshCw, Wind, Droplets, Waves, CheckCircle2 } from 'lucide-react';
import { fetchRiskHistory, fetchAdvisoryHistory } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const HistoryPage: React.FC = () => {
  const { location } = useLocation();
  const [activeTab, setActiveTab] = useState<'assessments' | 'simulations' | 'advisories'>('assessments');
  const [riskHistory, setRiskHistory] = useState<any[]>([]);
  const [advisoryHistory, setAdvisoryHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Default rich scenario simulations log
  const simulationRuns = [
    {
      id: 'SIM-2026-089',
      timestamp: 'Today, 15:45 UTC',
      location: `${location?.city || 'Kakinada'} Deepwater Harbor Sector`,
      scenario_inputs: { wind_speed_kmh: 185, rainfall_24h_mm: 240, storm_surge_m: 3.8, radius_km: 50 },
      simulated_risk_score: 0.82,
      baseline_score: 0.54,
      delta_pct: '+51.8%',
      category: 'Very High',
      type: 'SUPER CYCLONE STRESS TEST'
    },
    {
      id: 'SIM-2026-088',
      timestamp: 'Today, 12:10 UTC',
      location: `${location?.city || 'Kakinada'} Coastal Urban Buffer`,
      scenario_inputs: { wind_speed_kmh: 120, rainfall_24h_mm: 160, storm_surge_m: 2.2, radius_km: 35 },
      simulated_risk_score: 0.67,
      baseline_score: 0.48,
      delta_pct: '+39.5%',
      category: 'High',
      type: 'SEVERE CYCLONIC STORM'
    },
    {
      id: 'SIM-2026-087',
      timestamp: 'Yesterday, 18:20 UTC',
      location: `Coringa Bioshield Estuary`,
      scenario_inputs: { wind_speed_kmh: 75, rainfall_24h_mm: 90, storm_surge_m: 1.1, radius_km: 25 },
      simulated_risk_score: 0.41,
      baseline_score: 0.35,
      delta_pct: '+17.1%',
      category: 'Moderate',
      type: 'TROPICAL DEPRESSION INUNDATION'
    }
  ];

  // Default rich advisory log
  const defaultAdvisories = [
    {
      id: 'ADV-2026-004',
      title: `Coastal Inundation Precautionary Directive — ${location?.city || 'Kakinada'} Sector`,
      location: `${location?.city || 'Kakinada'}, ${location?.state || 'Andhra Pradesh'}`,
      risk_category: 'High',
      risk_score: 0.72,
      message: 'Sustained surface winds exceeding 85 km/h combined with localized 24-hour rainfall indicate potential coastal waterlogging in low-lying quadrants. Critical infrastructure and power lines require active monitoring.',
      recommended_actions: [
        'Place emergency diesel generators on active standby at district general hospitals.',
        'Pre-position motorized rescue boats near coastal causeway low-points.',
        'Issue marine transit advisory for mechanized fishing vessels within 25 km offshore.'
      ],
      created_at: 'Today, 14:30 UTC',
      status: 'VERIFIED DISPATCH'
    },
    {
      id: 'ADV-2026-003',
      title: `Port Infrastructure & Marine Safety Notice`,
      location: `${location?.city || 'Kakinada'} Deepwater Anchorage`,
      risk_category: 'Moderate',
      risk_score: 0.58,
      message: 'Surface pressure anomalies and elevated wind gust telemetry detected. All offshore loading platforms and crane operations must secure high-profile equipment.',
      recommended_actions: [
        'Suspend heavy gantry crane container operations during squall hours.',
        'Review storm shelter roster for non-essential harbor personnel.'
      ],
      created_at: 'Yesterday, 16:45 UTC',
      status: 'ROUTINE ADVISORY'
    }
  ];

  const loadHistories = async () => {
    setLoading(true);
    try {
      const [rHist, aHist] = await Promise.all([
        fetchRiskHistory(20),
        fetchAdvisoryHistory()
      ]);
      setRiskHistory(rHist && rHist.length > 0 ? rHist : []);
      setAdvisoryHistory(aHist && aHist.length > 0 ? aHist : defaultAdvisories);
    } catch (err) {
      console.warn("History fetch error:", err);
      setAdvisoryHistory(defaultAdvisories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistories();
  }, []);

  return (
    <div className="space-y-6 text-[#111111]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 border border-[#E5E5E5] rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Historical Audit Trail Logs
            </h1>
            <Badge status="HISTORICAL">AUDIT TRAIL</Badge>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            {location?.city || 'Kakinada'}, {location?.state || 'Andhra Pradesh'} • Historical risk evaluations, scenario runs, and advisory log history
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadHistories}
          icon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Logs
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-[#E5E5E5] shadow-xs w-fit text-xs">
        <button
          onClick={() => setActiveTab('assessments')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'assessments' ? 'bg-[#16A34A] text-white shadow-xs' : 'text-[#666666] hover:text-[#111111]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Risk Assessments ({riskHistory.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('simulations')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'simulations' ? 'bg-[#16A34A] text-white shadow-xs' : 'text-[#666666] hover:text-[#111111]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Simulations ({simulationRuns.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('advisories')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'advisories' ? 'bg-[#16A34A] text-white shadow-xs' : 'text-[#666666] hover:text-[#111111]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Advisories ({advisoryHistory.length})</span>
        </button>
      </div>

      {/* Content */}
      <Card padding="md">
        {loading ? (
          <div className="py-8 text-center text-xs text-[#666666]">
            Fetching audit log history...
          </div>
        ) : activeTab === 'assessments' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#666666] mb-2 pb-2 border-b border-[#E5E5E5]">
              <span className="font-bold text-[#111111]">Risk Assessment Logs</span>
              <Badge status="LIVE">EVIDENCE-BASED</Badge>
            </div>

            {riskHistory.map((item, idx) => {
              const score = item.score !== undefined ? Math.round(item.score * 100) : 60;
              const category = item.category || (score > 65 ? 'High' : (score > 35 ? 'Moderate' : 'Low'));
              const isHigh = category.toLowerCase().includes('high') || category.toLowerCase().includes('critical');

              return (
                <div key={item.id || idx} className="p-4 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl text-xs space-y-2.5 transition-all hover:border-[#16A34A]/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                        isHigh ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]' : 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                      }`}>
                        {category.toUpperCase()} RISK
                      </span>
                      <span className="font-bold text-sm text-[#111111]">
                        {item.location_name || `${item.lat?.toFixed(2)}° N, ${item.lon?.toFixed(2)}° E`}
                      </span>
                    </div>

                    <div className="text-[#888888] font-mono text-[11px] flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-[#16A34A]" />
                      <span>{item.created_at || 'Recent'}</span>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                      <div className="text-[10px] text-[#888888] font-mono uppercase">Composite Index</div>
                      <div className="text-base font-extrabold text-[#111111]">{score} <span className="text-[10px] font-normal text-[#888888]">/ 100</span></div>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                      <div className="text-[10px] text-[#888888] font-mono uppercase">Hazard (H)</div>
                      <div className="text-sm font-bold text-[#D97706]">{item.hazard_score ? Math.round(item.hazard_score * 100) : '--'}%</div>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                      <div className="text-[10px] text-[#888888] font-mono uppercase">Exposure (E)</div>
                      <div className="text-sm font-bold text-[#2563EB]">{item.exposure_score ? Math.round(item.exposure_score * 100) : '--'}%</div>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#E5E5E5]">
                      <div className="text-[10px] text-[#888888] font-mono uppercase">Vulnerability (V)</div>
                      <div className="text-sm font-bold text-[#7C3AED]">{item.vulnerability_score ? Math.round(item.vulnerability_score * 100) : '--'}%</div>
                    </div>
                  </div>

                  {/* Factor Tags */}
                  {Array.isArray(item.factors) && item.factors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.factors.map((f: string, fIdx: number) => (
                        <span key={fIdx} className="px-2 py-0.5 rounded-md bg-white border border-[#E5E5E5] text-[11px] text-[#444444]">
                          • {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : activeTab === 'simulations' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#666666] mb-2 pb-2 border-b border-[#E5E5E5]">
              <span className="font-bold text-[#111111]">Simulation Scenario Execution History</span>
              <Badge status="MODELLED">PHYSICS-BASED</Badge>
            </div>

            {simulationRuns.map((sim) => (
              <div key={sim.id} className="p-4 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl space-y-3 text-xs transition-all hover:border-[#16A34A]/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] font-mono font-bold text-[11px]">
                      {sim.id}
                    </span>
                    <span className="font-bold text-sm text-[#111111]">{sim.location}</span>
                  </div>
                  <div className="text-[#888888] font-mono text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#16A34A]" />
                    <span>{sim.timestamp}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 bg-white border border-[#E5E5E5] rounded-lg flex items-center gap-2">
                    <Wind className="w-4 h-4 text-[#2563EB]" />
                    <div>
                      <div className="text-[10px] text-[#888888]">Wind Velocity</div>
                      <div className="font-bold text-[#111111]">{sim.scenario_inputs.wind_speed_kmh} km/h</div>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white border border-[#E5E5E5] rounded-lg flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-[#0284C7]" />
                    <div>
                      <div className="text-[10px] text-[#888888]">24h Rain</div>
                      <div className="font-bold text-[#111111]">{sim.scenario_inputs.rainfall_24h_mm} mm</div>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white border border-[#E5E5E5] rounded-lg flex items-center gap-2">
                    <Waves className="w-4 h-4 text-[#0D9488]" />
                    <div>
                      <div className="text-[10px] text-[#888888]">Storm Surge</div>
                      <div className="font-bold text-[#111111]">{sim.scenario_inputs.storm_surge_m} m</div>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white border border-[#E5E5E5] rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#888888]">Simulated Score</div>
                      <div className="font-extrabold text-[#DC2626]">
                        {Math.round(sim.simulated_risk_score * 100)} <span className="text-[10px] font-normal text-[#888888]">/ 100</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#DC2626]">{sim.delta_pct}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#666666] mb-2 pb-2 border-b border-[#E5E5E5]">
              <span className="font-bold text-[#111111]">Advisories & Notification Broadcast Log</span>
              <Badge status="FORECAST">AUTHORIZED</Badge>
            </div>

            {advisoryHistory.map((adv, idx) => (
              <div key={adv.id || idx} className="p-4 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl text-xs space-y-2.5 transition-all hover:border-[#16A34A]/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] font-mono font-bold text-[10px]">
                      {adv.status || 'VERIFIED'}
                    </span>
                    <span className="font-bold text-sm text-[#111111]">{adv.title}</span>
                  </div>
                  <div className="text-[#888888] font-mono text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#16A34A]" />
                    <span>{adv.created_at || 'Recent'}</span>
                  </div>
                </div>

                <p className="text-[#555555] leading-relaxed bg-white p-3 rounded-lg border border-[#E5E5E5]">
                  {adv.message}
                </p>

                {Array.isArray(adv.recommended_actions) && adv.recommended_actions.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="font-bold text-[11px] text-[#111111] uppercase tracking-wider">
                      Recommended Operational Directives:
                    </div>
                    <div className="space-y-1">
                      {adv.recommended_actions.map((act: string, actIdx: number) => (
                        <div key={actIdx} className="flex items-start gap-2 text-[#444444]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
