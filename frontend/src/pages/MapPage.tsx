import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Bot, 
  LogOut, 
  Menu,
  X,
  Radio,
  Share2,
  FileText,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

import { MapLibreView } from '../components/map/MapLibreView';
import { TopSearchBar } from '../components/map/TopSearchBar';
import { LeftToolbar } from '../components/map/LeftToolbar';
import { BottomTimeline } from '../components/map/BottomTimeline';
import { RightLocationDrawer } from '../components/map/RightLocationDrawer';
import { LayerSelectorModal, type LayerState } from '../components/map/LayerSelectorModal';
import { DataStatusPanel } from '../components/map/DataStatusPanel';
import { CopilotDrawer } from '../components/map/CopilotDrawer';
import { InfrastructureDetailPanel } from '../components/map/InfrastructureDetailPanel';
import { MapLegend } from '../components/map/MapLegend';
import { LoginModal } from '../components/auth/LoginModal';

import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../context/LocationContext';
import { 
  fetchCurrentWeather, 
  fetchHourlyWeather, 
  fetchWeatherForecast, 
  fetchInfrastructureOSM, 
  fetchFloodData, 
  fetchElevationData, 
  fetchLandcoverData, 
  fetchCycloneTracks, 
  fetchDataSourcesStatus, 
  fetchCurrentRisk, 
  fetchSpatialWeatherGrid,
  fetchReverseGeocode,
  fetchDistrictBriefing,
  type RiskResult 
} from '../services/api';

import { SimulationOverlayPanel } from '../components/map/SimulationOverlayPanel';
import { InfrastructureOverlayPanel } from '../components/map/InfrastructureOverlayPanel';
import { AlertsOverlayPanel } from '../components/map/AlertsOverlayPanel';
import { DataSourcesOverlayPanel } from '../components/map/DataSourcesOverlayPanel';
import { SettingsOverlayPanel } from '../components/map/SettingsOverlayPanel';

import CycloneInfoCard from '../components/map/CycloneInfoCard';
import ForecastPointPopup from '../components/map/ForecastPointPopup';
import CyclonePlaybackControls from '../components/map/CyclonePlaybackControls';
import { type CycloneData, type CycloneForecastPoint } from '../services/api';

interface MapPageProps {
  defaultOverlay?: string;
}

