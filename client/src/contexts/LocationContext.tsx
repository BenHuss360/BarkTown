import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getDistanceFromLatLonInMiles } from '@/lib/utils';
import { Location } from '@shared/schema';

interface LocationContextType {
  userLocation: [number, number] | null;
  isLocating: boolean;
  locationError: string | null;
  calculateDistance: (lat: number, lng: number) => number;
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setIsLocating(false);
      },
      (error) => {
        setLocationError(
          error.code === 1
            ? 'Location permission denied. Please enable location services.'
            : 'Unable to get your location'
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Get user location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const calculateDistance = (lat: number, lng: number): number => {
    if (!userLocation) return 0;
    return getDistanceFromLatLonInMiles(userLocation[0], userLocation[1], lat, lng);
  };

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        isLocating,
        locationError,
        calculateDistance,
        refreshLocation: getUserLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}