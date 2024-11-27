 // src/components/dashboard/CarDetails.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { Alert, CircularProgress } from '@mui/material';
import {
  Car,
  Calendar,
  FileText,
  Tool,
  Droplet,
  AlertTriangle
} from 'lucide-react';

const CarDetails = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    mileage: '',
    lastServiceDate: '',
    nextServiceDue: '',
    fuelType: '',
    engineOil: '',
    tyreCondition: ''
  });

  // Fetch car details
  const { data: carData, isLoading, error } = useQuery('carDetails', async () => {
    const response = await fetch('/api/car/details');
    if (!response.ok) {
      throw new Error('Failed to fetch car details');
    }
    return response.json();
  });

  // Update car details mutation
  const updateCarMutation = useMutation(
    async (updatedData) => {
      const response = await fetch('/api/car/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error('Failed to update car details');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('carDetails');
        setIsEditing(false);
      },
    }
  );

  const handleEdit = () => {
    setFormData({
      mileage: carData?.mileage || '',
      lastServiceDate: carData?.lastServiceDate || '',
      nextServiceDue: carData?.nextServiceDue || '',
      fuelType: carData?.fuelType || '',
      engineOil: carData?.engineOil || '',
      tyreCondition: carData?.tyreCondition || ''
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateCarMutation.mutateAsync(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="mb-4">
        {error.message}
      </Alert>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Car className="w-6 h-6 mr-2" />
          Vehicle Details
        </h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Edit Details
          </button>
        )}
      </div>

      {/* Main Content */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mileage Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Mileage
              </label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Last Service Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Service Date
              </label>
              <input
                type="date"
                name="lastServiceDate"
                value={formData.lastServiceDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fuel Type
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Fuel Type</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="cng">CNG</option>
                <option value="electric">Electric</option>
              </select>
            </div>

            {/* Engine Oil Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Engine Oil Status
              </label>
              <select
                name="engineOil"
                value={formData.engineOil}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Status</option>
                <option value="good">Good</option>
                <option value="needsChange">Needs Change</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Tyre Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tyre Condition
              </label>
              <select
                name="tyreCondition"
                value={formData.tyreCondition}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Condition</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="needsReplacement">Needs Replacement</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateCarMutation.isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {updateCarMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Vehicle Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Model</span>
                  <span className="font-medium">{carData?.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Registration Number</span>
                  <span className="font-medium">{carData?.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fuel Type</span>
                  <span className="font-medium capitalize">{carData?.fuelType}</span>
                </div>
              </div>
            </div>

            {/* Service Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Service Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Service</span>
                  <span className="font-medium">
                    {carData?.lastServiceDate ? 
                      format(new Date(carData.lastServiceDate), 'dd MMM yyyy') : 
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Next Service Due</span>
                  <span className="font-medium">
                    {carData?.nextServiceDue ? 
                      format(new Date(carData.nextServiceDue), 'dd MMM yyyy') : 
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Mileage</span>
                  <span className="font-medium">{carData?.mileage} km</span>
                </div>
              </div>
            </div>

            {/* Maintenance Indicators */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Engine Oil</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    carData?.engineOil === 'good' ? 'bg-green-100 text-green-800' :
                    carData?.engineOil === 'needsChange' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {carData?.engineOil === 'good' ? 'Good' :
                     carData?.engineOil === 'needsChange' ? 'Needs Change' :
                     'Critical'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Tyre Condition</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    carData?.tyreCondition === 'excellent' ? 'bg-green-100 text-green-800' :
                    carData?.tyreCondition === 'good' ? 'bg-green-100 text-green-800' :
                    carData?.tyreCondition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {carData?.tyreCondition}
                  </span>
                </div>
              </div>
            </div>

            {/* Alerts & Reminders */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Alerts & Reminders</h3>
              {carData?.alerts?.length > 0 ? (
                <div className="space-y-3">
                  {carData.alerts.map((alert, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{alert}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No active alerts</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDetails;
