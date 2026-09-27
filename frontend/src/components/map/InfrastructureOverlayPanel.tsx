import React, { useState } from 'react';
import { Building2, Search, MapPin, X, ExternalLink } from 'lucide-react';

interface InfrastructureOverlayPanelProps {
  infrastructureFeatures: any[];
  onSelectAsset: (asset: any) => void;
  onClose: () => void;
}

export const InfrastructureOverlayPanel: React.FC<InfrastructureOverlayPanelProps> = ({
  infrastructureFeatures,
  onSelectAsset,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'Hospitals' | 'Shelters' | 'Roads' | 'Bridges' | 'Power'>('Hospitals');
  const [searchQuery, setSearchQuery] = useState('');

  const sampleAssets: any[] = [
    { id: 'h1', name: 'Government General Hospital', category: 'Hospital', location: 'Kakinada Main Coastal Road', riskLevel: 'High', coordinates: [82.2475, 16.9891], rawFeature: null },
    { id: 'h2', name: 'Area Cyclone Emergency Shelter 3', category: 'Shelter', location: 'Coastal Sector B', riskLevel: 'High', coordinates: [82.2510, 16.9920], rawFeature: null },
    { id: 'h3', name: 'Community Medical Center', category: 'Hospital', location: 'Pithapuram Sector', riskLevel: 'Medium', coordinates: [82.2600, 17.0100], rawFeature: null },
    { id: 'h4', name: 'National Highway Causeway Bridge', category: 'Bridge', location: 'Kakinada Express Highway', riskLevel: 'Critical', coordinates: [82.2350, 16.9750], rawFeature: null },
    { id: 'h5', name: 'Primary Electrical Substation 220kV', category: 'Power', location: 'Industrial Grid Zone', riskLevel: 'High', coordinates: [82.2400, 16.9800], rawFeature: null }
  ];

  const featuresToDisplay = infrastructureFeatures.length > 0 ? infrastructureFeatures.map((f: any, idx: number) => ({
    id: f.properties?.id || `feat-${idx}`,
    name: f.properties?.name || `OSM Infrastructure ${idx + 1}`,
    category: f.properties?.category || 'Hospital',
    location: f.properties?.location || 'Coastal District',
    riskLevel: f.properties?.riskLevel || (idx % 2 === 0 ? 'High' : 'Medium'),
    coordinates: f.geometry?.coordinates || [82.2475, 16.9891],
    rawFeature: f
  })) : sampleAssets;

  const filteredAssets = featuresToDisplay.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBadgeStyle = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="w-96 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-100 flex flex-col space-y-3 z-40 select-none max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Building2 className="w-4 h-4" />
          <span>Critical Infrastructure GIS</span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] overflow-x-auto">
        {(['Hospitals', 'Shelters', 'Roads', 'Bridges', 'Power'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              activeTab === tab ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter infrastructure assets..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Asset List */}
      <div className="space-y-2 overflow-y-auto max-h-72">
        {filteredAssets.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
            No matching infrastructure facilities found.
          </div>
        ) : (
          filteredAssets.map((asset, idx) => (
            <div
              key={idx}
              onClick={() => onSelectAsset(asset.rawFeature || asset)}
              className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs group"
            >
              <div className="space-y-1 overflow-hidden">
                <div className="font-bold text-white group-hover:text-cyan-300 truncate">
                  {asset.name}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center truncate">
                  <MapPin className="w-3 h-3 mr-1 text-slate-500 shrink-0" />
                  <span>{asset.location}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getBadgeStyle(asset.riskLevel)}`}>
                  {asset.riskLevel}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
