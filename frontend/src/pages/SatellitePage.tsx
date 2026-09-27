import React, { useState, useEffect } from 'react';
import { Satellite, Radio } from 'lucide-react';
import { fetchSatelliteMetadata } from '../services/api';

export const SatellitePage: React.FC = () => {
  const [satellite, setSatellite] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetchSatelliteMetadata(16.9891, 82.2475);
      setSatellite(res);
    }
    load();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      <div className="flex items-center space-x-2">
        <Satellite className="w-6 h-6 text-cyan-400" />
        <h1 className="text-2xl font-bold text-white tracking-tight">Copernicus Sentinel-1 SAR Satellite Monitoring</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Satellite Instrument</span>
          <div className="text-xl font-bold text-white">{satellite?.metadata?.satellite || 'Sentinel-1A SAR'}</div>
          <span className="text-xs text-cyan-400 font-mono">C-Band Synthetic Aperture Radar</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Spatial Resolution</span>
          <div className="text-xl font-bold text-emerald-400">10 Meter Grid</div>
          <span className="text-xs text-slate-400">All-Weather Day & Night Radar Pass</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Data Pipeline Engine</span>
          <div className="text-xl font-bold text-cyan-400">Google Earth Engine</div>
          <span className="text-xs text-slate-400">GCP Project: cycloneshield-ai-509618</span>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Radio className="w-5 h-5 text-cyan-400" />
          <span>Observation Metadata & Satellite Metadata</span>
        </h2>

        <div className="space-y-2 font-mono text-xs text-slate-300 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between"><span>Provider:</span><strong className="text-white">Copernicus Sentinel / ESA</strong></div>
          <div className="flex justify-between"><span>Polarization Modes:</span><strong className="text-cyan-400">VV, VH Dual-Pol</strong></div>
          <div className="flex justify-between"><span>Observation Timestamp:</span><strong className="text-white">{satellite?.observationTime || '2026-09-25T06:00:00Z'}</strong></div>
          <div className="flex justify-between"><span>Status:</span><strong className="text-emerald-400">● AVAILABLE</strong></div>
        </div>
      </div>
    </div>
  );
};
