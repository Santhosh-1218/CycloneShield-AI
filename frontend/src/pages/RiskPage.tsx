import React, { useState, useEffect } from 'react';
import { RefreshCw, Calculator, Layers } from 'lucide-react';
import { fetchCurrentRisk, type RiskResult } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { useNavigate } from 'react-router-dom';

export const RiskPage: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useLocation();

  const [riskData, setRiskData] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadRiskData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCurrentRisk(location.latitude, location.longitude);
      if (res && res.risk_score !== undefined) {
        setRiskData(res);
      } else {
        setRiskData(res);
      }
    } catch (err) {
      console.warn("Error fetching risk calculations:", err);
      setError("Unable to compute risk score for selected location.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiskData();
  }, [location.latitude, location.longitude]);

  const riskScore = riskData?.risk_score !== undefined ? Math.round(riskData.risk_score) : null;
  const hazardScore = riskData?.hazard_score !== undefined ? Math.round(riskData.hazard_score) : null;
  const exposureScore = riskData?.exposure_score !== undefined ? Math.round(riskData.exposure_score) : null;
  const vulnerabilityScore = riskData?.vulnerability_score !== undefined ? Math.round(riskData.vulnerability_score) : null;
  const riskLevel = riskData?.risk_level || (riskScore && riskScore > 75 ? 'HIGH' : 'LOW');

  return (
    <div className="space-y-6 text-[#111111]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 border border-[#E5E5E5] rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Geographic Disaster Risk Engine
            </h1>
            <Badge status="MODELLED">MODELLED</Badge>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            {location.city}, {location.state} • Quantitative Hazard, Exposure & Vulnerability Risk Model
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadRiskData}
            icon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Recalculate
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/map')}
            icon={<Layers className="h-3.5 w-3.5" />}
          >
            Spatial Risk Map
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={2} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadRiskData} />
      ) : (
        <>
          {/* Main Risk Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card padding="md">
              <span className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-1">Overall Risk Score</span>
              <div className="text-4xl font-extrabold text-[#111111]">
                {riskScore !== null ? riskScore : 'N/A'} <span className="text-xs font-normal text-[#666666]">/ 100</span>
              </div>
              <div className="mt-2">
                <Badge status={riskScore && riskScore > 60 ? "WARNING" : "SUCCESS"}>
                  {riskLevel}
                </Badge>
              </div>
            </Card>

            <Card padding="md">
              <span className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-1">Hazard Index ($H$)</span>
              <div className="text-3xl font-extrabold text-[#111111]">
                {hazardScore !== null ? `${hazardScore} / 100` : 'N/A'}
              </div>
              <p className="text-xs text-[#666666] mt-1">Wind velocity, precipitation & surge</p>
            </Card>

            <Card padding="md">
              <span className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-1">Exposure Index ($E$)</span>
              <div className="text-3xl font-extrabold text-[#111111]">
                {exposureScore !== null ? `${exposureScore} / 100` : 'N/A'}
              </div>
              <p className="text-xs text-[#666666] mt-1">Population & infrastructure density</p>
            </Card>

            <Card padding="md">
              <span className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-1">Vulnerability Index ($V$)</span>
              <div className="text-3xl font-extrabold text-[#111111]">
                {vulnerabilityScore !== null ? `${vulnerabilityScore} / 100` : 'N/A'}
              </div>
              <p className="text-xs text-[#666666] mt-1">Topographical elevation & coastal decay</p>
            </Card>
          </div>

          {/* How This Was Calculated (Requirement #25) */}
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-5 h-5 text-[#16A34A]" />
              <h2 className="text-base font-bold text-[#111111]">How This Was Calculated</h2>
              <Badge status="MODELLED">Mathematical Formula</Badge>
            </div>

            <div className="p-4 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl mb-4 font-mono text-xs text-[#111111] font-bold text-center">
              Risk Score = Hazard Score × Exposure Score × Vulnerability Score
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#666666] leading-relaxed">
              <div className="p-3 border border-[#E5E5E5] rounded-xl bg-white">
                <strong className="text-[#111111] block mb-1">1. Hazard ($H$)</strong>
                Composite weighted sum of surface wind speed, 24h accumulated precipitation, central surface pressure drop, and wave surge.
              </div>
              <div className="p-3 border border-[#E5E5E5] rounded-xl bg-white">
                <strong className="text-[#111111] block mb-1">2. Exposure ($E$)</strong>
                Count of critical infrastructure facilities (hospitals, shelters, schools, bridges) within 15 km spatial radius.
              </div>
              <div className="p-3 border border-[#E5E5E5] rounded-xl bg-white">
                <strong className="text-[#111111] block mb-1">3. Vulnerability ($V$)</strong>
                NASADEM coastal elevation below 5m ASL combined with logarithmic coastal proximity decay function.
              </div>
            </div>
          </Card>

          {/* Explainable Risk Factors */}
          <Card padding="lg">
            <h2 className="text-base font-bold text-[#111111] mb-3">Explainable Risk Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {riskData?.explainable_factors && riskData.explainable_factors.length > 0 ? (
                riskData.explainable_factors.map((f, i) => (
                  <div key={i} className="p-3.5 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-[#111111]">{f.factor}</strong>
                      <Badge status={f.impact === 'High' ? 'WARNING' : 'INFO'} size="sm">
                        {f.impact} Impact
                      </Badge>
                    </div>
                    <p className="text-[#666666]">{f.description}</p>
                  </div>
                ))
              ) : (
                <div className="text-[#666666] italic">
                  Normal baseline conditions observed for selected location.
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
