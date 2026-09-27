import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserLocation } from '../types';

interface LocationContextType {
  location: UserLocation;
  requestLocation: () => Promise<UserLocation>;
  skipLocation: () => void;
  showLocationModal: boolean;
  setShowLocationModal: (show: boolean) => void;
  triggerLocationPromptIfNeeded: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const LOCATION_STORAGE_KEY = 'cycloneshield_user_location';

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<UserLocation>(() => {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fall back to default
      }
    }
    return {
      latitude: null,
      longitude: null,
      status: 'idle'
    };
  });

  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  useEffect(() => {
    if (location.status !== 'idle') {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    }
  }, [location]);

  const requestLocation = (): Promise<UserLocation> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const newLoc: UserLocation = {
          latitude: null,
          longitude: null,
          status: 'unavailable',
          errorMessage: 'Geolocation is not supported by your browser.'
        };
        setLocation(newLoc);
        setShowLocationModal(false);
        resolve(newLoc);
        return;
      }

      setLocation((prev) => ({ ...prev, status: 'requesting' }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            status: 'granted'
          };
          setLocation(newLoc);
          setShowLocationModal(false);
          resolve(newLoc);
        },
        (error) => {
          let msg = 'Location access was not enabled. You can select an area manually later.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission was denied. You can select an area manually later.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Location information is unavailable.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'The request to get user location timed out.';
          }

          const newLoc: UserLocation = {
            latitude: null,
            longitude: null,
            status: 'denied',
            errorMessage: msg
          };
          setLocation(newLoc);
          setShowLocationModal(false);
          resolve(newLoc);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const skipLocation = () => {
    const newLoc: UserLocation = {
      latitude: null,
      longitude: null,
      status: 'skipped'
    };
    setLocation(newLoc);
    setShowLocationModal(false);
  };

  const triggerLocationPromptIfNeeded = () => {
    if (location.status === 'idle') {
      setShowLocationModal(true);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        requestLocation,
        skipLocation,
        showLocationModal,
        setShowLocationModal,
        triggerLocationPromptIfNeeded
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useUserLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useUserLocation must be used within a LocationProvider');
  }
  return context;
};
