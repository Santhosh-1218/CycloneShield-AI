import { Database, X } from 'lucide-react';

interface DataSourcesOverlayPanelProps {
  statusList?: any[];
  onClose: () => void;
}

export const DataSourcesOverlayPanel: React.FC<DataSourcesOverlayPanelProps> = ({
  statusList = [],
  onClose
}) => {
  const fallbackSources = [
    { source: 'IMD (Weather & Cyclone)', type: 'Open-Meteo & IMD API', status: 'LIVE', lastUpdated: 'Real-time sync' },
    { source: 'Sentinel-1 (Flood Extent)', type: 'Google Earth Engine SAR', status: 'AVAILABLE', lastUpdated: 'Satellite Pass (3h ago)' },
    { source: 'CHIRPS (Rainfall)', type: 'Climate Hazards Group', status: 'AVAILABLE', lastUpdated: 'Daily raster dataset' },
    { source: 'GFS (Global Weather)', type: 'NOAA Forecasting Model', status: 'LIVE', lastUpdated: 'Real-time forecast feed' },
    { source: 'OpenStreetMap (Land Cover & Infra)', type: 'Overpass API', status: 'LIVE', lastUpdated: 'On-demand geo queries' },
    { source: 'Population (Gridded Population)', type: 'WorldPop / ISPIC', status: 'BASELINE', lastUpdated: '2025 Baseline mesh' },
    { source: 'Infrastructure Risk Engine', type: 'CycloneShield Risk Calculator', status: 'LIVE', lastUpdated: 'Active' },
  ];

  const sources = statusList.length > 0 ? statusList : fallbackSources;

  return (
    <div className="w-96 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-100 flex flex-col space-y-3 z-40 select-none max-h-[85vh] overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Database className="w-4 h-4" />
          <span>Telemetry & Data Feeds</span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-72 text-xs">
        {sources.map((item, idx) => (
          <div key={idx} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-white block">{item.name || item.source}</span>
              <span className="text-[10px] text-slate-400 block">{item.type || item.provider || 'GIS Telemetry Stream'}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
              {item.status || 'LIVE'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
