 // src/components/documents/RCDetails.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { CircularProgress, Alert } from '@mui/material';
import { FileText, Edit2, Calendar, AlertTriangle, Save, X } from 'lucide-react';

const RCDetails = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        registrationNumber: '',
        registrationDate: '',
        expiryDate: '',
        ownerName: '',
        engineNumber: '',
        chassisNumber: '',
        vehicleClass: '',
        fuelType: '',
        makerModel: '',
        seatingCapacity: '',
        rtoLocation: '',
        insuranceValidity: ''
    });

    const queryClient = useQueryClient();

    // Fetch RC details
    const { data: rcData, isLoading, error } = useQuery('rcDetails', async () => {
        const response = await fetch('/api/documents/rc');
        if (!response.ok) throw new Error('Failed to fetch RC details');
        return response.json();
    });

    // Update RC details mutation
    const updateRCMutation = useMutation(
        async (updatedData) => {
            const response = await fetch('/api/documents/rc', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (!response.ok) throw new Error('Failed to update RC details');
            return response.json();
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('rcDetails');
                setIsEditing(false);
            }
        }
    );

    const handleEdit = () => {
        setFormData({
            registrationNumber: rcData?.registrationNumber || '',
            registrationDate: rcData?.registrationDate || '',
            expiryDate: rcData?.expiryDate || '',
            ownerName: rcData?.ownerName || '',
            engineNumber: rcData?.engineNumber || '',
            chassisNumber: rcData?.chassisNumber || '',
            vehicleClass: rcData?.vehicleClass || '',
            fuelType: rcData?.fuelType || '',
            makerModel: rcData?.makerModel || '',
            seatingCapacity: rcData?.seatingCapacity || '',
            rtoLocation: rcData?.rtoLocation || '',
            insuranceValidity: rcData?.insuranceValidity || ''
        });
        setIsEditing(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateRCMutation.mutate(formData);
    };

    const isExpiringSoon = (date) => {
        const expiryDate = new Date(date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30;
    };

    if (isLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error.message}</Alert>;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FileText className="w-6 h-6 mr-2" />
                    Registration Certificate Details
                </h2>
                {!isEditing && (
                    <button
                        onClick={handleEdit}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Details
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Registration Details */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Registration Number
                            </label>
                            <input
                                type="text"
                                value={formData.registrationNumber}
                                onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Registration Date
                            </label>
                            <input
                                type="date"
                                value={formData.registrationDate}
                                onChange={(e) => setFormData({...formData, registrationDate: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Expiry Date
                            </label>
                            <input
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Vehicle Details */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Engine Number
                            </label>
                            <input
                                type="text"
                                value={formData.engineNumber}
                                onChange={(e) => setFormData({...formData, engineNumber: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Chassis Number
                            </label>
                            <input
                                type="text"
                                value={formData.chassisNumber}
                                onChange={(e) => setFormData({...formData, chassisNumber: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Vehicle Class
                            </label>
                            <input
                                type="text"
                                value={formData.vehicleClass}
                                onChange={(e) => setFormData({...formData, vehicleClass: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Additional Details */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Fuel Type
                            </label>
                            <select
                                value={formData.fuelType}
                                onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Select Fuel Type</option>
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="CNG">CNG</option>
                                <option value="Electric">Electric</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                RTO Location
                            </label>
                            <input
                                type="text"
                                value={formData.rtoLocation}
                                onChange={(e) => setFormData({...formData, rtoLocation: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            <X className="w-4 h-4 mr-2 inline" />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateRCMutation.isLoading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                        >
                            <Save className="w-4 h-4 mr-2 inline" />
                            {updateRCMutation.isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Registration Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Registration Information</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Registration Number</span>
                                <span className="font-medium">{rcData?.registrationNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Registration Date</span>
                                <span className="font-medium">
                                    {new Date(rcData?.registrationDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Expiry Date</span>
                                <span className={`font-medium ${
                                    isExpiringSoon(rcData?.expiryDate) ? 'text-red-600' : ''
                                }`}>
                                    {new Date(rcData?.expiryDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Engine Number</span>
                                <span className="font-medium">{rcData?.engineNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Chassis Number</span>
                                <span className="font-medium">{rcData?.chassisNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Vehicle Class</span>
                                <span className="font-medium">{rcData?.vehicleClass}</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Fuel Type</span>
                                <span className="font-medium">{rcData?.fuelType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">RTO Location</span>
                                <span className="font-medium">{rcData?.rtoLocation}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Expiry Warning */}
            {isExpiringSoon(rcData?.expiryDate) && (
                <div className="mt-6">
                    <Alert 
                        severity="warning"
                        icon={<AlertTriangle className="w-5 h-5" />}
                    >
                        Your RC is expiring soon. Please initiate the renewal process to avoid any penalties.
                    </Alert>
                </div>
            )}
        </div>
    );
};

export default RCDetails;
