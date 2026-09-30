import React, { createContext, useContext, useState } from 'react';
import { fetchGeocode, fetchReverseGeocode } from '../services/api';

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  district: string;
  state: string;
  country: string;
  displayName: string;
  isLiveLocation: boolean;
}

export interface GeocodeResult {
  name: string;
  lat: number;
  lon: number;
  state?: string;
  country?: string;
  display_name: string;
}

interface LocationContextType {
  location: LocationData;
  setLocation: (loc: Partial<LocationData>) => void;
  searchLocation: (query: string) => Promise<GeocodeResult[]>;
  selectLocation: (item: GeocodeResult) => void;
  requestLiveLocation: () => Promise<void>;
  isGeolocating: boolean;
  locationError: string | null;
}

const DEFAULT_LOCATION: LocationData = {
  latitude: 16.9891,
  longitude: 82.2475,
  city: 'Kakinada',
  district: 'Kakinada',
  state: 'Andhra Pradesh',
  country: 'India',
  displayName: 'Kakinada, Andhra Pradesh, India',
  isLiveLocation: false
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<LocationData>(() => {
    try {
      const saved = localStorage.getItem('cyclone_shield_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          typeof parsed.latitude === 'number' &&
          Number.isFinite(parsed.latitude) &&
          typeof parsed.longitude === 'number' &&
          Number.isFinite(parsed.longitude)
        ) {
          return { ...DEFAULT_LOCATION, ...parsed };
        }
      }
    } catch (e) {
      // ignore JSON parse errors
    }
    return DEFAULT_LOCATION;
  });

  const [isGeolocating, setIsGeolocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  React.useEffect(() => {
    // Automatically attempt to fetch live location on mount if user hasn't manually overridden it
    const hasSavedLocation = localStorage.getItem('cyclone_shield_location');
    if (!hasSavedLocation && navigator.geolocation) {
      requestLiveLocation();
    }
  }, []);

  const setLocation = (updated: Partial<LocationData>) => {
    setLocationState(prev => {
      const rawLat = updated.latitude ?? prev.latitude ?? DEFAULT_LOCATION.latitude;
      const rawLon = updated.longitude ?? prev.longitude ?? DEFAULT_LOCATION.longitude;
      const validLat = typeof rawLat === 'number' && Number.isFinite(rawLat) ? rawLat : DEFAULT_LOCATION.latitude;
      const validLon = typeof rawLon === 'number' && Number.isFinite(rawLon) ? rawLon : DEFAULT_LOCATION.longitude;

      const next: LocationData = {
        ...prev,
        ...updated,
        latitude: validLat,
        longitude: validLon
      };
      try {
        localStorage.setItem('cyclone_shield_location', JSON.stringify(next));
      } catch (e) {
        // ignore localStorage quota errors
      }
      return next;
    });
  };

  const searchLocation = async (query: string): Promise<GeocodeResult[]> => {
    if (!query.trim()) return [];
    try {
      const data = await fetchGeocode(query);
      if (data && Array.isArray(data.results)) {
        return data.results.map((r: any) => {
          const rawLat = r.latitude ?? r.lat;
          const rawLon = r.longitude ?? r.lon ?? r.lng;
          const lat = typeof rawLat === 'number' ? rawLat : parseFloat(String(rawLat));
          const lon = typeof rawLon === 'number' ? rawLon : parseFloat(String(rawLon));
          return {
            name: r.name || r.display_name?.split(',')[0] || query,
            lat: Number.isFinite(lat) ? lat : DEFAULT_LOCATION.latitude,
            lon: Number.isFinite(lon) ? lon : DEFAULT_LOCATION.longitude,
            state: r.admin1 || r.state || '',
            country: r.country || '',
            display_name: r.display_name || `${r.name || query}`
          };
        });
      }
      return [];
    } catch (err) {
      console.warn("Location search error:", err);
      return [];
    }
  };

  const selectLocation = async (item: GeocodeResult) => {
    const rawLat = (item as any).latitude ?? item.lat;
    const rawLon = (item as any).longitude ?? item.lon ?? (item as any).lng;
    const validLat = typeof rawLat === 'number' ? rawLat : parseFloat(String(rawLat));
    const validLon = typeof rawLon === 'number' ? rawLon : parseFloat(String(rawLon));
    const finalLat = Number.isFinite(validLat) ? validLat : DEFAULT_LOCATION.latitude;
    const finalLon = Number.isFinite(validLon) ? validLon : DEFAULT_LOCATION.longitude;

    const parts = item.display_name ? item.display_name.split(',').map(s => s.trim()) : [];
    const city = item.name || parts[0] || 'Selected Location';
    const state = item.state || parts[parts.length - 2] || '';
    const country = item.country || parts[parts.length - 1] || '';

    const newLoc: LocationData = {
      latitude: finalLat,
      longitude: finalLon,
      city,
      district: city,
      state,
      country,
      displayName: item.display_name || `${city}, ${state} ${country}`.trim(),
      isLiveLocation: false
    };

    setLocation(newLoc);
  };

  const requestLiveLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsGeolocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const revData = await fetchReverseGeocode(lat, lon);
          const city = revData.name || revData.district || 'Current Location';
          const state = revData.state || '';
          const country = revData.country || 'India';
          const displayName = revData.display_name || `${city}, ${state}`.trim();

          setLocation({
            latitude: lat,
            longitude: lon,
            city,
            district: revData.district || city,
            state,
            country,
            displayName,
            isLiveLocation: true
          });
        } catch (err) {
          setLocation({
            latitude: lat,
            longitude: lon,
            city: 'My Location',
            district: 'Local Region',
            state: '',
            country: '',
            displayName: `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`,
            isLiveLocation: true
          });
        } finally {
          setIsGeolocating(false);
        }
      },
      (error) => {
        setIsGeolocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Location permission denied. Please search your city manually.");
        } else {
          setLocationError("Unable to acquire live location. Please select a city.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        searchLocation,
        selectLocation,
        requestLiveLocation,
        isGeolocating,
        locationError
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
