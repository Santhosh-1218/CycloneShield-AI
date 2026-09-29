import React, { useState, useEffect } from 'react';
import { Building2, Users, Home, CheckSquare, RefreshCw } from 'lucide-react';
import { MapLibreView } from '../components/map/MapLibreView';
import type { MapLayersState } from '../components/map/LayerControls';
import { useLocation } from '../context/LocationContext';
import { generateActionPlan, fetchInfrastructureOSM } from '../services/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const ActionCenterPage: React.FC = () => {
  const { location } = useLocation();

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

  const loadActionPlan = async () => {
    setLoading(true);
    try {
      const [plan, osm] = await Promise.all([
        generateActionPlan({
          lat: location.latitude,
          lon: location.longitude,
          risk_score: 0.65,
          risk_category: 'High',
          hazard_score: 0.6,
          exposure_score: 0.55,
          vulnerability_score: 0.8,
          factors: ['Severe sustained wind speed', 'Low elevation coastal terrain']
        }),
        fetchInfrastructureOSM(location.latitude, location.longitude)
      ]);

      setActionPlan(plan);
      setOsmData(osm);
    } catch (err) {
      console.warn("Error generating action plan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActionPlan();
  }, [location.latitude, location.longitude]);

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
    <div className="space-y-6 text-[#111111]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 border border-[#E5E5E5] rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Action Center & Directives
            </h1>
            <Badge status="MODELLED">DIRECTIVES</Badge>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            {location.city}, {location.state} • Pre-landfall anticipatory action directives & verification checklist
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadActionPlan}
          icon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Regenerate Action Directives
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Verification Checklist (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card padding="md">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="w-5 h-5 text-[#16A34A]" />
              <h2 className="text-base font-bold text-[#111111]">Operational Verification Checklist</h2>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-[#666666]">
                Synthesizing 6h / 12h / 24h operational directives...
              </div>
            ) : actionPlan ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl space-y-2">
                  <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    Infrastructure Actions
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#666666]">
                    {actionPlan.infrastructure_actions?.map((act: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <input type="checkbox" className="mt-0.5 accent-[#16A34A]" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl space-y-2">
                  <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#16A34A]" />
                    Population Sector Actions
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#666666]">
                    {actionPlan.population_actions?.map((act: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <input type="checkbox" className="mt-0.5 accent-[#16A34A]" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl space-y-2">
                  <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-[#16A34A]" />
                    Shelter Readiness
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#666666]">
                    {actionPlan.shelter_actions?.map((act: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <input type="checkbox" className="mt-0.5 accent-[#16A34A]" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </Card>
        </div>

        {/* Action Map (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card padding="none" className="overflow-hidden">
            <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#111111]">Action Map (GIS Assets)</h2>

              <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-lg border border-[#E5E5E5] text-xs">
                {(['all', 'hospitals', 'shelters', 'roads'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleFilterChange(t)}
                    className={`px-2 py-1 rounded font-medium capitalize cursor-pointer ${
                      filterType === t ? 'bg-white text-[#16A34A] font-bold shadow-xs' : 'text-[#666666]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[500px] w-full relative">
              <MapLibreView
                layers={layers}
                selectedLocation={{ lat: location.latitude, lng: location.longitude }}
                infrastructureFeatures={osmData?.features || []}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
