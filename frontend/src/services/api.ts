import { requestManager } from './requestManager';

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
  windRadii?: any[];
  forecastCone?: any | null;
  geojson?: any;
  summary?: any;
  provenance?: DataProvenance;
}

/**
 * Normalizes weather response so both nested .values and top-level fields
 * (temperature, feels_like, wind_speed, humidity, pressure, weather_description)
 * are always reliably accessible by any component.
 */
function normalizeWeatherResponse(data: any): any {
  if (!data) return { available: false, status: 'unavailable', values: null };

  const values = data.values || {};
  const temp = values.temperature !== undefined ? values.temperature : (data.temperature !== undefined ? data.temperature : null);
  const feelsLike = values.feelsLike !== undefined ? values.feelsLike : (data.feels_like !== undefined ? data.feels_like : null);
  const windSpeed = values.windSpeed !== undefined ? values.windSpeed : (data.wind_speed !== undefined ? data.wind_speed : null);
  const windDir = values.windDirection !== undefined ? values.windDirection : (data.wind_direction !== undefined ? data.wind_direction : 'NW');
  const humidity = values.humidity !== undefined ? values.humidity : (data.humidity !== undefined ? data.humidity : null);
  const pressure = values.surfacePressure !== undefined ? values.surfacePressure : (data.pressure !== undefined ? data.pressure : null);
  const precipProb = values.precipitationProbability !== undefined ? values.precipitationProbability : (data.precipitation_probability ?? 0);
  const rain24h = values.accumulatedRain24h !== undefined ? values.accumulatedRain24h : 0;

  let description = data.weather_description || data.condition;
  if (!description && temp !== null) {
    if (rain24h > 10 || precipProb > 60) description = 'Showers / Rain';
    else if (windSpeed > 30) description = 'Breezy / Wind';
    else description = 'Fair / Partly Cloudy';
  }

  return {
    ...data,
    available: data.available !== false && temp !== null,
    temperature: temp,
    temp_c: temp,
    feels_like: feelsLike,
    wind_speed: windSpeed,
    wind_direction: windDir,
    humidity: humidity,
    pressure: pressure,
    precipitation_probability: precipProb,
    weather_description: description || 'Fair',
    retrievedAt: data.retrievedAt || new Date().toISOString(),
    values: {
      temperature: temp,
      feelsLike: feelsLike,
      windSpeed: windSpeed,
      windDirection: windDir,
      humidity: humidity,
      surfacePressure: pressure,
      precipitationProbability: precipProb,
      accumulatedRain24h: rain24h
    }
  };
}

export interface GeocodeResultItem {
  name?: string;
  lat: number | string;
  lon: number | string;
  state?: string;
  country?: string;
  district?: string;
  display_name?: string;
  [key: string]: any;
}

export interface GeocodeResponse {
  query?: string;
  results?: GeocodeResultItem[];
  status?: string;
  message?: string;
  [key: string]: any;
}

export interface ReverseGeocodeResult {
  available?: boolean;
  name?: string;
  district?: string;
  state?: string;
  country?: string;
  display_name?: string;
  lat?: number;
  lon?: number;
  [key: string]: any;
}

function sanitizeCoords(lat: any, lon: any): { lat: number; lon: number } {
  const parsedLat = typeof lat === 'number' ? lat : parseFloat(String(lat));
  const parsedLon = typeof lon === 'number' ? lon : parseFloat(String(lon));
  return {
    lat: Number.isFinite(parsedLat) && parsedLat >= -90 && parsedLat <= 90 ? parsedLat : 16.9891,
    lon: Number.isFinite(parsedLon) && parsedLon >= -180 && parsedLon <= 180 ? parsedLon : 82.2475
  };
}

export async function fetchHealthCheck() {
  try {
    return await requestManager.request(`${API_BASE_URL}/health`, {}, 5000);
  } catch (err) {
    return { status: 'error', message: 'Backend API server unavailable' };
  }
}

export async function fetchGeocode(query: string): Promise<GeocodeResponse> {
  try {
    return await requestManager.request<GeocodeResponse>(`${API_BASE_URL}/geocode?q=${encodeURIComponent(query)}`, {}, 8000);
  } catch (err) {
    return { query, results: [], status: 'error', message: 'Geocoding request failed' };
  }
}

