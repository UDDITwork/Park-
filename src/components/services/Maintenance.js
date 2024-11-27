// Maintenance.js
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function Maintenance() {
  const [maintenanceData, setMaintenanceData] = useState({
    lastServiceDate: '',
    lastRepairDate: '',
    launchDate: '',
    kmTravelled: 0,
    performanceMetrics: {
      engineHealth: 0,
      brakeCondition: 0,
      suspensionStatus: 0,
      batteryHealth: 0,
      overallScore: 0
    }
  });

  const updatePerformanceScore = (metrics) => {
    const weights = {
      engineHealth: 0.4,
      brakeCondition: 0.25,
      suspensionStatus: 0.2,
      batteryHealth: 0.15
    };

    const overallScore = Object.keys(weights).reduce((score, metric) => {
      return score + (metrics[metric] * weights[metric]);
    }, 0);

    setMaintenanceData(prev => ({
      ...prev,
      performanceMetrics: {
        ...metrics,
        overallScore: Math.round(overallScore)
      }
    }));
  };

  const handleMetricUpdate = (metric, value) => {
    const updatedMetrics = {
      ...maintenanceData.performanceMetrics,
      [metric]: parseInt(value)
    };
    updatePerformanceScore(updatedMetrics);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>Maintenance Status</CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Last Service Date</label>
            <input
              type="date"
              value={maintenanceData.lastServiceDate}
              onChange={(e) => setMaintenanceData(prev => ({
                ...prev,
                lastServiceDate: e.target.value
              }))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Last Repair Date</label>
            <input
              type="date"
              value={maintenanceData.lastRepairDate}
              onChange={(e) => setMaintenanceData(prev => ({
                ...prev,
                lastRepairDate: e.target.value
              }))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Launch Date</label>
            <input
              type="date"
              value={maintenanceData.launchDate}
              onChange={(e) => setMaintenanceData(prev => ({
                ...prev,
                launchDate: e.target.value
              }))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Kilometers Travelled</label>
            <input
              type="number"
              value={maintenanceData.kmTravelled}
              onChange={(e) => setMaintenanceData(prev => ({
                ...prev,
                kmTravelled: parseInt(e.target.value)
              }))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Performance Metrics</h4>
            {Object.keys(maintenanceData.performanceMetrics)
              .filter(metric => metric !== 'overallScore')
              .map(metric => (
                <div key={metric}>
                  <label className="block mb-1">
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                    (0-100)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={maintenanceData.performanceMetrics[metric]}
                    onChange={(e) => handleMetricUpdate(metric, e.target.value)}
                    className="w-full"
                  />
                  <span>{maintenanceData.performanceMetrics[metric]}</span>
                </div>
              ))}
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-bold">Overall Performance Score</h4>
            <p className="text-2xl">
              {maintenanceData.performanceMetrics.overallScore}/100
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
