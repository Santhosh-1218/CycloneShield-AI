const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface DataProvenance {
  source: string;
  provider: string;
  dataType: string;
  observedAt?: string | null;
  retrievedAt: string;
  freshness: string;
  status: 'LIVE' | 'FORECAST' | 'SATELLITE' | 'MODELED' | 'HISTORICAL' | 'UNAVAILABLE';
  confidence?: number | null;
  isLive?: boolean;
  isForecast?: boolean;
  isModeled?: boolean;
}

export interface DataFreshnessInfo {
  source: string;
  retrievedAt: string;
  status: 'available' | 'loading' | 'unavailable' | 'error' | 'configured_notice';
  freshness?: string;
  message?: string;
}

export interface ExplainableFactor {
  factor: string;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface RiskResult {
  location?: { lat: number; lon: number };
  risk_score: number; // 0 - 100
  score?: number; // 0.0 - 1.0
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  category: 'Low' | 'Moderate' | 'High' | 'Very High';
  hazard_score: number;
  exposure_score: number;
  vulnerability_score: number;
  explainable_factors: ExplainableFactor[];
  ai_explanation?: string;
  hazard_details?: any;
  exposure_details?: any;
  vulnerability_details?: any;
  source?: string;
  timestamp?: string;
  provenance?: DataProvenance;
}

export async function fetchHealthCheck() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await res.json();
  } catch (err) {
    return { status: 'error', message: 'Backend API server unavailable' };
  }
}

export async function fetchGeocode(query: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/geocode?q=${encodeURIComponent(query)}`);
    return await res.json();
  } catch (err) {
    return { query, results: [], status: 'error', message: 'Geocoding request failed' };
  }
}

export async function fetchReverseGeocode(lat: number, lon: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/reverse-geocode?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    return {
      available: true,
      name: `Location (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`,
      district: 'Coastal District',
      state: 'Coastal State',
      country: 'India',
      display_name: `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`
    };
  }
}

export async function fetchSpatialWeatherGrid(lat: number, lon: number, hourOffset: number = 0) {
  try {
    const res = await fetch(`${API_BASE_URL}/weather/spatial?lat=${lat}&lon=${lon}&hour_offset=${hourOffset}`);
    return await res.json();
  } catch (err) {
    return { available: false, geojson: { type: 'FeatureCollection', features: [] }, status: 'error' };
  }
}

export async function fetchCurrentWeather(lat: number, lon: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    return {
      available: false,
      source: 'Open-Meteo',
      retrievedAt: new Date().toISOString(),
      status: 'error',
      message: 'Weather data temporarily unavailable'
    };
  }
}

export async function fetchHourlyWeather(lat: number, lon: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/weather/hourly?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    return { available: false, hourly: [], status: 'error', message: 'Hourly weather data temporarily unavailable' };
  }
}

export async function fetchWeatherForecast(lat: number, lon: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/weather/forecast?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    return { available: false, daily: [], status: 'error', message: 'Forecast data temporarily unavailable' };
  }
}

export async function fetchInfrastructureOSM(lat: number, lon: number, radius = 25000) {
  try {
    const res = await fetch(`${API_BASE_URL}/infrastructure?lat=${lat}&lon=${lon}&radius=${radius}`);
    return await res.json();
  } catch (err) {
    return {
      type: 'FeatureCollection',
      features: [],
      metadata: {
        source: 'OpenStreetMap contributors',
        status: 'error',
        message: 'Infrastructure data temporarily unavailable'
      }
    };
  }
}

export async function fetchSatelliteMetadata(lat: number, lon: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/satellite/metadata?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    return {
      available: false,
      source: 'Sentinel-1 SAR',
      status: 'error',
      message: 'Satellite backend service connection failed'
    };
  }
}

export async function fetchFloodData(lat: number, lon: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/flood?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    return { available: false, geojson: { type: 'FeatureCollection', features: [] }, status: 'error', message: 'Flood analysis data temporarily unavailable' };
  }
}

export async function fetchElevationData(lat: number, lon: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/elevation?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    return { available: false, elevationMeters: 0, status: 'error', message: 'Elevation data temporarily unavailable' };
  }
}

export async function fetchLandcoverData(lat: number, lon: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/landcover?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    return { available: false, classes: [], status: 'error', message: 'Land cover data temporarily unavailable' };
  }
}

export async function fetchPopulationData(lat: number, lon: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/population?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    return { available: false, status: 'error', message: 'Population data temporarily unavailable' };
  }
}

export interface CycloneStorm {
  id: string;
  name: string;
  category: string;
  currentPosition: { lat: number; lon: number };
  maxWindSpeedKmh?: number | null;
  centralPressureHpa?: number | null;
  movementDirection?: string | null;
  movementSpeedKmh?: number | null;
}

export interface CycloneForecastPoint {
  time?: string | null;
  offsetHours: number;
  coordinates: [number, number]; // [lon, lat]
  windSpeedKmh?: number | null;
  pressureHpa?: number | null;
  timeLabel?: string | null;
}

export interface WindRadius {
  speedKt: number;
  quadrants: Record<string, number>;
}

export interface ForecastCone {
  type: string;
  coordinates: number[][][];
}

export interface CycloneData {
  available: boolean;
  hasActiveCyclone: boolean;
  isDemoMode?: boolean;
  message: string;
  reason?: string;
  source: string;
  retrievedAt: string;
  status: 'LIVE' | 'STALE' | 'DEMO_MODE' | 'UNAVAILABLE' | 'error';
  storm?: CycloneStorm | null;
  observedTrack?: any;
  forecastTrack?: any;
  forecastPoints?: CycloneForecastPoint[];
  windRadii?: WindRadius[];
  forecastCone?: ForecastCone | null;
  geojson?: any;
  summary?: any;
  provenance?: DataProvenance;
}

export async function fetchCycloneTracks(lat = 16.9891, lon = 82.2475, demo = false): Promise<CycloneData> {
  try {
    const res = await fetch(`${API_BASE_URL}/cyclones?lat=${lat}&lon=${lon}&demo=${demo}`);
    return await res.json();
  } catch (err) {
    return {
      available: false,
      hasActiveCyclone: false,
      message: 'NO ACTIVE CYCLONE DETECTED',
      source: 'IMD / GDACS',
      retrievedAt: new Date().toISOString(),
      status: 'error'
    };
  }
}

export async function fetchLayersInfo() {
  try {
    const res = await fetch(`${API_BASE_URL}/layers`);
    return await res.json();
  } catch (err) {
    return { categories: [] };
  }
}

export async function fetchDataSourcesStatus(lat: number = 16.9891, lon: number = 82.2475) {
  try {
    const res = await fetch(`${API_BASE_URL}/data-status?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchCurrentRisk(lat: number, lon: number): Promise<RiskResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/risk?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    return {
      risk_score: 0,
      risk_level: 'LOW',
      category: 'Low',
      hazard_score: 0,
      exposure_score: 0,
      vulnerability_score: 0,
      explainable_factors: [{ factor: 'DATA UNAVAILABLE', impact: 'Low', description: 'Risk Engine backend service offline.' }]
    };
  }
}

