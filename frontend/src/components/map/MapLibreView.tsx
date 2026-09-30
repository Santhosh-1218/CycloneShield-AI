import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DEFAULT_MAP_PROVIDER, MAP_PROVIDERS } from '../../services/mapService';
import type { CycloneData, CycloneForecastPoint } from '../../services/api';

interface MapLibreViewProps {
  activeOverlay?: string | null;
  layers?: Record<string, any>;
  overlayOpacity?: number;
  selectedLocation: { lat: number; lng: number };
  onLocationSelect?: (lat: number, lng: number) => void;
  infrastructureFeatures?: any[];
  floodGeoJSON?: any;
  cycloneData?: CycloneData | null;
  spatialWeatherGeoJSON?: any;
  selectedTimeStep?: number;
  weatherData?: any;
  onSelectFeature?: (feature: any) => void;
  onSelectCycloneCenter?: () => void;
  onSelectForecastPoint?: (pt: CycloneForecastPoint) => void;
  onZoomInRef?: React.MutableRefObject<(() => void) | null>;
  onZoomOutRef?: React.MutableRefObject<(() => void) | null>;
  onResetNorthRef?: React.MutableRefObject<(() => void) | null>;
}

export const MapLibreView: React.FC<MapLibreViewProps> = ({
  activeOverlay,
  layers = {},
  overlayOpacity = 0.7,
  selectedLocation,
  onLocationSelect = () => {},
  infrastructureFeatures = [],
  floodGeoJSON,
  cycloneData,
  spatialWeatherGeoJSON,
  selectedTimeStep = 0,
  weatherData: _weatherData,
  onSelectFeature,
  onSelectCycloneCenter,
  onSelectForecastPoint,
  onZoomInRef,
  onZoomOutRef,
  onResetNorthRef
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const locationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const cycloneMarkerRef = useRef<maplibregl.Marker | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInitError, setMapInitError] = useState<string | null>(null);
  const [fallbackActive, setFallbackActive] = useState(false);

  // Bind zoom & navigation refs for parent toolbar
  useEffect(() => {
    if (onZoomInRef) onZoomInRef.current = () => mapRef.current?.zoomIn();
    if (onZoomOutRef) onZoomOutRef.current = () => mapRef.current?.zoomOut();
    if (onResetNorthRef) onResetNorthRef.current = () => {
      if (mapRef.current) {
        mapRef.current.resetNorthPitch();
        mapRef.current.flyTo({ center: [selectedLocation.lng, selectedLocation.lat], zoom: 7 });
      }
    };
  }, [onZoomInRef, onZoomOutRef, onResetNorthRef, selectedLocation]);

  // Initialize MapLibre GL instance safely
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const initialStyle = DEFAULT_MAP_PROVIDER.styleUrl;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: initialStyle,
        center: [selectedLocation?.lng ?? 82.2475, selectedLocation?.lat ?? 16.9891],
        zoom: 6,
        minZoom: 2.5,
        maxZoom: 18,
        renderWorldCopies: true,
        attributionControl: false
      });

      map.addControl(
        new maplibregl.AttributionControl({
          compact: false,
          customAttribution: DEFAULT_MAP_PROVIDER.attribution
        }),
        'bottom-right'
      );

      map.on('error', (e: any) => {
        if (!mapContainerRef.current) return;
        console.warn("MapLibre runtime notice:", e);
        if (e && e.error && e.error.message) {
          const msg = e.error.message.toLowerCase();
          if (msg.includes('tile') || msg.includes('403') || msg.includes('401')) {
            if (!fallbackActive) {
              setFallbackActive(true);
              map.setStyle(MAP_PROVIDERS.osmStandard.styleUrl);
            }
          }
        }
      });

      map.on('load', () => {
        if (!mapContainerRef.current) return;
        setMapLoaded(true);
        setMapInitError(null);
        map.resize();

        // 1. Esri Satellite Raster Source & Layer (for Satellite Mode)
        map.addSource('satellite-imagery-src', {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });

        map.addLayer({
          id: 'satellite-imagery-layer',
          type: 'raster',
          source: 'satellite-imagery-src',
          layout: { visibility: 'none' },
          paint: { 'raster-opacity': 1.0 }
        });

        // 2. Cyclone Data Sources & Layers
        map.addSource('cyclone-center-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.addSource('cyclone-observed-track-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.addSource('cyclone-forecast-track-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.addSource('cyclone-forecast-points-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.addSource('cyclone-warning-polygon-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });

        // Warning Polygons
        map.addLayer({
          id: 'cyclone-warning-polygon-fill',
          type: 'fill',
          source: 'cyclone-warning-polygon-source',
          paint: {
            'fill-color': ['coalesce', ['get', 'fillColor'], '#f59e0b'],
            'fill-opacity': 0.2
          }
        });
        map.addLayer({
          id: 'cyclone-warning-polygon-stroke',
          type: 'line',
          source: 'cyclone-warning-polygon-source',
          paint: {
            'line-color': '#f59e0b',
            'line-width': 1.5,
            'line-dasharray': [3, 2]
          }
        });

        // Observed Track Glow
        map.addLayer({
          id: 'cyclone-track-glow',
          type: 'line',
          source: 'cyclone-observed-track-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#ef4444',
            'line-width': 10,
            'line-blur': 4,
            'line-opacity': 0.4
          }
        });

        // Observed Track Solid Line
        map.addLayer({
          id: 'cyclone-observed-track-layer',
          type: 'line',
          source: 'cyclone-observed-track-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#ef4444',
            'line-width': 5
          }
        });

        // Forecast Track Dashed Line
        map.addLayer({
          id: 'cyclone-forecast-track-layer',
          type: 'line',
          source: 'cyclone-forecast-track-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#f97316',
            'line-width': 4,
            'line-dasharray': [2, 1]
          }
        });

        // Forecast Points Circles
        map.addLayer({
          id: 'cyclone-points-circles',
          type: 'circle',
          source: 'cyclone-forecast-points-source',
          paint: {
            'circle-radius': 7,
            'circle-color': '#f59e0b',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Forecast Points Labels
        map.addLayer({
          id: 'cyclone-points-labels',
          type: 'symbol',
          source: 'cyclone-forecast-points-source',
          layout: {
            'text-field': ['coalesce', ['get', 'timeLabel'], ''],
            'text-size': 11,
            'text-offset': [0, 1.4],
            'text-anchor': 'top'
          },
          paint: {
            'text-color': '#fde68a',
            'text-halo-color': '#0f172a',
            'text-halo-width': 2
          }
        });

        // 3. Spatial Weather Fields (Open-Meteo Grid)
        map.addSource('spatial-weather-src', {
          type: 'geojson',
          data: spatialWeatherGeoJSON || { type: 'FeatureCollection', features: [] }
        });

        // Spatial Rain Heatmap Layer
        map.addLayer({
          id: 'spatial-rain-heatmap',
          type: 'heatmap',
          source: 'spatial-weather-src',
          paint: {
            'heatmap-weight': [
              'interpolate', ['linear'], ['coalesce', ['get', 'rainfall'], 0],
              0, 0, 2, 0.3, 10, 0.6, 30, 0.9, 70, 1.0
            ],
            'heatmap-intensity': 1.2,
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0, 0, 0, 0)',
              0.2, 'rgba(6, 182, 212, 0.4)',
              0.4, 'rgba(37, 99, 235, 0.6)',
              0.7, 'rgba(147, 51, 234, 0.8)',
              1.0, 'rgba(239, 68, 68, 0.9)'
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 4, 60, 8, 140],
            'heatmap-opacity': overlayOpacity * 0.75
          }
        });

        // Spatial Temperature Heatmap Layer (Zoom-Earth Palette)
        map.addLayer({
          id: 'spatial-temp-heatmap',
          type: 'heatmap',
          source: 'spatial-weather-src',
          paint: {
            'heatmap-weight': [
              'interpolate', ['linear'], ['coalesce', ['get', 'temperature'], 20],
              0, 0.05, 10, 0.25, 20, 0.5, 30, 0.8, 40, 1.0
            ],
            'heatmap-intensity': 1.3,
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0,0,0,0)',
              0.15, 'rgba(124, 58, 237, 0.65)',
              0.30, 'rgba(37, 99, 235, 0.70)',
              0.45, 'rgba(16, 185, 129, 0.75)',
              0.60, 'rgba(234, 179, 8, 0.80)',
              0.80, 'rgba(249, 115, 22, 0.85)',
              1.00, 'rgba(239, 68, 68, 0.90)'
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 3, 90, 6, 170, 9, 280],
            'heatmap-opacity': overlayOpacity * 0.8
          }
        });

        // Spatial Temperature Symbol Text & City Badges
        map.addLayer({
          id: 'spatial-temp-labels',
          type: 'symbol',
          source: 'spatial-weather-src',
          layout: {
            'text-field': [
              'case',
              ['has', 'cityName'],
              ['concat', ['get', 'cityName'], '\n', ['to-string', ['round', ['coalesce', ['get', 'temperature'], 25]]], '°'],
              ['concat', ['to-string', ['round', ['coalesce', ['get', 'temperature'], 25]]], '°']
            ],
            'text-size': ['case', ['has', 'cityName'], 11, 10],
            'text-anchor': 'center',
            'text-allow-overlap': false
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#0f172a',
            'text-halo-width': 2.5
          }
        });

        // Spatial Pressure Heatmap Layer
        map.addLayer({
          id: 'spatial-pressure-heatmap',
          type: 'heatmap',
          source: 'spatial-weather-src',
          paint: {
            'heatmap-weight': [
              'interpolate', ['linear'], ['coalesce', ['get', 'surfacePressure'], 1013],
              970, 1.0, 995, 0.7, 1010, 0.3, 1030, 0.0
            ],
            'heatmap-intensity': 1.0,
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0,0,0,0)',
              0.3, 'rgba(16, 185, 129, 0.4)',
              0.6, 'rgba(6, 182, 212, 0.6)',
              0.8, 'rgba(147, 51, 234, 0.8)',
              1.0, 'rgba(239, 68, 68, 0.9)'
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 4, 80, 8, 160],
            'heatmap-opacity': overlayOpacity * 0.7
          }
        });

        // Spatial Pressure Symbol Text (Isobar values in hPa)
        map.addLayer({
          id: 'spatial-pressure-labels',
          type: 'symbol',
          source: 'spatial-weather-src',
          layout: {
            'text-field': ['concat', ['to-string', ['round', ['coalesce', ['get', 'surfacePressure'], 1013]]], ' hPa'],
            'text-size': 11
          },
          paint: {
            'text-color': '#c084fc',
            'text-halo-color': '#0f172a',
            'text-halo-width': 2
          }
        });

        // Spatial Wind Vector Circles (Subtle vector dots)
        map.addLayer({
          id: 'spatial-wind-circles',
          type: 'circle',
          source: 'spatial-weather-src',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['coalesce', ['get', 'windSpeed'], 0], 0, 3, 50, 6, 120, 10],
            'circle-color': [
              'interpolate', ['linear'], ['coalesce', ['get', 'windSpeed'], 0],
              0, '#06b6d4', 20, '#38bdf8', 45, '#eab308', 75, '#f97316', 110, '#ef4444'
            ],
            'circle-opacity': overlayOpacity * 0.25,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-opacity': 0.4
          }
        });

        // 4. Flood Inundation Layer
        map.addSource('flood-inundation-src', {
          type: 'geojson',
          data: floodGeoJSON || { type: 'FeatureCollection', features: [] }
        });

        map.addLayer({
          id: 'flood-inundation-fill',
          type: 'fill',
          source: 'flood-inundation-src',
          paint: {
            'fill-color': ['coalesce', ['get', 'fillColor'], '#ef4444'],
            'fill-opacity': overlayOpacity * 0.45
          }
        });

        map.addLayer({
          id: 'flood-inundation-stroke',
          type: 'line',
          source: 'flood-inundation-src',
          paint: {
            'line-color': '#ef4444',
            'line-width': 2,
            'line-opacity': 0.8
          }
        });

        // 5. Risk Buffer Ring & Area Layer
        map.addSource('risk-ring-src', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [selectedLocation.lng, selectedLocation.lat]
            },
            properties: { name: 'Impact Buffer Ring' }
          }
        });

        map.addLayer({
          id: 'risk-ring-layer',
          type: 'circle',
          source: 'risk-ring-src',
          paint: {
            'circle-radius': 75,
            'circle-color': '#ef4444',
            'circle-opacity': 0.15,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ef4444',
            'circle-stroke-opacity': 0.6
          }
        });

        // 6. OSM Infrastructure GIS Layer
        map.addSource('infrastructure-src', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: infrastructureFeatures
          }
        });

        map.addLayer({
          id: 'infrastructure-circles',
          type: 'circle',
          source: 'infrastructure-src',
          paint: {
            'circle-radius': 6.5,
            'circle-color': [
              'match', ['coalesce', ['get', 'category'], ''],
              'Hospital', '#10b981',
              'Shelter', '#06b6d4',
              'School', '#f59e0b',
              'Bridge', '#ec4899',
              '#3b82f6'
            ],
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Infrastructure click handler
        map.on('click', 'infrastructure-circles', (e: any) => {
          if (e.features && e.features.length > 0 && onSelectFeature) {
            onSelectFeature(e.features[0]);
          }
        });

        // Forecast points click handler
        map.on('click', 'cyclone-points-circles', (e: any) => {
          if (e.features && e.features.length > 0 && onSelectForecastPoint && cycloneData?.forecastPoints) {
            const props = e.features[0].properties;
            const pt = cycloneData.forecastPoints.find(p => p.offsetHours === props.offsetHours);
            if (pt) onSelectForecastPoint(pt);
          }
        });
      });

      map.on('click', (e: maplibregl.MapMouseEvent) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['infrastructure-circles', 'cyclone-points-circles']
        });
        if (features.length === 0) {
          onLocationSelect(e.lngLat.lat, e.lngLat.lng);
        }
      });

      const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      });
      if (mapContainerRef.current) {
        resizeObserver.observe(mapContainerRef.current);
      }

      mapRef.current = map;
    } catch (err: any) {
      console.error("MapLibre initialization exception:", err);
      setMapInitError(`MAP INITIALIZATION ERROR: ${err?.message || err}`);
    }

    return () => {
      setMapLoaded(false);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (mapRef.current) {
        const instance = mapRef.current;
        mapRef.current = null;
        try {
          instance.remove();
        } catch (e) {}
      }
    };
  }, []);

  // Sync Location Pin Marker & Fly map smoothly
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const lat = selectedLocation?.lat;
    const lng = selectedLocation?.lng;

    if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) return;

    if (!locationMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'pointer-events-none relative flex items-center justify-center';
      el.innerHTML = `
        <div class="absolute w-8 h-8 rounded-full bg-[#16A34A]/20 radar-beacon"></div>
        <div class="absolute w-5 h-5 rounded-full border border-[#16A34A]/50 sweep-beacon" style="border-top-color: #16A34A;"></div>
        <div class="w-3 h-3 rounded-full bg-[#16A34A] border-2 border-white shadow-md ring-2 ring-[#16A34A]/25"></div>
      `;

      locationMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
    } else {
      locationMarkerRef.current.setLngLat([lng, lat]);
    }

    const ringSrc = mapRef.current.getSource('risk-ring-src') as maplibregl.GeoJSONSource;
    if (ringSrc) {
      ringSrc.setData({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {}
      } as any);
    }

    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: mapRef.current.getZoom() < 6 ? 8 : mapRef.current.getZoom(),
      essential: true,
      speed: 1.4,
      curve: 1.2
    });
  }, [selectedLocation?.lat, selectedLocation?.lng, mapLoaded]);

  // Update Spatial Weather GeoJSON source
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const src = mapRef.current.getSource('spatial-weather-src') as maplibregl.GeoJSONSource;
    if (src && spatialWeatherGeoJSON) {
      src.setData(spatialWeatherGeoJSON);
    }
  }, [spatialWeatherGeoJSON, mapLoaded]);

  // Update Infrastructure source
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const src = mapRef.current.getSource('infrastructure-src') as maplibregl.GeoJSONSource;
    if (src) {
      src.setData({
        type: 'FeatureCollection',
        features: infrastructureFeatures
      });
    }
  }, [infrastructureFeatures, mapLoaded]);

  // Update Flood GeoJSON source
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const src = mapRef.current.getSource('flood-inundation-src') as maplibregl.GeoJSONSource;
    if (src && floodGeoJSON) {
      src.setData(floodGeoJSON);
    }
  }, [floodGeoJSON, mapLoaded]);

  // Update Cyclone Sources & Cyclone Center Marker position
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const centerSrc = map.getSource('cyclone-center-source') as maplibregl.GeoJSONSource;
    const obsSrc = map.getSource('cyclone-observed-track-source') as maplibregl.GeoJSONSource;
    const fcSrc = map.getSource('cyclone-forecast-track-source') as maplibregl.GeoJSONSource;
    const ptsSrc = map.getSource('cyclone-forecast-points-source') as maplibregl.GeoJSONSource;
    const polygonSrc = map.getSource('cyclone-warning-polygon-source') as maplibregl.GeoJSONSource;

    if (cycloneData?.hasActiveCyclone && cycloneData.geojson) {
      const feats = cycloneData.geojson.features || [];

      const obsFeats = feats.filter((f: any) => f.properties?.id === 'observed-track');
      const fcFeats = feats.filter((f: any) => f.properties?.id === 'forecast-track');
      const ptFeats = feats.filter((f: any) => f.properties?.type === 'Forecast Position');
      const polygonFeats = feats.filter((f: any) => f.properties?.id === 'forecast-cone');
      const centerFeats = feats.filter((f: any) => f.properties?.id === 'current-center');

      if (obsSrc) obsSrc.setData({ type: 'FeatureCollection', features: obsFeats });
      if (fcSrc) fcSrc.setData({ type: 'FeatureCollection', features: fcFeats });
      if (ptsSrc) ptsSrc.setData({ type: 'FeatureCollection', features: ptFeats });
      if (polygonSrc) polygonSrc.setData({ type: 'FeatureCollection', features: polygonFeats });
      if (centerSrc) centerSrc.setData({ type: 'FeatureCollection', features: centerFeats });

      // Cyclone Storm Marker Position
      const pt = cycloneData.forecastPoints?.find(p => p.offsetHours === selectedTimeStep) || cycloneData.forecastPoints?.[0];
      if (pt && pt.coordinates) {
        if (!cycloneMarkerRef.current) {
          const el = document.createElement('div');
          el.className = 'cursor-pointer group relative flex items-center justify-center';
          el.innerHTML = `
            <div className="absolute w-12 h-12 rounded-full bg-red-600/40 animate-ping"></div>
            <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-110">
              <svg className="animate-spin" style="animation-duration: 4s;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div className="absolute top-11 bg-slate-900/90 text-red-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-red-800/80 shadow-md whitespace-nowrap">
              ${cycloneData.storm?.name || 'CYCLONE CENTER'}
            </div>
          `;

          el.addEventListener('click', (ev) => {
            ev.stopPropagation();
            if (onSelectCycloneCenter) onSelectCycloneCenter();
          });

          cycloneMarkerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat(pt.coordinates)
            .addTo(map);
        } else {
          cycloneMarkerRef.current.setLngLat(pt.coordinates);
        }
      }
    } else {
      if (obsSrc) obsSrc.setData({ type: 'FeatureCollection', features: [] });
      if (fcSrc) fcSrc.setData({ type: 'FeatureCollection', features: [] });
      if (ptsSrc) ptsSrc.setData({ type: 'FeatureCollection', features: [] });
      if (polygonSrc) polygonSrc.setData({ type: 'FeatureCollection', features: [] });
      if (centerSrc) centerSrc.setData({ type: 'FeatureCollection', features: [] });

      if (cycloneMarkerRef.current) {
        cycloneMarkerRef.current.remove();
        cycloneMarkerRef.current = null;
      }
    }
  }, [cycloneData, selectedTimeStep, mapLoaded]);

  // Synchronize Layer Visibilities based on activeOverlay & layerState
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const isSat = activeOverlay === 'satellite' || layers.satelliteImagery;
    const isWind = activeOverlay === 'wind' || layers.wind;
    const isRain = activeOverlay === 'rain' || layers.rainfall;
    const isTemp = activeOverlay === 'temperature' || layers.temperature;
    const isPress = activeOverlay === 'pressure' || layers.pressure;
    const isCyclone = (activeOverlay === 'cyclone' || layers.cycloneTrack) && cycloneData?.hasActiveCyclone;
    const isFlood = activeOverlay === 'flood' || activeOverlay === 'surge' || layers.floodIndicator;
    const isInfra = activeOverlay === 'infrastructure' || layers.hospitals || layers.shelters;
    const isRisk = activeOverlay === 'risk' || layers.riskZones;

    if (map.getLayer('satellite-imagery-layer')) {
      map.setLayoutProperty('satellite-imagery-layer', 'visibility', isSat ? 'visible' : 'none');
    }

    if (map.getLayer('spatial-rain-heatmap')) {
      map.setLayoutProperty('spatial-rain-heatmap', 'visibility', isRain ? 'visible' : 'none');
      map.setPaintProperty('spatial-rain-heatmap', 'heatmap-opacity', overlayOpacity * 0.75);
    }

    if (map.getLayer('spatial-temp-heatmap')) {
      map.setLayoutProperty('spatial-temp-heatmap', 'visibility', isTemp ? 'visible' : 'none');
      map.setPaintProperty('spatial-temp-heatmap', 'heatmap-opacity', overlayOpacity * 0.8);
    }
    if (map.getLayer('spatial-temp-labels')) {
      map.setLayoutProperty('spatial-temp-labels', 'visibility', isTemp ? 'visible' : 'none');
    }

    if (map.getLayer('spatial-pressure-heatmap')) {
      map.setLayoutProperty('spatial-pressure-heatmap', 'visibility', isPress ? 'visible' : 'none');
      map.setPaintProperty('spatial-pressure-heatmap', 'heatmap-opacity', overlayOpacity * 0.7);
    }
    if (map.getLayer('spatial-pressure-labels')) {
      map.setLayoutProperty('spatial-pressure-labels', 'visibility', isPress ? 'visible' : 'none');
    }

    if (map.getLayer('spatial-wind-circles')) {
      map.setLayoutProperty('spatial-wind-circles', 'visibility', isWind ? 'visible' : 'none');
      map.setPaintProperty('spatial-wind-circles', 'circle-opacity', overlayOpacity * 0.4);
    }

    const cycloneVis = isCyclone ? 'visible' : 'none';
    ['cyclone-warning-polygon-fill', 'cyclone-warning-polygon-stroke', 'cyclone-track-glow', 'cyclone-observed-track-layer', 'cyclone-forecast-track-layer', 'cyclone-points-circles', 'cyclone-points-labels'].forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', cycloneVis);
      }
    });

    if (cycloneMarkerRef.current) {
      cycloneMarkerRef.current.getElement().style.display = cycloneVis === 'none' ? 'none' : 'flex';
    }

    if (map.getLayer('flood-inundation-fill')) {
      map.setLayoutProperty('flood-inundation-fill', 'visibility', isFlood ? 'visible' : 'none');
      map.setPaintProperty('flood-inundation-fill', 'fill-opacity', overlayOpacity * 0.45);
    }
    if (map.getLayer('flood-inundation-stroke')) {
      map.setLayoutProperty('flood-inundation-stroke', 'visibility', isFlood ? 'visible' : 'none');
    }

    if (map.getLayer('infrastructure-circles')) {
      map.setLayoutProperty('infrastructure-circles', 'visibility', isInfra ? 'visible' : 'none');
    }

    if (map.getLayer('risk-ring-layer')) {
      map.setLayoutProperty('risk-ring-layer', 'visibility', isRisk ? 'visible' : 'none');
    }
  }, [activeOverlay, layers, overlayOpacity, cycloneData, mapLoaded]);

  // --- WIND FLOW CANVASES PARTICLE ANIMATION ENGINE (Zoom-Earth UX) ---
  useEffect(() => {
    const isWindActive = activeOverlay === 'wind' || layers.wind;
    const canvas = canvasRef.current;
    if (!canvas || !mapRef.current || !mapLoaded || !isWindActive) {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const map = mapRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const feats = spatialWeatherGeoJSON?.features || [];
    const windGridPoints: Array<{ x: number; y: number; u: number; v: number; speed: number }> = [];

    feats.forEach((f: any) => {
      const coords = f.geometry?.coordinates;
      const u = f.properties?.uWind || 0;
      const v = f.properties?.vWind || 0;
      const spd = f.properties?.windSpeed || 15;
      if (coords && coords.length >= 2) {
        const pt = map.project([coords[0], coords[1]]);
        windGridPoints.push({ x: pt.x, y: pt.y, u, v, speed: spd });
      }
    });

    const NUM_PARTICLES = 300;
    const particles: Array<{ x: number; y: number; age: number; maxAge: number }> = [];

    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        age: Math.floor(Math.random() * 80),
        maxAge: 40 + Math.floor(Math.random() * 60)
      });
    }

    const animate = () => {
      // Use destination-out to fade particle trails without darkening the map underneath
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // Switch back to normal blending to draw new wind particle lines
      ctx.globalCompositeOperation = 'source-over';

      particles.forEach(p => {
        p.age++;
        if (p.age > p.maxAge || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.age = 0;
        }

        let nearestU = 5;
        let nearestV = 5;
        let minDist = Infinity;

        if (windGridPoints.length > 0) {
          for (let g of windGridPoints) {
            const dx = g.x - p.x;
            const dy = g.y - p.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < minDist) {
              minDist = distSq;
              nearestU = g.u;
              nearestV = g.v;
            }
          }
        }

        const dx = nearestU * 0.15;
        const dy = -nearestV * 0.15;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + dx, p.y + dy);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + (p.age / p.maxAge) * 0.6})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        p.x += dx;
        p.y += dy;
      });

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      ctx.clearRect(0, 0, width, height);
    };
  }, [activeOverlay, layers.wind, spatialWeatherGeoJSON, mapLoaded]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-slate-950 overflow-hidden select-none">
      {fallbackActive && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-amber-950/90 border border-amber-700/80 px-3 py-1 rounded-full shadow-lg text-[10px] font-mono text-amber-300">
          Basemap fallback active (OpenStreetMap Standard)
        </div>
      )}

      {mapInitError && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-6 text-center">
          <div className="bg-red-950/90 border border-red-700/80 p-6 rounded-2xl max-w-md space-y-3 shadow-2xl">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-extrabold text-white">MAP INITIALIZATION ERROR</h3>
            <p className="text-xs text-red-300 font-mono">{mapInitError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-lg transition-colors"
            >
              RETRY INITIALIZATION
            </button>
          </div>
        </div>
      )}

      <div ref={mapContainerRef} className="w-full h-full" />
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />
    </div>
  );
};

export default MapLibreView;
