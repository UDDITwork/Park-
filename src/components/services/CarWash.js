 // CarWash.js
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell } from 'lucide-react';

export default function CarWash() {
  const [lastWashDate, setLastWashDate] = useState(localStorage.getItem('lastWashDate') || '');
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    const checkWashDue = () => {
      if (lastWashDate) {
        const daysSinceWash = Math.floor((new Date() - new Date(lastWashDate)) / (1000 * 60 * 60 * 24));
        setShowReminder(daysSinceWash >= 15);
      }
    };

    checkWashDue();
    const interval = setInterval(checkWashDue, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lastWashDate]);

  const handleWashUpdate = (date) => {
    setLastWashDate(date);
    localStorage.setItem('lastWashDate', date);
    setShowReminder(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>Car Wash Tracker</CardHeader>
      <CardContent>
        <input
          type="date"
          value={lastWashDate}
          onChange={(e) => handleWashUpdate(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {showReminder && (
          <Alert className="mt-4 bg-yellow-50">
            <Bell className="h-4 w-4" />
            <AlertDescription>
              It's been 15 days since your last car wash!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
