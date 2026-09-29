import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from './LocationContext';
import { 
  fetchDashboardSummary, 
  fetchSpatialWeatherGrid,
  type CycloneData, 
  type RiskResult 
} from '../services/api';
import type { DataStatus } from '../services/requestManager';

interface WeatherContextType {
  weather: any;
  hourly: any[];
  hourlyForecast: any[];
  daily: any[];
  cycloneData: CycloneData | null;
  riskData: RiskResult | null;
  spatialGrid: any;
  status: DataStatus;
  lastSuccessfulFetch: Date | null;
  error: string | null;
  errorMessage: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: (force?: boolean) => Promise<void>;
  selectedTimeStep: number;
  setSelectedTimeStep: (step: number) => void;
  activeOverlay: string | null;
  setActiveOverlay: (mode: string | null) => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { location } = useLocation();

  const [weather, setWeather] = useState<any>(null);
  const [hourly, setHourly] = useState<any[]>([]);
  const [daily, setDaily] = useState<any[]>([]);
  const [cycloneData, setCycloneData] = useState<CycloneData | null>(null);
  const [riskData, setRiskData] = useState<RiskResult | null>(null);
  const [spatialGrid, setSpatialGrid] = useState<any>(null);

  const [status, setStatus] = useState<DataStatus>('NO_DATA');
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedTimeStep, setSelectedTimeStep] = useState<number>(0);
  const [activeOverlay, setActiveOverlay] = useState<string | null>('wind');

  const prevLocationRef = useRef<{ lat: number; lon: number } | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  const loadData = useCallback(async (forceRefresh = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    // If no previous data, set status to LOADING
    setStatus(prev => (prev === 'NO_DATA' ? 'LOADING' : prev));

    try {
      const summary = await fetchDashboardSummary(
        location.latitude,
        location.longitude,
        false,
        forceRefresh
      );

      if (summary && summary.current && (summary.current.available !== false || summary.current.temperature !== undefined)) {
        setWeather(summary.current);
        if (Array.isArray(summary.hourly) && summary.hourly.length > 0) {
          setHourly(summary.hourly);
        }
        if (Array.isArray(summary.daily) && summary.daily.length > 0) {
          setDaily(summary.daily);
        }
        if (summary.cyclones) {
          setCycloneData(summary.cyclones);
        }
        if (summary.risk) {
          setRiskData(summary.risk);
        }

        const now = new Date();
        setLastSuccessfulFetch(now);
        setStatus('LIVE');
        setError(null);
      } else {
        // Partial or unavailable response
        if (weather) {
          setStatus('STALE');
          setError('Refresh returned incomplete data — showing last successful data');
        } else {
          setStatus('ERROR');
          setError('Live weather stream temporarily unavailable');
        }
      }
    } catch (err: any) {
      console.warn('[Weather] Dashboard load error:', err);
      if (weather) {
        setStatus('STALE');
        setError('Live refresh failed — showing last successful data');
      } else {
        setStatus('ERROR');
        setError(err.message || 'Unable to connect to live weather service');
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [location.latitude, location.longitude, weather]);

  // Trigger load when coordinates change
  useEffect(() => {
    const prev = prevLocationRef.current;
    if (!prev || Math.abs(prev.lat - location.latitude) > 0.001 || Math.abs(prev.lon - location.longitude) > 0.001) {
      prevLocationRef.current = { lat: location.latitude, lon: location.longitude };
      loadData(false);
    }
  }, [location.latitude, location.longitude, loadData]);

  // Load forecast spatial grid when time step or location changes
  useEffect(() => {
    let isCancelled = false;
    fetchSpatialWeatherGrid(location.latitude, location.longitude, selectedTimeStep)
      .then(res => {
        if (!isCancelled && res?.geojson) {
          setSpatialGrid(res.geojson);
        }
      })
      .catch(err => {
        if (!isCancelled) console.warn('[Weather] Spatial grid error:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [location.latitude, location.longitude, selectedTimeStep]);

  // Auto-refresh interval (every 5 mins) with visibility change handling
  useEffect(() => {
    let intervalId: any = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastFetch = lastSuccessfulFetch?.getTime() || 0;
        const elapsed = Date.now() - lastFetch;
        // If older than 5 mins when user returns to tab, refresh in background
        if (elapsed > 300000) {
          loadData(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData(true);
      }
    }, 300000); // 5 minutes

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (intervalId) clearInterval(intervalId);
    };
  }, [loadData, lastSuccessfulFetch]);

  const refresh = async (force = true) => {
    await loadData(force);
  };

  return (
    <WeatherContext.Provider
      value={{
        weather,
        hourly,
        hourlyForecast: hourly,
        daily,
        cycloneData,
        riskData,
        spatialGrid,
        status,
        lastSuccessfulFetch,
        error,
        errorMessage: error,
        isLoading,
        isRefreshing: isLoading,
        refresh,
        selectedTimeStep,
        setSelectedTimeStep,
        activeOverlay,
        setActiveOverlay
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = (): WeatherContextType => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
