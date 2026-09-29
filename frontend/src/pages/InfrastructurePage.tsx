import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { fetchInfrastructureOSM } from '../services/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const InfrastructurePage: React.FC = () => {
  const { location } = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'Hospitals' | 'Shelters' | 'Roads' | 'Bridges' | 'Power'>('Hospitals');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [osmData, setOsmData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadOSM = async () => {
    setLoading(true);
    try {
      const data = await fetchInfrastructureOSM(location.latitude, location.longitude, 35000);
      setOsmData(data);
      if (data?.features && data.features.length > 0) {
        setSelectedAsset(data.features[0]);
      }
    } catch (err) {
      console.warn("OSM load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOSM();
  }, [location.latitude, location.longitude]);

  const features = osmData?.features || [];

  const sampleHospitals = [
    { id: 'h1', name: 'Government General Hospital', location: location.city, riskLevel: 'High', populationServed: 'High', floodRisk: 'High', roadAccess: 'High Risk', powerRisk: 'Medium' },
    { id: 'h2', name: 'District Area Hospital', location: location.city, riskLevel: 'High', populationServed: 'High', floodRisk: 'High', roadAccess: 'Moderate', powerRisk: 'Medium' },
    { id: 'h3', name: 'Community Health Center', location: location.district, riskLevel: 'Medium', populationServed: 'Medium', floodRisk: 'Medium', roadAccess: 'Moderate', powerRisk: 'Low' },
    { id: 'h4', name: 'Primary Health Center', location: location.district, riskLevel: 'Medium', populationServed: 'Medium', floodRisk: 'Low', roadAccess: 'Low', powerRisk: 'Medium' }
  ];

  const filteredAssets = features.length > 0 ? features.filter((feat: any) => {
    const props = feat.properties || {};
    const matchesSearch = props.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) : sampleHospitals;

  const currentAsset = selectedAsset ? {
    name: selectedAsset.properties?.name || selectedAsset.name || 'Government General Hospital',
    location: selectedAsset.properties?.location || selectedAsset.location || location.city,
    riskLevel: selectedAsset.riskLevel || 'High',
    populationServed: selectedAsset.populationServed || 'High',
    floodRisk: selectedAsset.floodRisk || 'High',
    roadAccess: selectedAsset.roadAccess || 'High Risk',
    powerRisk: selectedAsset.powerRisk || 'Medium'
  } : sampleHospitals[0];

  return (
    <div className="space-y-6 text-[#111111]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 border border-[#E5E5E5] rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Infrastructure Explorer
            </h1>
            <Badge status="LIVE">OPENSTRATMAP GIS</Badge>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            {location.city}, {location.state} • Critical facilities, evacuation shelters, hospitals, and access corridors
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadOSM}
          icon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh OSM Data
        </Button>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-[#E5E5E5] shadow-xs text-xs">
          {(['Hospitals', 'Shelters', 'Roads', 'Bridges', 'Power'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === tab ? 'bg-[#16A34A] text-white shadow-xs' : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter infrastructure..."
            className="w-full bg-white border border-[#E5E5E5] rounded-xl pl-9 pr-4 py-2 text-xs text-[#111111] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
          />
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Column (7 cols) */}
        <Card className="lg:col-span-7 overflow-hidden" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#111111]">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E5E5] text-[#888888] font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Asset Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Exposure Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredAssets.map((asset: any, idx: number) => {
                  const name = asset.properties?.name || asset.name || 'Hospital Asset';
                  const loc = asset.properties?.location || asset.location || location.city;
                  const risk = asset.riskLevel || 'High';

                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedAsset(asset)}
                      className={`hover:bg-[#F0FDF4] transition-colors cursor-pointer ${
                        currentAsset.name === name ? 'bg-[#F0FDF4] font-bold text-[#16A34A]' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold">{name}</td>
                      <td className="py-3 px-4 text-[#666666]">{loc}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge status={risk === 'High' ? 'WARNING' : 'SUCCESS'} size="sm">
                          {risk}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Selected Asset Details (5 cols) */}
        <Card className="lg:col-span-5 space-y-4" padding="md">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
            <div>
              <h3 className="text-base font-extrabold text-[#111111]">{currentAsset.name}</h3>
              <p className="text-xs text-[#666666] flex items-center mt-0.5">
                <MapPin className="w-3.5 h-3.5 mr-1 text-[#16A34A]" />
                {currentAsset.location}
              </p>
            </div>
            <Badge status={currentAsset.riskLevel === 'High' ? 'WARNING' : 'SUCCESS'}>
              Risk: {currentAsset.riskLevel}
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
              <span className="text-[#666666]">Population Served</span>
              <span className="font-bold text-[#111111]">{currentAsset.populationServed}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
              <span className="text-[#666666]">Flood Vulnerability</span>
              <span className="font-bold text-[#DC2626]">{currentAsset.floodRisk}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
              <span className="text-[#666666]">Evacuation Road Access</span>
              <span className="font-bold text-[#DC2626]">{currentAsset.roadAccess}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#666666]">Power Grid Vulnerability</span>
              <span className="font-bold text-[#CA8A04]">{currentAsset.powerRisk}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E5E5] space-y-2">
            <span className="text-xs font-bold text-[#111111] uppercase tracking-wider block">Operational Action Directives</span>
            <ul className="space-y-1.5 text-xs text-[#666666]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>Verify emergency diesel generator fuel reserves (24h run time).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>Check alternate shelter access routes if primary corridor floods.</span>
              </li>
            </ul>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="w-full mt-4"
            onClick={() => navigate('/map')}
          >
            Locate Facility on Map
          </Button>
        </Card>
      </div>
    </div>
  );
};
