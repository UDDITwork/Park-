// src/components/documents/LicenseInfo.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { CircularProgress, Alert } from '@mui/material';
import { FileText, Edit2, Save, X } from 'lucide-react';

const LicenseInfo = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        licenseNumber: '',
        issuedDate: '',
        expiryDate: '',
        issuingAuthority: '',
        vehicleClass: ''
    });

    const queryClient = useQueryClient();

    // Fetch license details
    const { data: licenseData, isLoading, error } = useQuery('licenseDetails', async () => {
        const response = await fetch('/api/documents/license');
        if (!response.ok) throw new Error('Failed to fetch license details');
        return response.json();
    });

    // Update license details mutation
    const updateLicenseMutation = useMutation(
        async (updatedData) => {
            const response = await fetch('/api/documents/license', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (!response.ok) throw new Error('Failed to update license details');
            return response.json();
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('licenseDetails');
                setIsEditing(false);
            }
        }
    );

    const handleEdit = () => {
        setFormData({
            licenseNumber: licenseData?.licenseNumber || '',
            issuedDate: licenseData?.issuedDate || '',
            expiryDate: licenseData?.expiryDate || '',
            issuingAuthority: licenseData?.issuingAuthority || '',
            vehicleClass: licenseData?.vehicleClass || ''
        });
        setIsEditing(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateLicenseMutation.mutate(formData);
    };

    if (isLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error.message}</Alert>;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FileText className="w-6 h-6 mr-2" />
                    Driving License Information
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                License Number
                            </label>
                            <input
                                type="text"
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Issued Date
                            </label>
                            <input
                                type="date"
                                value={formData.issuedDate}
                                onChange={(e) => setFormData({...formData, issuedDate: e.target.value})}
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Issuing Authority
                            </label>
                            <input
                                type="text"
                                value={formData.issuingAuthority}
                                onChange={(e) => setFormData({...formData, issuingAuthority: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateLicenseMutation.isLoading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                        >
                            {updateLicenseMutation.isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">License Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">License Number</span>
                                <span className="font-medium">{licenseData?.licenseNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Vehicle Class</span>
                                <span className="font-medium">{licenseData?.vehicleClass}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Validity</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Issued Date</span>
                                <span className="font-medium">
                                    {new Date(licenseData?.issuedDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Expiry Date</span>
                                <span className="font-medium">
                                    {new Date(licenseData?.expiryDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LicenseInfo; 
