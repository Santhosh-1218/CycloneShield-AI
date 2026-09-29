import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw } from 'lucide-react';
import { fetchSatelliteMetadata } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const SatellitePage: React.FC = () => {
  const { location } = useLocation();
  const [satellite, setSatellite] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadSatellite = async () => {
    setLoading(true);
    try {
      const res = await fetchSatelliteMetadata(location.latitude, location.longitude);
      setSatellite(res);
    } catch (err) {
      console.warn("Error fetching satellite metadata:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSatellite();
  }, [location.latitude, location.longitude]);

  return (
    <div className="space-y-6 text-[#111111]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 border border-[#E5E5E5] rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Satellite Radar Imagery
            </h1>
            <Badge status="SATELLITE">SENTINEL-1 SAR</Badge>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            {location.city}, {location.state} • Copernicus Sentinel-1 Synthetic Aperture Radar (SAR)
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadSatellite}
          icon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Feed
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md">
          <span className="text-xs font-semibold text-[#888888] uppercase block mb-1">Satellite Instrument</span>
          <div className="text-lg font-bold text-[#111111]">{satellite?.metadata?.satellite || 'Sentinel-1A SAR'}</div>
          <span className="text-xs text-[#16A34A] font-mono">C-Band Synthetic Aperture Radar</span>
        </Card>

        <Card padding="md">
          <span className="text-xs font-semibold text-[#888888] uppercase block mb-1">Spatial Resolution</span>
          <div className="text-lg font-bold text-[#111111]">10 Meter Grid</div>
          <span className="text-xs text-[#666666]">All-Weather Day & Night Radar Pass</span>
        </Card>

        <Card padding="md">
          <span className="text-xs font-semibold text-[#888888] uppercase block mb-1">Data Pipeline Engine</span>
          <div className="text-lg font-bold text-[#16A34A]">Google Earth Engine</div>
          <span className="text-xs text-[#666666]">Google Cloud Sentinel API</span>
        </Card>
      </div>

      <Card padding="lg">
        <h2 className="text-base font-bold text-[#111111] flex items-center gap-2 mb-4">
          <Radio className="w-5 h-5 text-[#16A34A]" />
          <span>Observation & Satellite Metadata</span>
        </h2>

        <div className="space-y-2.5 font-mono text-xs text-[#111111] bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E5E5]">
          <div className="flex justify-between"><span>Provider:</span><strong className="text-[#111111]">Copernicus Sentinel / ESA</strong></div>
          <div className="flex justify-between"><span>Polarization Modes:</span><strong className="text-[#16A34A]">VV, VH Dual-Pol</strong></div>
          <div className="flex justify-between"><span>Observation Timestamp:</span><strong className="text-[#111111]">{satellite?.observationTime || new Date().toISOString()}</strong></div>
          <div className="flex justify-between"><span>Status:</span><Badge status="LIVE">● AVAILABLE</Badge></div>
        </div>
      </Card>
    </div>
  );
};
