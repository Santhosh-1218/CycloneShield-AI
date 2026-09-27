import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle2, Building2 } from 'lucide-react';
import { useUserLocation } from '../hooks/useUserLocation';
import { fetchInfrastructureOSM } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const InfrastructurePage: React.FC = () => {
  const { location } = useUserLocation();
  const navigate = useNavigate();
  const lat = location.latitude || 17.6868;
  const lon = location.longitude || 83.2185;

  const [activeTab, setActiveTab] = useState<'Hospitals' | 'Shelters' | 'Roads' | 'Bridges' | 'Power'>('Hospitals');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [osmData, setOsmData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadOSM() {
      const data = await fetchInfrastructureOSM(lat, lon, 35000);
      if (isMounted) {
        setOsmData(data);
        if (data?.features && data.features.length > 0) {
          setSelectedAsset(data.features[0]);
        }
      }
    }
    loadOSM();
    return () => { isMounted = false; };
  }, [lat, lon]);

  const features = osmData?.features || [];

  const sampleHospitals = [
    { id: 'h1', name: 'Government Hospital', location: 'Kakinada', riskLevel: 'High', populationServed: 'High', floodRisk: 'High', roadAccess: 'High Risk', powerRisk: 'Medium' },
    { id: 'h2', name: 'Area Hospital', location: 'Kakinada', riskLevel: 'High', populationServed: 'High', floodRisk: 'High', roadAccess: 'Moderate', powerRisk: 'Medium' },
    { id: 'h3', name: 'City Hospital', location: 'Tuni', riskLevel: 'Medium', populationServed: 'Medium', floodRisk: 'Medium', roadAccess: 'Moderate', powerRisk: 'Low' },
    { id: 'h4', name: 'Community Health Center', location: 'Pithapuram', riskLevel: 'Medium', populationServed: 'Medium', floodRisk: 'Low', roadAccess: 'Low', powerRisk: 'Medium' },
    { id: 'h5', name: 'Primary Health Center', location: 'Amalapuram', riskLevel: 'Low', populationServed: 'Low', floodRisk: 'Low', roadAccess: 'Low', powerRisk: 'Low' }
  ];

  const filteredAssets = features.length > 0 ? features.filter((feat: any) => {
    const props = feat.properties || {};
    const matchesSearch = props.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) : sampleHospitals;

  const currentAsset = selectedAsset ? {
    name: selectedAsset.properties?.name || selectedAsset.name || 'Government Hospital',
    location: selectedAsset.properties?.location || selectedAsset.location || 'Kakinada',
    riskLevel: selectedAsset.riskLevel || 'High',
    populationServed: selectedAsset.populationServed || 'High',
    floodRisk: selectedAsset.floodRisk || 'High',
    roadAccess: selectedAsset.roadAccess || 'High Risk',
    powerRisk: selectedAsset.powerRisk || 'Medium'
  } : sampleHospitals[0];

  const riskBadgeColor = (cat: string) => {
    switch (cat) {
      case 'High': return 'bg-red-100 text-red-600 border-red-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Infrastructure</h1>
        <p className="text-xs text-slate-500">Critical assets and their risk levels</p>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs">
          {(['Hospitals', 'Shelters', 'Roads', 'Bridges', 'Power'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Main Layout Grid matching Mockup: Table Left (7 cols), Selected Asset Card Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Column (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-right">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((asset: any, idx: number) => {
                  const name = asset.properties?.name || asset.name || 'Hospital Asset';
                  const loc = asset.properties?.location || asset.location || 'Sector';
                  const risk = asset.riskLevel || 'High';

                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedAsset(asset)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        currentAsset.name === name ? 'bg-blue-50/50 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">{name}</td>
                      <td className="py-3.5 px-4 text-slate-500">{loc}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${riskBadgeColor(risk)}`}>
                          {risk}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Asset Card Column (5 cols) matching Mockup */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{currentAsset.name}</h3>
                <p className="text-xs text-slate-500 flex items-center mt-0.5">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {currentAsset.location}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${riskBadgeColor(currentAsset.riskLevel)}`}>
                Risk: {currentAsset.riskLevel}
              </span>
            </div>

            {/* Building Image Box */}
            <div className="h-36 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center relative overflow-hidden">
              <Building2 className="w-12 h-12 text-slate-400" />
              <div className="absolute bottom-2 left-3 text-[11px] font-medium text-slate-500">
                Government hospital facility node
              </div>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Population Served</span>
              <span className="font-bold text-slate-900">{currentAsset.populationServed}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Flood Risk</span>
              <span className="font-bold text-red-600">{currentAsset.floodRisk}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Road Access</span>
              <span className="font-bold text-red-600">{currentAsset.roadAccess}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Power Risk</span>
              <span className="font-bold text-amber-600">{currentAsset.powerRisk}</span>
            </div>
          </div>

          {/* AI Recommendations List matching Mockup */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">AI Recommendations</span>
            <ul className="space-y-1.5 text-xs text-slate-700">
              <li className="flex items-start">
                <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-blue-600 shrink-0 mt-0.5" />
                <span>Verify backup power systems</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-blue-600 shrink-0 mt-0.5" />
                <span>Check alternate evacuation routes</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-blue-600 shrink-0 mt-0.5" />
                <span>Prepare emergency supplies</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/risk-map')}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center"
          >
            View on Map
          </button>
        </div>
      </div>
    </div>
  );
};