export async function fetchReverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult> {
  const coords = sanitizeCoords(lat, lon);
  try {
    return await requestManager.request<ReverseGeocodeResult>(`${API_BASE_URL}/reverse-geocode?lat=${coords.lat}&lon=${coords.lon}`, {}, 8000);
  } catch (err) {
    return {
      available: true,
      name: `Location (${coords.lat.toFixed(4)}°, ${coords.lon.toFixed(4)}°)`,
      district: 'Coastal District',
      state: 'Coastal State',
      country: 'India',
      display_name: `${coords.lat.toFixed(4)}° N, ${coords.lon.toFixed(4)}° E`
    };
  }
}

/**
 * Aggregated Dashboard Summary endpoint: single round-trip for current, hourly, forecast, cyclones, risk.
 */
export async function fetchDashboardSummary(lat: number, lon: number, demo = false, forceRefresh = false) {
  const coords = sanitizeCoords(lat, lon);
  try {
    const raw = await requestManager.request<any>(
      `${API_BASE_URL}/weather/dashboard?lat=${coords.lat}&lon=${coords.lon}&demo=${demo}`,
      {},
      10000,
      forceRefresh
    );

    return {
      available: Boolean(raw?.available),
      status: raw?.status || 'available',
      retrievedAt: raw?.retrievedAt || new Date().toISOString(),
      current: normalizeWeatherResponse(raw?.current),
      hourly: Array.isArray(raw?.hourly) ? raw.hourly : [],
      daily: Array.isArray(raw?.daily) ? raw.daily : [],
      cyclones: raw?.cyclones || { hasActiveCyclone: false, status: 'UNAVAILABLE' },
      risk: raw?.risk || null
    };
  } catch (err: any) {
    // Fallback to separate endpoints if backend aggregate endpoint fails
    const [c, h, f, cyc, r] = await Promise.allSettled([
      fetchCurrentWeather(coords.lat, coords.lon, forceRefresh),
      fetchHourlyWeather(coords.lat, coords.lon, forceRefresh),
      fetchWeatherForecast(coords.lat, coords.lon, forceRefresh),
      fetchCycloneTracks(coords.lat, coords.lon, demo, forceRefresh),
      fetchCurrentRisk(coords.lat, coords.lon, forceRefresh)
    ]);

    return {
      available: c.status === 'fulfilled' && c.value.available,
      status: c.status === 'fulfilled' && c.value.available ? 'available' : 'error',
      retrievedAt: new Date().toISOString(),
      current: c.status === 'fulfilled' ? c.value : { available: false, status: 'error' },
      hourly: h.status === 'fulfilled' ? h.value.hourly : [],
      daily: f.status === 'fulfilled' ? f.value.daily : [],
      cyclones: cyc.status === 'fulfilled' ? cyc.value : { hasActiveCyclone: false, status: 'UNAVAILABLE' },
      risk: r.status === 'fulfilled' ? r.value : null
    };
  }
}

export async function fetchSpatialWeatherGrid(lat: number, lon: number, hourOffset: number = 0, forceRefresh = false) {
  const coords = sanitizeCoords(lat, lon);
  try {
    return await requestManager.request<any>(
      `${API_BASE_URL}/weather/spatial?lat=${coords.lat}&lon=${coords.lon}&hour_offset=${hourOffset}`,
      {},
      12000,
      forceRefresh,
      120000 // 2 min cache for spatial grid
    );
  } catch (err) {
    return { available: false, geojson: { type: 'FeatureCollection', features: [] }, status: 'error' };
  }
}

export async function fetchCurrentWeather(lat: number, lon: number, forceRefresh = false) {
  const coords = sanitizeCoords(lat, lon);
  try {
    const raw = await requestManager.request<any>(
      `${API_BASE_URL}/weather?lat=${coords.lat}&lon=${coords.lon}`,
      {},
      10000,
      forceRefresh
    );
    return normalizeWeatherResponse(raw);
  } catch (err: any) {
    return {
      available: false,
      source: 'Open-Meteo',
      retrievedAt: new Date().toISOString(),
      status: 'error',
      message: err.message || 'Weather data temporarily unavailable',
      values: null
    };
  }
}

