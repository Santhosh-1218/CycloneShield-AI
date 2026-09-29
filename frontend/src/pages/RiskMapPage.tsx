import React, { useState, useEffect } from 'react';
import { MapLibreView } from '../components/map/MapLibreView';
import { TopSearchBar } from '../components/map/TopSearchBar';
import { LayerControls, type MapLayersState } from '../components/map/LayerControls';
import { InfrastructureDetailPanel } from '../components/map/InfrastructureDetailPanel';
import { NaturalLanguageQueryBar } from '../components/map/NaturalLanguageQueryBar';
import CycloneInfoCard from '../components/map/CycloneInfoCard';
import { LoginModal } from '../components/auth/LoginModal';
import { useLocation } from '../context/LocationContext';
import { fetchInfrastructureOSM, fetchCurrentWeather, fetchCycloneTracks, fetchSpatialWeatherGrid, fetchFloodData, type CycloneData } from '../services/api';

export const RiskMapPage: React.FC = () => {
  const { location } = useLocation();

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name?: string }>({
    lat: location.latitude || 16.5062,
    lng: location.longitude || 80.6480,
    name: 'Vijayawada'
  });

  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [weatherInfo, setWeatherInfo] = useState<any>(null);
  const [osmData, setOsmData] = useState<any>(null);
  const [cycloneData, setCycloneData] = useState<CycloneData | null>(null);
  const [spatialWeatherGeoJSON, setSpatialWeatherGeoJSON] = useState<any>(null);
  const [floodGeoJSON, setFloodGeoJSON] = useState<any>(null);
  const [showCycloneCard, setShowCycloneCard] = useState(true);

  const [layers, setLayers] = useState<MapLayersState>({
    riskLevel: true,
    cycloneTrack: true,
    rainfall: true,
    wind: true,
    population: true,
    hospitals: true,
    shelters: true,
    roads: false,
    floodIndicator: true
  });

  useEffect(() => {
    if (location.latitude && location.longitude) {
      setSelectedLocation({ lat: location.latitude, lng: location.longitude, name: location.city || 'Current Location' });
    }
  }, [location.latitude, location.longitude, location.city]);

  // Load weather, infrastructure, spatial weather grid, flood and cyclone tracks asynchronously
  useEffect(() => {
    let isMounted = true;

    async function loadRealData() {
      try {
        // Step 1: Load weather, cyclone tracks, spatial grid & flood data (~50-100ms)
        const [weather, cyclone, spatialGrid, flood] = await Promise.all([
          fetchCurrentWeather(selectedLocation.lat, selectedLocation.lng),
          fetchCycloneTracks(selectedLocation.lat, selectedLocation.lng, false),
          fetchSpatialWeatherGrid(selectedLocation.lat, selectedLocation.lng, 0),
          fetchFloodData(selectedLocation.lat, selectedLocation.lng)
        ]);

        if (isMounted) {
          setWeatherInfo(weather);
          setCycloneData(cyclone);
          if (spatialGrid?.geojson) setSpatialWeatherGeoJSON(spatialGrid.geojson);
          if (flood?.geojson) setFloodGeoJSON(flood.geojson);
        }

        // Step 2: Load OSM infrastructure asynchronously in background
        fetchInfrastructureOSM(selectedLocation.lat, selectedLocation.lng)
          .then(osm => {
            if (isMounted) setOsmData(osm);
          })
          .catch(err => console.warn("OSM load error:", err));

      } catch (err) {
        console.error("Data loading error:", err);
      }
    }

    loadRealData();
    return () => { isMounted = false; };
  }, [selectedLocation.lat, selectedLocation.lng]);

  const handleToggleLayer = (key: keyof MapLayersState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectFeature = (feat: any) => {
    if (feat?.properties?.id?.startsWith('osm-') || feat?.category) {
      setSelectedAsset({
        id: feat.properties?.id || feat.id || 'asset-1',
        name: feat.properties?.name || feat.name || 'Infrastructure Asset',
        category: feat.properties?.category || feat.category || 'Hospital',
        location: feat.properties?.location || `${selectedLocation.lat.toFixed(2)}°, ${selectedLocation.lng.toFixed(2)}°`,
        coordinates: feat.geometry?.coordinates || [selectedLocation.lng, selectedLocation.lat]
      });
    }
  };

  const handleFilterParsed = (intent: any) => {
    if (intent.target_type === 'hospital') {
      setLayers((prev) => ({ ...prev, hospitals: true, shelters: false, roads: false }));
    } else if (intent.target_type === 'shelter') {
      setLayers((prev) => ({ ...prev, hospitals: false, shelters: true, roads: false }));
    }
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden text-slate-100 bg-slate-950">
      {/* Top Primary Geographic Search Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4 pointer-events-auto">
        <TopSearchBar
          onSelectLocation={(loc) => {
            setSelectedLocation({
              lat: loc.lat,
              lng: loc.lng,
              name: loc.name
            });
          }}
          onMyLocationClick={() => {
            if (location.latitude && location.longitude) {
              setSelectedLocation({
                lat: location.latitude,
                lng: location.longitude,
                name: 'Current Location'
              });
            }
          }}
        />
      </div>

      {/* Floating Active Cyclone Banner or Info Card */}
      {cycloneData?.hasActiveCyclone && showCycloneCard && (
        <div className="absolute top-20 right-4 z-20 pointer-events-auto">
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

      {/* Natural Language Query Bar (Secondary AI Filter) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-full max-w-xl px-4">
        <NaturalLanguageQueryBar onFilterParsed={handleFilterParsed} />
      </div>

      {/* Left Layer Controls Panel */}
      <div className="absolute top-20 left-4 z-20 w-64 pointer-events-auto">
        <LayerControls layers={layers} onToggleLayer={handleToggleLayer} />

        {/* Legend Box Bottom Left */}
        <div className="mt-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-2xl shadow-xl space-y-2 text-xs">
          <span className="font-bold text-slate-300 block">Risk Level</span>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold">
            <span className="flex items-center text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" /> Low</span>
            <span className="flex items-center text-yellow-400"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-1.5" /> Medium</span>
            <span className="flex items-center text-orange-400"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-1.5" /> High</span>
            <span className="flex items-center text-red-500"><span className="w-2.5 h-2.5 rounded-full bg-red-600 mr-1.5" /> Critical</span>
          </div>
        </div>
      </div>

      {/* MapLibre Canvas View */}
      <MapLibreView
        layers={layers}
        selectedLocation={selectedLocation}
        onLocationSelect={(lat: number, lng: number) => setSelectedLocation({ lat, lng })}
        infrastructureFeatures={osmData?.features || []}
        weatherData={weatherInfo}
        cycloneData={cycloneData}
        spatialWeatherGeoJSON={spatialWeatherGeoJSON}
        floodGeoJSON={floodGeoJSON}
        onSelectFeature={handleSelectFeature}
        onSelectCycloneCenter={() => setShowCycloneCard(true)}
      />

      {/* Infrastructure Detail Modal Panel */}
      {selectedAsset && (
        <InfrastructureDetailPanel
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}

      {/* Login Required Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};
