 // src/hooks/useLocation.js
import { useState, useEffect } from 'react';

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [watching, setWatching] = useState(false);

  const startWatching = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    setWatching(true);
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
          timestamp: position.timestamp
        });
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setWatching(false);
    };
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp
          };
          setLocation(locationData);
          resolve(locationData);
        },
        (err) => {
          setError(err.message);
          reject(err);
        }
      );
    });
  };

  return {
    location,
    error,
    watching,
    startWatching,
    getCurrentLocation
  };
}