export const MapPage: React.FC<MapPageProps> = ({ defaultOverlay }) => {
  const { user, logout } = useAuth();
  const { location: globalLocation } = useLocation();
  const [searchParams] = useSearchParams();

  // Location State (Synced with LocationContext or URL parameters)
  const paramLat = searchParams.get('lat');
  const paramLng = searchParams.get('lng');
  const paramName = searchParams.get('name');

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name?: string; admin1?: string; country?: string }>({
    lat: paramLat ? parseFloat(paramLat) : (globalLocation.latitude || 16.9891),
    lng: paramLng ? parseFloat(paramLng) : (globalLocation.longitude || 82.2475),
    name: paramName || globalLocation.city || 'Kakinada',
    admin1: globalLocation.state || 'Andhra Pradesh',
    country: globalLocation.country || 'India'
  });

  useEffect(() => {
    if (globalLocation) {
      setSelectedLocation({
        lat: globalLocation.latitude,
        lng: globalLocation.longitude,
        name: globalLocation.city,
        admin1: globalLocation.state,
        country: globalLocation.country
      });
    }
  }, [globalLocation.latitude, globalLocation.longitude]);

  // Timeline Hour Offset State (0 for NOW, 1-24 for forecast)
  const [selectedTimeStep, setSelectedTimeStep] = useState<number>(0);

  // Demo Mode Toggle State (Hackathon Isolation)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Centralized Active Overlay UX State (Zoom-Earth Concept)
  const [activeOverlay, setActiveOverlay] = useState<string | null>(defaultOverlay || 'wind');
  const [activeTab, setActiveTab] = useState<string | null>('overview');

  // Drawers & Modals
  const [isCopilotOpen, setIsCopilotOpen] = useState(defaultOverlay === 'copilot');
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [briefingModalText, setBriefingModalText] = useState<string | null>(null);
  const [loadingBriefingModal, setLoadingBriefingModal] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Map Navigation Method Refs
  const onZoomInRef = useRef<(() => void) | null>(null);
  const onZoomOutRef = useRef<(() => void) | null>(null);
  const onResetNorthRef = useRef<(() => void) | null>(null);

  // Map Layer Visibility States
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
    hospitals: true,
    shelters: true,
    schools: false,
    roads: true,
    bridges: true,
    buildings: false
  });
  const [overlayOpacity, setOverlayOpacity] = useState(0.75);

  // Backend Data States
  const [weatherData, setWeatherData] = useState<any>(null);
  const [spatialWeatherGeoJSON, setSpatialWeatherGeoJSON] = useState<any>(null);
  const [hourlyWeather, setHourlyWeather] = useState<any[]>([]);
  const [forecastDaily, setForecastDaily] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<RiskResult | null>(null);
  const [osmData, setOsmData] = useState<any>(null);
  const [floodGeoJSON, setFloodGeoJSON] = useState<any>(null);
  const [elevationData, setElevationData] = useState<any>(null);
  const [landcoverData, setLandcoverData] = useState<any>(null);
  const [cycloneData, setCycloneData] = useState<CycloneData | null>(null);
  const [dataSourcesStatus, setDataSourcesStatus] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [dataFetchError, setDataFetchError] = useState<string | null>(null);

  // Cyclone UI & Playback States
  const [showCycloneCard, setShowCycloneCard] = useState<boolean>(true);
  const [selectedForecastPoint, setSelectedForecastPoint] = useState<CycloneForecastPoint | null>(null);
  const [isPlayingTrack, setIsPlayingTrack] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Sync activeOverlay selection with MapLibre layerState
  const handleSelectOverlay = (modeId: string) => {
    setActiveOverlay(modeId);
    setLayerState(prev => ({
      ...prev,
      satelliteImagery: modeId === 'satellite',
      wind: modeId === 'wind',
      rainfall: modeId === 'rain',
      temperature: modeId === 'temperature',
      pressure: modeId === 'pressure',
      cycloneTrack: modeId === 'cyclone' || prev.cycloneTrack,
      floodIndicator: modeId === 'flood' || modeId === 'surge',
      hospitals: modeId === 'infrastructure' || prev.hospitals,
      shelters: modeId === 'infrastructure' || prev.shelters,
      riskZones: modeId === 'risk' || prev.riskZones
    }));
  };

  // Cyclone Track Playback Interpolation Loop
  useEffect(() => {
    if (!isPlayingTrack || !cycloneData?.forecastPoints || cycloneData.forecastPoints.length === 0) return;
    const timeSteps = cycloneData.forecastPoints.map(p => p.offsetHours);
    const intervalMs = 2000 / playbackSpeed;

    const timer = setInterval(() => {
      setSelectedTimeStep(prev => {
        const idx = timeSteps.indexOf(prev);
        if (idx === -1 || idx === timeSteps.length - 1) {
          return timeSteps[0];
        }
        return timeSteps[idx + 1];
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlayingTrack, playbackSpeed, cycloneData?.forecastPoints]);

  // Periodic Auto-refresh of Live Cyclone Data (5 mins)
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      fetchCycloneTracks(selectedLocation.lat, selectedLocation.lng, isDemoMode)
        .then(data => setCycloneData(data))
        .catch(err => console.error("Periodic cyclone refresh error", err));
    }, 300000);

    return () => clearInterval(refreshTimer);
  }, [selectedLocation.lat, selectedLocation.lng, isDemoMode]);

  // Load dataset when LOCATION or DEMO MODE changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingData(true);
    setDataFetchError(null);

    async function loadLocationData() {
      const { lat, lng } = selectedLocation;
      try {
        const [
          weather,
          hourly,
          daily,
          risk,
          cyclone
        ] = await Promise.all([
          fetchCurrentWeather(lat, lng),
          fetchHourlyWeather(lat, lng),
          fetchWeatherForecast(lat, lng),
          fetchCurrentRisk(lat, lng),
          fetchCycloneTracks(lat, lng, isDemoMode)
        ]);

        if (isMounted) {
          setWeatherData(weather);
          setHourlyWeather(hourly?.hourly || []);
          setForecastDaily(daily?.daily || []);
          setRiskData(risk);
          setCycloneData(cyclone);
          setIsLoadingData(false);

          if (!weather.available) {
            setDataFetchError("Weather data service connection interrupted. Showing last available baseline.");
          }
        }

        // Secondary background GIS layers
        Promise.all([
          fetchInfrastructureOSM(lat, lng),
          fetchFloodData(lat, lng),
          fetchElevationData(lat, lng),
          fetchLandcoverData(lat, lng),
          fetchDataSourcesStatus(lat, lng)
        ]).then(([osm, flood, elevation, landcover, dsStatus]) => {
          if (isMounted) {
            setOsmData(osm);
            setFloodGeoJSON(flood?.geojson || null);
            setElevationData(elevation);
            setLandcoverData(landcover);
            setDataSourcesStatus(dsStatus);
          }
        }).catch(err => console.warn("Secondary background layer loading warning:", err));

      } catch (err: any) {
        console.error("Critical weather data loading error:", err);
        if (isMounted) {
          setIsLoadingData(false);
          setDataFetchError(`API Connection Failure: ${err?.message || err}`);
        }
      }
    }

    loadLocationData();
    return () => { isMounted = false; };
  }, [selectedLocation, isDemoMode]);

  // Load Forecast Spatial Grid when TIMELINE SLIDER changes
  useEffect(() => {
    let isMounted = true;
    async function loadForecastGrid() {
      const { lat, lng } = selectedLocation;
      const spatialGrid = await fetchSpatialWeatherGrid(lat, lng, selectedTimeStep);
      if (isMounted && spatialGrid?.geojson) {
        setSpatialWeatherGeoJSON(spatialGrid.geojson);
      }
    }
    loadForecastGrid();
    return () => { isMounted = false; };
  }, [selectedLocation.lat, selectedLocation.lng, selectedTimeStep]);

  const handleMapClick = async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng, name: 'Fetching location details...' });
    setActiveTab('overview');

    const geocoded = await fetchReverseGeocode(lat, lng);
    setSelectedLocation({
      lat,
      lng,
      name: geocoded.name || geocoded.display_name,
      admin1: geocoded.state || geocoded.district || 'Coastal District',
      country: geocoded.country || 'India'
    });
  };

  const handleToggleLayer = (key: keyof LayerState) => {
    setLayerState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectLocationFromSearch = (loc: { lat: number; lng: number; name: string; country?: string; admin1?: string }) => {
    const lat = typeof loc.lat === 'number' && !isNaN(loc.lat) ? loc.lat : 16.9891;
    const lng = typeof loc.lng === 'number' && !isNaN(loc.lng) ? loc.lng : 82.2475;
    setSelectedLocation({
      lat,
      lng,
      name: loc.name || 'Selected Location',
      country: loc.country || 'India',
      admin1: loc.admin1 || ''
    });
    setActiveTab('overview');
  };

  const handleMyLocation = () => {
    if (globalLocation.latitude && globalLocation.longitude) {
      setSelectedLocation({
        lat: globalLocation.latitude,
        lng: globalLocation.longitude,
        name: globalLocation.city || 'My Location'
      });
    } else {
      setSelectedLocation({ lat: 16.9891, lng: 82.2475, name: 'Kakinada', admin1: 'Andhra Pradesh', country: 'India' });
    }
  };

  const handleAskCopilot = (prompt: string) => {
    setCopilotInitialPrompt(prompt);
    setIsCopilotOpen(true);
  };

  const handleSaveLocation = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setIsSaved(!isSaved);
  };

  const handleGenerateModalBriefing = async () => {
    setLoadingBriefingModal(true);
    const res = await fetchDistrictBriefing(selectedLocation.name || 'Kakinada District', selectedLocation.lat, selectedLocation.lng);
    if (res && res.briefing) {
      setBriefingModalText(res.briefing);
    }
    setLoadingBriefingModal(false);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/map?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}&name=${encodeURIComponent(selectedLocation.name || '')}`;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden text-slate-100 bg-navy-950 font-sans select-none flex flex-col">
      {/* ================= TOP FLOATING BAR ================= */}
      <header className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        {/* Left Branding Logo */}
        <div className="pointer-events-auto flex items-center space-x-2 sm:space-x-3">
          <Link
            to="/map"
            className="flex items-center space-x-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-2xl hover:border-cyan-500/50 transition-all group"
          >
            <img
              src="/images/logo.png"
              alt="CycloneShield AI"
              className="w-7 h-7 rounded-full object-cover group-hover:scale-105 transition-transform border border-cyan-500/40"
            />
            <div>
              <span className="font-extrabold text-sm text-white tracking-tight block leading-none">
                CYCLONESHIELD <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 block tracking-wider uppercase mt-0.5">
                DISASTER RISK PLATFORM
              </span>
            </div>
          </Link>

          {/* Data Status Indicator */}
          <button
            onClick={() => setActiveTab(activeTab === 'dataStatus' ? null : 'dataStatus')}
            className="pointer-events-auto hidden lg:flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-2xl shadow-2xl text-xs hover:border-cyan-500/40 transition-all"
          >
            <span className={`w-2 h-2 rounded-full ${dataFetchError ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="font-bold text-slate-200">{dataFetchError ? 'API WARNING' : 'LIVE DATA'}</span>
          </button>

          {/* Demo Mode Toggle */}
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`pointer-events-auto px-3 py-2 rounded-2xl font-bold text-xs border shadow-2xl transition-all flex items-center space-x-1.5 ${
              isDemoMode
                ? 'bg-amber-600/90 hover:bg-amber-500 text-white border-amber-400 animate-pulse'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isDemoMode ? 'DEMO MODE' : 'Demo Mode'}</span>
          </button>
        </div>

        {/* Center Search Bar */}
        <div className="pointer-events-auto hidden md:block flex-1 max-w-md mx-4">
          <TopSearchBar
            onSelectLocation={handleSelectLocationFromSearch}
            onMyLocationClick={handleMyLocation}
          />
        </div>

        {/* Right Nav Controls & Actions */}
        <div className="pointer-events-auto flex items-center space-x-2">
          <button
            onClick={handleGenerateModalBriefing}
            disabled={loadingBriefingModal}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700/80 shadow-2xl transition-all disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline">{loadingBriefingModal ? 'Generating...' : 'Emergency Brief'}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-2xl transition-all relative"
            title="Share Current Map Location"
          >
            <Share2 className="w-4 h-4" />
            {shareCopied && (
              <span className="absolute top-full right-0 mt-2 px-2.5 py-1 bg-cyan-600 text-white font-mono text-[10px] font-bold rounded-lg shadow-xl whitespace-nowrap">
                Link Copied!
              </span>
            )}
          </button>

          <button
            onClick={() => setIsCopilotOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-2xl shadow-2xl">
              <span className="text-xs font-bold text-slate-200 px-2.5 hidden sm:inline">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700/80 shadow-2xl transition-all"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-200"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Search & Menu */}
      <div className="md:hidden absolute top-16 left-3 right-3 z-30 space-y-2 pointer-events-auto">
        <TopSearchBar
          onSelectLocation={handleSelectLocationFromSearch}
          onMyLocationClick={handleMyLocation}
        />

        {mobileMenuOpen && (
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-3 rounded-2xl shadow-2xl space-y-2 text-xs">
            <button onClick={() => { setActiveOverlay(null); setMobileMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-xl bg-cyan-950/60 text-cyan-300 font-bold">
              Risk Map Workspace
            </button>
            <button onClick={() => { setActiveOverlay('simulation'); setMobileMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-800 text-slate-200">
              Scenario Simulation
            </button>
            <button onClick={() => { setActiveOverlay('infrastructure'); setMobileMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-800 text-slate-200">
              Infrastructure Risk GIS
            </button>
            <button onClick={() => { setActiveOverlay('alerts'); setMobileMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-800 text-slate-200">
              Emergency Alerts
            </button>
            <button onClick={() => { setActiveOverlay('settings'); setMobileMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-800 text-slate-200">
              Settings
            </button>
          </div>
        )}
      </div>

      {/* ================= MAIN FULL-SCREEN MAP CANVAS ================= */}
      <main className="relative w-full h-full">
        {/* Floating Active Cyclone Banner Overlay */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          {cycloneData?.hasActiveCyclone ? (
            <div className="bg-red-950/90 backdrop-blur-md border border-red-700/80 px-4 py-2 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <div>
                <span className="font-extrabold text-white block">ACTIVE CYCLONE DETECTED</span>
                <span className="text-red-300 font-mono text-[11px]">{cycloneData.message}</span>
              </div>
            </div>
          ) : cycloneData?.status === 'UNAVAILABLE' ? (
            <div className="bg-amber-950/90 backdrop-blur-md border border-amber-700/80 px-4 py-1.5 rounded-full shadow-xl flex items-center space-x-2 text-xs text-amber-300 font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>CYCLONE DATA UNAVAILABLE</span>
            </div>
          ) : (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-1.5 rounded-full shadow-xl flex items-center space-x-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-200">NO ACTIVE CYCLONE DETECTED</span>
            </div>
          )}
        </div>

        {/* API Warning Toast if API is down */}
        {dataFetchError && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 pointer-events-auto bg-amber-900/90 border border-amber-600 px-3.5 py-1.5 rounded-xl shadow-2xl text-amber-200 text-xs flex items-center space-x-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{dataFetchError}</span>
            <button
              onClick={() => setSelectedLocation({ ...selectedLocation })}
              className="p-1 hover:bg-amber-800 rounded text-white"
              title="Retry Request"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <MapLibreView
          activeOverlay={activeOverlay}
          layers={layerState}
          overlayOpacity={overlayOpacity}
          selectedLocation={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          onLocationSelect={handleMapClick}
          infrastructureFeatures={osmData?.features || []}
          floodGeoJSON={floodGeoJSON}
          cycloneData={cycloneData}
          spatialWeatherGeoJSON={spatialWeatherGeoJSON}
          selectedTimeStep={selectedTimeStep}
          weatherData={weatherData}
          onSelectFeature={(feat: any) => setSelectedAsset(feat)}
          onSelectCycloneCenter={() => setShowCycloneCard(true)}
          onSelectForecastPoint={(pt: CycloneForecastPoint) => setSelectedForecastPoint(pt)}
          onZoomInRef={onZoomInRef}
          onZoomOutRef={onZoomOutRef}
          onResetNorthRef={onResetNorthRef}
        />

        {/* Floating Active Overlay Map Legend */}
        {activeOverlay && (
          <div className={`absolute top-20 transition-all duration-300 z-20 pointer-events-auto ${
            activeTab === 'overview' ? 'right-4 sm:right-[410px]' : 'right-4'
          }`}>
            <MapLegend
              activeOverlay={activeOverlay}
              retrievedAt={weatherData?.retrievedAt || 'Just now'}
              sourceProvider={weatherData?.source || 'Open-Meteo & GDACS'}
            />
          </div>
        )}

        {/* Floating Cyclone Info Card Overlay */}
        {cycloneData?.hasActiveCyclone && showCycloneCard && (
          <div className={`absolute top-44 transition-all duration-300 z-30 pointer-events-auto ${
            activeTab === 'overview' ? 'right-4 sm:right-[410px]' : 'right-4'
          }`}>
            <CycloneInfoCard
              cycloneData={cycloneData}
              onClose={() => setShowCycloneCard(false)}
              onFlyToStorm={() => {
                if (cycloneData.storm?.currentPosition) {
                  setSelectedLocation({
                    lat: cycloneData.storm.currentPosition.lat,
                    lng: cycloneData.storm.currentPosition.lon,
                    name: cycloneData.storm.name
                  });
                }
              }}
            />
          </div>
        )}

        {/* Floating Forecast Point Popup Overlay */}
        {selectedForecastPoint && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <ForecastPointPopup
              point={selectedForecastPoint}
              stormName={cycloneData?.storm?.name || 'Active Cyclonic Storm'}
              onClose={() => setSelectedForecastPoint(null)}
            />
          </div>
        )}

        {/* ================= LEFT FLOATING TOOLBAR ================= */}
        <div className="absolute top-20 left-4 z-20">
          <LeftToolbar
            activeOverlay={activeOverlay}
            onSelectOverlay={handleSelectOverlay}
            activeTab={activeTab}
            onToggleTab={(tab) => setActiveTab(activeTab === tab ? null : tab)}
            onZoomIn={() => onZoomInRef.current?.()}
            onZoomOut={() => onZoomOutRef.current?.()}
            onResetNorth={() => onResetNorthRef.current?.()}
            onMyLocation={handleMyLocation}
            isMeasuringDistance={false}
            onToggleMeasureDistance={() => {}}
            isMeasuringArea={false}
            onToggleMeasureArea={() => {}}
          />
        </div>

        {/* Layer Selector Modal */}
        {activeTab === 'layers' && (
          <div className="absolute top-20 left-16 z-30">
            <LayerSelectorModal
              layers={layerState}
              onToggleLayer={handleToggleLayer}
              opacity={overlayOpacity}
              onOpacityChange={setOverlayOpacity}
              onClose={() => setActiveTab(null)}
            />
          </div>
        )}

        {/* Data Status Panel */}
        {activeTab === 'dataStatus' && (
          <div className="absolute top-20 left-16 z-30">
            <DataStatusPanel
              statusList={dataSourcesStatus}
              onClose={() => setActiveTab(null)}
            />
          </div>
        )}

        {/* Simulation Overlay Panel */}
        {activeOverlay === 'simulation' && (
          <div className="absolute top-20 left-16 z-30">
            <SimulationOverlayPanel
              centerLat={selectedLocation.lat}
              centerLon={selectedLocation.lng}
              onClose={() => setActiveOverlay(null)}
            />
          </div>
        )}

        {/* Infrastructure Overlay Panel */}
        {activeOverlay === 'infrastructure' && (
          <div className="absolute top-20 left-16 z-30">
            <InfrastructureOverlayPanel
              infrastructureFeatures={osmData?.features || []}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              onClose={() => setActiveOverlay(null)}
            />
          </div>
        )}

        {/* Alerts Overlay Panel */}
        {activeOverlay === 'alerts' && (
          <div className="absolute top-20 left-16 z-30">
            <AlertsOverlayPanel
              onCenterLocation={(lat, lng, name) => {
                setSelectedLocation({ lat, lng, name });
                setActiveTab('overview');
                setActiveOverlay(null);
              }}
              onClose={() => setActiveOverlay(null)}
            />
          </div>
        )}

        {/* Data Sources Overlay Panel */}
        {activeOverlay === 'dataSources' && (
          <div className="absolute top-20 left-16 z-30">
            <DataSourcesOverlayPanel
              statusList={dataSourcesStatus}
              onClose={() => setActiveOverlay(null)}
            />
          </div>
        )}

        {/* Settings Overlay Panel */}
        {activeOverlay === 'settings' && (
          <div className="absolute top-20 left-16 z-30">
            <SettingsOverlayPanel
              onClose={() => setActiveOverlay(null)}
            />
          </div>
        )}

        {/* Right Location Details Drawer */}
        {activeTab === 'overview' && (
          <div className="absolute top-0 right-0 bottom-0 z-30">
            <RightLocationDrawer
              location={selectedLocation}
              riskData={riskData}
              weatherData={weatherData}
              hourlyWeather={hourlyWeather}
              forecastDaily={forecastDaily}
              elevationData={elevationData}
              landcoverData={landcoverData}
              infrastructureCount={osmData?.features?.length || 0}
              floodData={floodGeoJSON}
              isLoading={isLoadingData}
              onClose={() => setActiveTab(null)}
              onAskCopilot={handleAskCopilot}
              onSaveLocation={handleSaveLocation}
              isSaved={isSaved}
            />
          </div>
        )}

        {/* Infrastructure Detail Panel */}
        {selectedAsset && (
          <InfrastructureDetailPanel
            asset={{
              id: selectedAsset.properties?.id || 'asset-1',
              name: selectedAsset.properties?.name || 'Infrastructure Asset',
              category: selectedAsset.properties?.category || 'Hospital',
              location: `${selectedLocation.lat.toFixed(2)}°, ${selectedLocation.lng.toFixed(2)}°`,
              coordinates: selectedAsset.geometry?.coordinates || [selectedLocation.lng, selectedLocation.lat]
            }}
            onClose={() => setSelectedAsset(null)}
          />
        )}

        {/* ================= BOTTOM TIMELINE BAR & PLAYBACK CONTROLS ================= */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-16 sm:right-16 z-20 pointer-events-auto flex flex-col space-y-2">
          {cycloneData?.hasActiveCyclone && layerState.cycloneTrack && (
            <div className="self-end">
              <CyclonePlaybackControls
                isPlaying={isPlayingTrack}
                playbackSpeed={playbackSpeed}
                onTogglePlay={() => setIsPlayingTrack(!isPlayingTrack)}
                onReset={() => {
                  setIsPlayingTrack(false);
                  setSelectedTimeStep(0);
                }}
                onChangeSpeed={(spd) => setPlaybackSpeed(spd)}
              />
            </div>
          )}
          <div className="w-full">
            <BottomTimeline
              onTimeChange={(step) => setSelectedTimeStep(step.hourOffset)}
            />
          </div>
        </div>
      </main>

      {/* Emergency Briefing Modal */}
      {briefingModalText && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-2xl w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                <FileText className="w-5 h-5" />
                <h3 className="text-base text-white">Emergency Operational Briefing</h3>
              </div>
              <button onClick={() => setBriefingModalText(null)} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto font-sans text-xs text-slate-200 leading-relaxed space-y-3 whitespace-pre-wrap p-2 bg-slate-950/60 rounded-xl border border-slate-800">
              {briefingModalText}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(briefingModalText);
                  alert('Emergency Briefing copied to clipboard!');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
              >
                Copy Briefing
              </button>
              <button
                onClick={() => setBriefingModalText(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Copilot Drawer */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        initialPrompt={copilotInitialPrompt}
        contextData={{
          location: selectedLocation.name,
          coordinates: { lat: selectedLocation.lat, lon: selectedLocation.lng },
          riskScore: riskData?.risk_score,
          riskLevel: riskData?.risk_level,
          weather: weatherData?.values
        }}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};
