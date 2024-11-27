 // FastTagRecharge.js
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function FastTagRecharge() {
  const [balance, setBalance] = useState(localStorage.getItem('fasttagBalance') || 1000);
  const [location, setLocation] = useState(null);
  const [tollHistory, setTollHistory] = useState([]);

  useEffect(() => {
    const watchLocation = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        checkTollLocation(position.coords);
      },
      (error) => console.error('Location error:', error),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchLocation);
  }, []);

  const checkTollLocation = (coords) => {
    // Simulated toll locations - replace with actual toll location data
    const tollLocations = [
      { lat: 12.9716, lng: 77.5946, name: 'Bangalore Toll', fee: 100 },
    ];

    tollLocations.forEach(toll => {
      const distance = calculateDistance(
        coords.latitude,
        coords.longitude,
        toll.lat,
        toll.lng
      );

      if (distance < 0.1) { // Within 100 meters
        deductToll(toll);
      }
    });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula implementation
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const deductToll = (toll) => {
    const newBalance = balance - toll.fee;
    setBalance(newBalance);
    localStorage.setItem('fasttagBalance', newBalance);
    
    setTollHistory(prev => [...prev, {
      name: toll.name,
      fee: toll.fee,
      date: new Date().toISOString(),
      remainingBalance: newBalance
    }]);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>FasTag Status</CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="font-bold">Current Balance: ₹{balance}</h3>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Recent Transactions</h4>
          <div className="space-y-2">
            {tollHistory.map((toll, index) => (
              <div key={index} className="p-2 border rounded">
                <p>{toll.name} - ₹{toll.fee}</p>
                <p className="text-sm text-gray-600">
                  {new Date(toll.date).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

