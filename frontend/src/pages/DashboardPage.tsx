import React, { useState, useRef } from 'react';
import { 
  CloudSun, 
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  MapPin,
  X,
  AlertTriangle,
  Compass,
  Gauge
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useWeather } from '../context/WeatherContext';
import { fetchReverseGeocode, type CycloneForecastPoint } from '../services/api';
import { MapLibreView } from '../components/map/MapLibreView';
import { LeftToolbar } from '../components/map/LeftToolbar';
import { LayerSelectorModal, type LayerState } from '../components/map/LayerSelectorModal';
import CycloneInfoCard from '../components/map/CycloneInfoCard';
import ForecastPointPopup from '../components/map/ForecastPointPopup';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { location, setLocation } = useLocation();
  const { 
    weather, 
    cycloneData, 
    riskData,
    spatialGrid, 
    status, 
    lastSuccessfulFetch, 
    error, 
    isLoading, 
    refresh,
    selectedTimeStep,
    activeOverlay,
    setActiveOverlay
  } = useWeather();

  // UI Interactive States
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showCycloneCard, setShowCycloneCard] = useState<boolean>(true);
  const [selectedForecastPoint, setSelectedForecastPoint] = useState<CycloneForecastPoint | null>(null);
  const [showWeatherCard, setShowWeatherCard] = useState<boolean>(true);

  // Map Controls Refs
  const onZoomInRef = useRef<(() => void) | null>(null);
  const onZoomOutRef = useRef<(() => void) | null>(null);
  const onResetNorthRef = useRef<(() => void) | null>(null);

  // Layers State
  const [layerState, setLayerState] = useState<LayerState>({
    temperature: false,
    rainfall: false,
    precipitationProb: false,
    wind: true,
    humidity: false,
    pressure: false,
    satelliteImagery: false,
    floodIndicator: false,
    cycloneTrack: true,
    riskZones: true,
    elevation: false,
    landCover: false,
    hospitals: false,
    shelters: false,
    schools: false,
    roads: false,
    bridges: false,
    buildings: false
  });
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.75);

  // Map layer toggle helper
  const handleSelectOverlay = (modeId: string) => {
    setActiveOverlay(modeId);
    setLayerState(prev => ({
      ...prev,
      wind: modeId === 'wind',
      rainfall: modeId === 'rain',
      cycloneTrack: modeId === 'cyclone' || prev.cycloneTrack,
      temperature: modeId === 'temperature',
      pressure: modeId === 'pressure',
      satelliteImagery: modeId === 'satellite',
      floodIndicator: modeId === 'flood',
      hospitals: modeId === 'infrastructure',
      shelters: modeId === 'infrastructure',
      riskZones: modeId === 'risk'
    }));
  };

  const handleMapClick = async (lat: number, lng: number) => {
    const geocoded = await fetchReverseGeocode(lat, lng);
    const newCity = geocoded.name || geocoded.display_name || `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
    setLocation({
      latitude: lat,
      longitude: lng,
      city: newCity,
      district: geocoded.district || newCity,
      state: geocoded.state || '',
      country: geocoded.country || 'India',
      displayName: geocoded.display_name || newCity,
      isLiveLocation: false
    });
  };

  const handleSelectLocation = (loc: { lat: number; lng: number; name: string; country?: string; admin1?: string }) => {
    const lat = typeof loc.lat === 'number' && !isNaN(loc.lat) ? loc.lat : 16.9891;
    const lng = typeof loc.lng === 'number' && !isNaN(loc.lng) ? loc.lng : 82.2475;
    setLocation({
      latitude: lat,
      longitude: lng,
      city: loc.name || 'Selected Location',
      district: loc.admin1 || loc.name || 'Selected Location',
      state: loc.admin1 || '',
      country: loc.country || 'India',
      displayName: `${loc.name || 'Selected Location'}, ${loc.admin1 || loc.country || ''}`.trim(),
      isLiveLocation: false
    });
  };

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleMapClick(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          handleMapClick(16.9891, 82.2475);
        }
      );
    }
  };

  // Weather metrics cleanly derived from normalized data
  const tempC = weather?.temperature !== undefined && weather?.temperature !== null ? Math.round(weather.temperature) : null;
  const feelsLike = weather?.feels_like !== undefined && weather?.feels_like !== null ? Math.round(weather.feels_like) : null;
  const conditionText = weather?.weather_description || (tempC !== null ? 'Fair' : (isLoading ? 'Synchronizing telemetry...' : 'Data unavailable'));
  const humidity = weather?.humidity !== undefined && weather?.humidity !== null ? Math.round(weather.humidity) : null;
  const windSpeed = weather?.wind_speed !== undefined && weather?.wind_speed !== null ? Math.round(weather.wind_speed) : null;
  const windDir = weather?.wind_direction || 'NW';
  const pressure = weather?.pressure !== undefined && weather?.pressure !== null ? Math.round(weather.pressure) : null;
  const rain24h = weather?.precipitation !== undefined ? weather.precipitation : (weather?.values?.accumulatedRain24h ?? 0);

  // Derived Risk Score metrics
  const riskScore = riskData?.risk_score !== undefined && riskData?.risk_score !== null ? Math.round(riskData.risk_score) : null;
  const hazardScore = riskData?.hazard_score !== undefined ? Math.round(riskData.hazard_score) : null;
  const exposureScore = riskData?.exposure_score !== undefined ? Math.round(riskData.exposure_score) : null;
  const vulnerabilityScore = riskData?.vulnerability_score !== undefined ? Math.round(riskData.vulnerability_score) : null;
  const riskLevel = riskData?.risk_level || (riskScore && riskScore > 65 ? 'HIGH' : (riskScore && riskScore > 35 ? 'MODERATE' : 'LOW'));

  const formattedTime = lastSuccessfulFetch 
    ? lastSuccessfulFetch.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0A0F1D] text-[#111111] select-none flex flex-col">
      {/* ================= TOP COMMAND CENTER CONTROL BAR ================= */}
      <div className="absolute top-16 left-16 right-3 z-20 flex items-center justify-between pointer-events-none gap-2">
        {/* Left Status Indicator */}
        <div className="pointer-events-auto flex items-center space-x-2 sm:space-x-3">
          {/* Real Data Freshness Indicator */}
          <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#E5E5E5] px-3 py-1.5 rounded-full shadow-md text-xs font-semibold shrink-0">
            {status === 'LIVE' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse shrink-0" />
                <span className="text-[#111111] font-mono tracking-tight font-bold text-[11px]">LIVE TELEMETRY</span>
                {formattedTime && <span className="text-[#888888] font-normal text-[10px] font-mono hidden md:inline">[{formattedTime}]</span>}
              </>
            ) : status === 'LOADING' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-ping shrink-0" />
                <span className="text-[#111111] font-mono font-bold text-[11px]">UPDATING</span>
              </>
            ) : status === 'STALE' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
                <span className="text-[#D97706] font-mono font-bold text-[11px]">STALE CACHE</span>
                {formattedTime && <span className="text-[#888888] font-normal text-[10px] font-mono hidden md:inline">[{formattedTime}]</span>}
              </>
            ) : status === 'ERROR' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0" />
                <span className="text-[#DC2626] font-mono font-bold text-[11px]">DATA UNAVAILABLE</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#888888] shrink-0" />
                <span className="text-[#888888] font-mono text-[11px]">INITIALIZING</span>
              </>
            )}
          </div>
        </div>

        {/* Right Active Cyclone Alert Badge, Coordinates & Refresh */}
        <div className="pointer-events-auto flex items-center space-x-2">
          {cycloneData?.hasActiveCyclone ? (
            !showCycloneCard ? (
              <button
                onClick={() => setShowCycloneCard(true)}
                className="bg-[#FEF2F2]/95 backdrop-blur-md border border-[#FCA5A5] px-3 py-1.5 rounded-xl shadow-xs flex items-center space-x-2 text-xs text-[#DC2626] font-bold hover:bg-[#FEE2E2] transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping shrink-0" />
                <span className="font-mono text-[11px]">CYCLONE: {cycloneData.storm?.name || 'Active Storm'}</span>
              </button>
            ) : null
          ) : (
            <div className="hidden lg:flex items-center space-x-2 bg-white/90 backdrop-blur-md border border-[#E5E5E5] px-3 py-1.5 rounded-xl shadow-xs text-xs font-semibold">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? 'bg-[#DC2626]' : (riskLevel === 'MODERATE' ? 'bg-[#D97706]' : 'bg-[#16A34A]')
              }`} />
              <span className={`font-mono text-[11px] ${
                riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? 'text-[#DC2626]' : (riskLevel === 'MODERATE' ? 'text-[#D97706]' : 'text-[#16A34A]')
              }`}>
                THREAT LEVEL: {riskLevel || 'NOMINAL'}
              </span>
            </div>
          )}

          {/* Compact Coordinates Indicator */}
          <div className="hidden xl:flex items-center space-x-1.5 bg-white/90 backdrop-blur-md border border-[#E5E5E5] px-3 py-1.5 rounded-xl shadow-xs text-[11px] font-mono text-[#666666]">
            <span className="text-[#111111] font-semibold">
              {typeof location?.latitude === 'number' && Number.isFinite(location.latitude) ? Math.abs(location.latitude).toFixed(2) : '16.99'}° {location?.latitude >= 0 ? 'N' : 'S'}
            </span>
            <span className="text-[#888888]">•</span>
            <span className="text-[#111111] font-semibold">
              {typeof location?.longitude === 'number' && Number.isFinite(location.longitude) ? Math.abs(location.longitude).toFixed(2) : '82.25'}° {location?.longitude >= 0 ? 'E' : 'W'}
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => refresh(true)}
            className="shadow-xs font-mono text-xs bg-white/90 backdrop-blur-md"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* Non-blocking Toast for Stale / Refresh Failure */}
      {status === 'STALE' && error && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-[#FEF3C7] border border-[#FCD34D] px-3.5 py-1.5 rounded-xl shadow-lg text-xs text-[#92400E] flex items-center gap-2 animate-in fade-in duration-200">
          <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => refresh(true)}
            className="underline font-bold text-[#B45309] hover:text-[#78350F] ml-1 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ================= MAIN FULL-SCREEN MAP CANVAS ================= */}
      <div className="relative w-full h-full">
        {/* Subtle Command Center Grid Crosshair Accents */}
        <div className="absolute top-16 left-4 pointer-events-none z-10 text-white/20 font-mono text-[10px] select-none hidden md:block">
          + 18.55N
        </div>
        <div className="absolute top-16 right-4 pointer-events-none z-10 text-white/20 font-mono text-[10px] select-none hidden md:block">
          + 85.12E
        </div>

        <MapLibreView
          activeOverlay={activeOverlay}
          layers={layerState}
          overlayOpacity={overlayOpacity}
          selectedLocation={{ lat: location.latitude, lng: location.longitude }}
          onLocationSelect={handleMapClick}
          cycloneData={cycloneData}
          spatialWeatherGeoJSON={spatialGrid}
          selectedTimeStep={selectedTimeStep}
          weatherData={weather}
          onSelectCycloneCenter={() => setShowCycloneCard(true)}
          onSelectForecastPoint={(pt: CycloneForecastPoint) => setSelectedForecastPoint(pt)}
          onZoomInRef={onZoomInRef}
          onZoomOutRef={onZoomOutRef}
          onResetNorthRef={onResetNorthRef}
        />

        {/* Left Floating Overlay Modes Toolbar */}
        <div className="absolute top-16 left-3 z-20">
          <LeftToolbar
            activeOverlay={activeOverlay}
            onSelectOverlay={handleSelectOverlay}
            activeTab={activeTab}
            onToggleTab={(tab) => setActiveTab(activeTab === tab ? null : tab)}
            onZoomIn={() => onZoomInRef.current?.()}
            onZoomOut={() => onZoomOutRef.current?.()}
            onResetNorth={() => onResetNorthRef.current?.()}
            onMyLocation={handleMyLocation}
          />
        </div>

        {/* Layer Selector Modal */}
        {activeTab === 'layers' && (
          <div className="absolute top-16 left-16 z-30">
            <LayerSelectorModal
              layers={layerState}
              onToggleLayer={(key) => setLayerState(prev => ({ ...prev, [key]: !prev[key] }))}
              opacity={overlayOpacity}
              onOpacityChange={setOverlayOpacity}
              onClose={() => setActiveTab(null)}
            />
          </div>
        )}

        {/* Floating Active Cyclone Card */}
        {cycloneData?.hasActiveCyclone && showCycloneCard && (
          <div className="absolute top-16 right-3 z-30 pointer-events-auto">
            <CycloneInfoCard
              cycloneData={cycloneData}
              onClose={() => setShowCycloneCard(false)}
              onFlyToStorm={() => {
                if (cycloneData.storm?.currentPosition) {
                  handleSelectLocation({
                    lat: cycloneData.storm.currentPosition.lat,
                    lng: cycloneData.storm.currentPosition.lon,
                    name: cycloneData.storm.name
                  });
                }
              }}
            />
          </div>
        )}

        {/* Floating Forecast Point Popup */}
        {selectedForecastPoint && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <ForecastPointPopup
              point={selectedForecastPoint}
              stormName={cycloneData?.storm?.name || 'Active Cyclonic Storm'}
              onClose={() => setSelectedForecastPoint(null)}
            />
          </div>
        )}

        {/* ================= COMPACT FLOATING COMMAND INTELLIGENCE HUD ================= */}
        {showWeatherCard && (
          <div className="absolute bottom-3.5 left-3 sm:left-16 z-20 pointer-events-auto max-w-sm w-full bg-white/95 backdrop-blur-md border border-[#E5E5E5] rounded-xl shadow-xl p-3.5 space-y-3 text-[#111111] animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header: Location & Minimize */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-4 h-4 text-[#16A34A] shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-sm font-extrabold text-[#111111] truncate tracking-tight">
                    {location.city || 'Selected Location'}
                  </h2>
                  <p className="text-[11px] text-[#666666] truncate font-mono">
                    {[location.state, location.country].filter(Boolean).join(', ') || 'Coastal Sector'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowWeatherCard(false)}
                  className="p-1 hover:bg-[#F8FAFC] rounded-md text-[#888888] hover:text-[#111111] cursor-pointer"
                  title="Minimize"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Temperature & Condition Row */}
            <div className="flex items-center justify-between pt-1 border-t border-[#E5E5E5]">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#111111] tracking-tight font-mono">
                    {tempC !== null ? `${tempC}°C` : (isLoading ? '--' : 'N/A')}
                  </span>
                  <span className="text-xs font-semibold text-[#666666]">
                    {conditionText}
                  </span>
                </div>
                {feelsLike !== null && (
                  <div className="text-[10px] text-[#888888] mt-0.5 font-mono">
                    Feels like {feelsLike}°C • Rain: {rain24h} mm
                  </div>
                )}
              </div>
              <div className="p-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-[#16A34A] shadow-xs">
                <CloudSun className="w-6 h-6" />
              </div>
            </div>

            {/* Composite Risk Index Indicator */}
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#111111]">
                  <Gauge className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Risk Index ($H \times E \times V$)</span>
                </div>
                <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                  riskLevel === 'CRITICAL' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]' :
                  riskLevel === 'HIGH' ? 'bg-[#FFF7ED] text-[#EA580C] border-[#FDBA74]' :
                  riskLevel === 'MODERATE' ? 'bg-[#FEFCE8] text-[#CA8A04] border-[#FDE047]' :
                  'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                }`}>
                  {riskScore !== null ? `${riskScore}/100 • ${riskLevel}` : 'ANALYZING...'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    riskScore && riskScore > 65 ? 'bg-[#DC2626]' :
                    riskScore && riskScore > 35 ? 'bg-[#EAB308]' :
                    'bg-[#16A34A]'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, riskScore || 12))}%` }}
                />
              </div>

              {/* Formula factor readouts */}
              {hazardScore !== null && (
                <div className="flex items-center justify-between text-[10px] font-mono text-[#888888] pt-0.5">
                  <span>Hazard: {hazardScore}</span>
                  <span>Exposure: {exposureScore ?? 25}</span>
                  <span>Vulnerability: {vulnerabilityScore ?? 15}</span>
                </div>
              )}
            </div>

            {/* Metrics Mini-Grid */}
            {status === 'ERROR' && tempC === null ? (
              <div className="p-2.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-center space-y-1.5">
                <p className="text-xs text-[#DC2626] font-semibold">{error || 'Unable to load live weather data'}</p>
                <Button variant="secondary" size="sm" onClick={() => refresh(true)} className="mx-auto text-xs py-1">
                  Retry
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div className="bg-[#F8FAFC] border border-[#E5E5E5] p-2 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-[#888888]">
                    <Compass className="w-2.5 h-2.5" />
                    <span>Wind</span>
                  </div>
                  <span className="font-bold text-[#111111] text-[11px] font-mono block mt-0.5">
                    {windSpeed !== null ? `${windSpeed} km/h` : 'N/A'}
                  </span>
                  <span className="text-[9px] text-[#888888] font-mono">{windDir}</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E5E5E5] p-2 rounded-lg">
                  <span className="text-[10px] text-[#888888] block">Humidity</span>
                  <span className="font-bold text-[#111111] text-[11px] font-mono block mt-0.5">
                    {humidity !== null ? `${humidity}%` : 'N/A'}
                  </span>
                  <span className="text-[9px] text-[#888888]">RH</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E5E5E5] p-2 rounded-lg">
                  <span className="text-[10px] text-[#888888] block">Pressure</span>
                  <span className="font-bold text-[#111111] text-[11px] font-mono block mt-0.5">
                    {pressure !== null ? `${pressure} hPa` : 'N/A'}
                  </span>
                  <span className="text-[9px] text-[#888888]">MSL</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs py-1.5 shadow-xs"
                onClick={() => navigate('/risk-map')}
                icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                Analyze Risk
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs py-1.5 shadow-xs"
                onClick={() => navigate('/copilot')}
                icon={<Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />}
              >
                Ask AI Assistant
              </Button>
            </div>
          </div>
        )}

        {!showWeatherCard && (
          <button
            onClick={() => setShowWeatherCard(true)}
            className="absolute bottom-3.5 left-3 sm:left-16 z-20 pointer-events-auto bg-white/95 backdrop-blur-md border border-[#E5E5E5] px-3.5 py-2 rounded-xl shadow-lg text-xs font-bold text-[#111111] hover:bg-[#F8FAFC] flex items-center gap-2 cursor-pointer transition-all"
          >
            <CloudSun className="w-4 h-4 text-[#16A34A]" />
            <span>Open Intelligence HUD ({tempC !== null ? `${tempC}°C` : '--'})</span>
          </button>
        )}
      </div>
    </div>
  );
};