export async function fetchHourlyWeather(lat: number, lon: number, forceRefresh = false) {
  const coords = sanitizeCoords(lat, lon);
  try {
    const raw = await requestManager.request<any>(
      `${API_BASE_URL}/weather/hourly?lat=${coords.lat}&lon=${coords.lon}`,
      {},
      10000,
      forceRefresh
    );
    return {
      available: Boolean(raw?.available),
      hourly: Array.isArray(raw?.hourly) ? raw.hourly : [],
      retrievedAt: raw?.retrievedAt || new Date().toISOString(),
      status: raw?.status || 'available'
    };
  } catch (err: any) {
    return { available: false, hourly: [], status: 'error', message: err.message || 'Hourly forecast data unavailable' };
  }
}

export async function fetchWeatherForecast(lat: number, lon: number, forceRefresh = false) {
  const coords = sanitizeCoords(lat, lon);
  try {
    const raw = await requestManager.request<any>(
      `${API_BASE_URL}/weather/forecast?lat=${coords.lat}&lon=${coords.lon}`,
      {},
      10000,
      forceRefresh
    );
    return {
      available: Boolean(raw?.available),
      daily: Array.isArray(raw?.daily) ? raw.daily : [],
      retrievedAt: raw?.retrievedAt || new Date().toISOString(),
      status: raw?.status || 'available'
    };
  } catch (err: any) {
    return { available: false, daily: [], status: 'error', message: err.message || 'Daily forecast data unavailable' };
  }
}

export async function fetchInfrastructureOSM(lat: number, lon: number, radius = 25000, forceRefresh = false) {
  try {
    return await requestManager.request<any>(
      `${API_BASE_URL}/infrastructure?lat=${lat}&lon=${lon}&radius=${radius}`,
      {},
      12000,
      forceRefresh,
      600000 // 10 min cache for OSM
    );
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

export async function fetchSatelliteMetadata(lat: number, lon: number, forceRefresh = false) {
  try {
    return await requestManager.request<any>(
      `${API_BASE_URL}/satellite/metadata?lat=${lat}&lon=${lon}`,
      {},
      10000,
      forceRefresh
    );
  } catch (err) {
    return {
      available: false,
      source: 'Sentinel-1 SAR',
      status: 'error',
      message: 'Satellite backend service connection failed'
    };
  }
}

export async function fetchFloodData(lat: number, lon: number, forceRefresh = false) {
  try {
    return await requestManager.request<any>(
      `${API_BASE_URL}/flood?lat=${lat}&lon=${lon}`,
      {},
      10000,
      forceRefresh
    );
  } catch (err) {
    return { available: false, geojson: { type: 'FeatureCollection', features: [] }, status: 'error', message: 'Flood analysis data temporarily unavailable' };
  }
}

export async function fetchElevationData(lat: number, lon: number) {
  try {
    return await requestManager.request<any>(
      `${API_BASE_URL}/elevation?lat=${lat}&lon=${lon}`,
      {},
      8000,
      false,
      3600000 // 1 hour cache for elevation
    );
  } catch (err) {
    return { available: false, elevationMeters: 0, status: 'error', message: 'Elevation data temporarily unavailable' };
  }
}

export async function fetchLandcoverData(lat: number, lon: number) {
  try {
    return await requestManager.request<any>(
      `${API_BASE_URL}/landcover?lat=${lat}&lon=${lon}`,
      {},
      8000,
      false,
      3600000
    );
  } catch (err) {
    return { available: false, classes: [], status: 'error', message: 'Land cover data temporarily unavailable' };
  }
}

export async function fetchPopulationData(lat: number, lon: number) {
  try {
    return await requestManager.request<any>(
      `${API_BASE_URL}/population?lat=${lat}&lon=${lon}`,
      {},
      8000,
      false,
      3600000
    );
  } catch (err) {
    return { available: false, status: 'error', message: 'Population data temporarily unavailable' };
  }
}

export async function fetchCycloneTracks(lat = 16.9891, lon = 82.2475, demo = false, forceRefresh = false): Promise<CycloneData> {
  const coords = sanitizeCoords(lat, lon);
  try {
    return await requestManager.request<CycloneData>(
      `${API_BASE_URL}/cyclones?lat=${coords.lat}&lon=${coords.lon}&demo=${demo}`,
      {},
      10000,
      forceRefresh,
      180000 // 3 min cache
    );
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

export const fetchCycloneEvents = fetchCycloneTracks;

export async function fetchLayersInfo() {
  try {
    return await requestManager.request<any>(`${API_BASE_URL}/layers`, {}, 5000);
  } catch (err) {
    return { categories: [] };
  }
}

export async function fetchDataSourcesStatus(lat: number = 16.9891, lon: number = 82.2475, forceRefresh = false) {
  const coords = sanitizeCoords(lat, lon);
  try {
    return await requestManager.request<any[]>(
      `${API_BASE_URL}/data-status?lat=${coords.lat}&lon=${coords.lon}`,
      {},
      8000,
      forceRefresh
    );
  } catch (err) {
    return [];
  }
}

export async function fetchCurrentRisk(lat: number, lon: number, forceRefresh = false): Promise<RiskResult> {
  const coords = sanitizeCoords(lat, lon);
  try {
    return await requestManager.request<RiskResult>(
      `${API_BASE_URL}/risk?lat=${coords.lat}&lon=${coords.lon}`,
      {},
      10000,
      forceRefresh,
      180000
    );
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
    return await requestManager.request<any>(`${API_BASE_URL}/risk/infrastructure/${assetId}?lat=${lat}&lon=${lon}`, {}, 8000);
  } catch (err) {
    return null;
  }
}

export async function fetchExplainableRiskFactors(assetId: string, lat: number, lon: number) {
  try {
    return await requestManager.request<any>(`${API_BASE_URL}/risk/factors/${assetId}?lat=${lat}&lon=${lon}`, {}, 8000);
  } catch (err) {
    return null;
  }
}

export async function analyzeRiskWithAI(lat: number, lon: number, locationName = 'Selected Location'): Promise<RiskResult> {
  try {
    return await requestManager.request<RiskResult>(
      `${API_BASE_URL}/risk/analyze`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon, location_name: locationName })
      },
      15000
    );
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
    return await requestManager.request<any>(
      `${API_BASE_URL}/copilot`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, context_data: contextData })
      },
      20000,
      true
    );
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
    return await requestManager.request<any>(`${API_BASE_URL}/risk/area?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`, {}, 10000);
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
    return await requestManager.request<any>(
      `${API_BASE_URL}/simulation/run`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      },
      15000,
      true
    );
  } catch (err) {
    return { status: 'error', message: 'Simulation failed to run' };
  }
}

