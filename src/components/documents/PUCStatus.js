 // src/components/documents/PUCStatus.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { CircularProgress, Alert } from '@mui/material';
import { CheckSquare, AlertTriangle, Calendar, Upload } from 'lucide-react';

const PUCStatus = () => {
    const [file, setFile] = useState(null);
    const queryClient = useQueryClient();

    // Fetch PUC details
    const { data: pucData, isLoading, error } = useQuery('pucDetails', async () => {
        const response = await fetch('/api/documents/puc');
        if (!response.ok) throw new Error('Failed to fetch PUC details');
        return response.json();
    });

    // Upload new PUC document
    const uploadMutation = useMutation(
        async (formData) => {
            const response = await fetch('/api/documents/puc/upload', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Failed to upload PUC document');
            return response.json();
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('pucDetails');
                setFile(null);
            }
        }
    );

    const handleFileChange = (e) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('pucDocument', file);
        uploadMutation.mutate(formData);
    };

    const getStatusColor = (expiryDate) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return 'text-red-600 bg-red-100';
        if (daysUntilExpiry < 30) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    if (isLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error.message}</Alert>;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <CheckSquare className="w-6 h-6 mr-2" />
                    PUC Status
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Card */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Current Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Status</span>
                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(pucData?.expiryDate)}`}>
                                {new Date(pucData?.expiryDate) > new Date() ? 'Valid' : 'Expired'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Certificate Number</span>
                            <span className="font-medium">{pucData?.certificateNumber}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Expiry Date</span>
                            <span className="font-medium">
                                {new Date(pucData?.expiryDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Upload Card */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Certificate</h3>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                id="puc-upload"
                            />
                            <label
                                htmlFor="puc-upload"
                                className="cursor-pointer flex flex-col items-center justify-center"
                            >
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600">
                                    {file ? file.name : 'Click to upload PUC certificate'}
                                </span>
                            </label>
                        </div>
                        {file && (
                            <button
                                type="submit"
                                disabled={uploadMutation.isLoading}
                                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                            >
                                {uploadMutation.isLoading ? 'Uploading...' : 'Upload Certificate'}
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Warning Section */}
            {new Date(pucData?.expiryDate) < new Date() && (
                <div className="mt-6">
                    <Alert 
                        severity="warning"
                        icon={<AlertTriangle className="w-5 h-5" />}
                    >
                        Your PUC certificate has expired. Please get a new certificate as soon as possible to avoid penalties.
                    </Alert>
                </div>
            )}
        </div>
    );
};

export default PUCStatus;