export async function fetchInfrastructureRiskDetail(assetId: string, lat: number, lon: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/risk/infrastructure/${assetId}?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchExplainableRiskFactors(assetId: string, lat: number, lon: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/risk/factors/${assetId}?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function analyzeRiskWithAI(lat: number, lon: number, locationName = 'Selected Location'): Promise<RiskResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/risk/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lon, location_name: locationName })
    });
    return await res.json();
  } catch (err) {
    return {
      risk_score: 0,
      risk_level: 'LOW',
      category: 'Low',
      hazard_score: 0,
      exposure_score: 0,
      vulnerability_score: 0,
      explainable_factors: [{ factor: 'DATA UNAVAILABLE', impact: 'Low', description: 'Risk analysis backend offline.' }]
    };
  }
}

export async function sendCopilotChat(messages: Array<{ role: string; content: string }>, contextData?: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context_data: contextData })
    });
    return await res.json();
  } catch (err) {
    return {
      available: false,
      source: 'CycloneShield AI Copilot',
      retrievedAt: new Date().toISOString(),
      status: 'error',
      reply: 'Failed to connect to backend AI Copilot service.'
    };
  }
}

export async function fetchAreaRisk(lat: number, lon: number, radiusKm = 25.0) {
  try {
    const res = await fetch(`${API_BASE_URL}/risk/area?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`);
    return await res.json();
  } catch (err) {
    return { center: { lat, lon }, radius_km: radiusKm, grid_points: [] };
  }
}

export async function runScenarioSimulation(params: {
  center_lat: number;
  center_lon: number;
  wind_speed_kmh: number;
  rainfall_24h_mm: number;
  storm_surge_m: number;
  central_pressure_hpa?: number;
  radius_km?: number;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await res.json();
  } catch (err) {
    return { status: 'error', message: 'Simulation failed to run' };
  }
}

export async function fetchRiskHistory(limit = 20) {
  try {
    const res = await fetch(`${API_BASE_URL}/history/risk?limit=${limit}`);
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchActiveAlerts(lat: number, lon: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/alerts/active?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchAdvisoryHistory() {
  try {
    const res = await fetch(`${API_BASE_URL}/advisories/history`);
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function generateActionPlan(params: {
  lat: number;
  lon: number;
  risk_score: number;
  risk_category: string;
  hazard_score: number;
  exposure_score: number;
  vulnerability_score: number;
  factors: string[];
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/action-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchSafeEvacuationRoute(originLat: number, originLon: number, destLat?: number, destLon?: number, shelterName?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/routing/safe-shelter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin_lat: originLat, origin_lon: originLon, dest_lat: destLat, dest_lon: destLon, shelter_name: shelterName })
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchParametricMonitor(lat: number, lon: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/parametric/monitor?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchDistrictBriefing(districtName: string, lat: number, lon: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/briefing/district`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ district_name: districtName, lat, lon })
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function parseMapQueryIntent(query: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/copilot/parse-map-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    return await res.json();
  } catch (err) {
    return {
      intent: 'filter_infrastructure',
      target_type: 'all',
      risk_level: 'all',
      summary: 'Fallback filter',
      source: 'Local Client'
    };
  }
}