export async function fetchRiskHistory(limit = 20) {
  try {
    return await requestManager.request<any[]>(`${API_BASE_URL}/history/risk?limit=${limit}`, {}, 8000);
  } catch (err) {
    return [];
  }
}

export async function fetchActiveAlerts(lat: number, lon: number) {
  try {
    return await requestManager.request<any[]>(`${API_BASE_URL}/alerts/active?lat=${lat}&lon=${lon}`, {}, 8000);
  } catch (err) {
    return [];
  }
}

export async function fetchAdvisoryHistory() {
  try {
    return await requestManager.request<any[]>(`${API_BASE_URL}/advisories/history`, {}, 8000);
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
    return await requestManager.request<any>(
      `${API_BASE_URL}/action-plan/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      },
      12000,
      true
    );
  } catch (err) {
    return null;
  }
}

export async function fetchSafeEvacuationRoute(originLat: number, originLon: number, destLat?: number, destLon?: number, shelterName?: string) {
  try {
    return await requestManager.request<any>(
      `${API_BASE_URL}/routing/safe-shelter`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin_lat: originLat, origin_lon: originLon, dest_lat: destLat, dest_lon: destLon, shelter_name: shelterName })
      },
      12000,
      true
    );
  } catch (err) {
    return null;
  }
}

export async function fetchParametricMonitor(lat: number, lon: number) {
  try {
    return await requestManager.request<any>(`${API_BASE_URL}/parametric/monitor?lat=${lat}&lon=${lon}`, {}, 8000);
  } catch (err) {
    return null;
  }
}

export async function fetchDistrictBriefing(districtName: string, lat: number, lon: number) {
  try {
    return await requestManager.request<any>(
      `${API_BASE_URL}/briefing/district`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district_name: districtName, lat, lon })
      },
      15000,
      true
    );
  } catch (err) {
    return null;
  }
}

export async function parseMapQueryIntent(query: string) {
  try {
    return await requestManager.request<any>(
      `${API_BASE_URL}/copilot/parse-map-query`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      },
      10000,
      true
    );
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
