 // src/components/payments/LoanDetails.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { CircularProgress, Alert } from '@mui/material';
import { DollarSign, Calendar, AlertTriangle, Edit2, Save, X } from 'lucide-react';
import { format, addMonths, isBefore } from 'date-fns';

const LoanDetails = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        loanAmount: '',
        interestRate: '',
        tenure: '',
        startDate: '',
        emiAmount: '',
        bankName: '',
        accountNumber: '',
        loanAccountNumber: '',
        nextEmiDate: '',
        totalAmountPaid: '',
        remainingAmount: ''
    });

    const queryClient = useQueryClient();

    // Fetch loan details
    const { data: loanData, isLoading, error } = useQuery('loanDetails', async () => {
        const response = await fetch('/api/payments/loan');
        if (!response.ok) throw new Error('Failed to fetch loan details');
        return response.json();
    });

    // Update loan details mutation
    const updateLoanMutation = useMutation(
        async (updatedData) => {
            const response = await fetch('/api/payments/loan', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (!response.ok) throw new Error('Failed to update loan details');
            return response.json();
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('loanDetails');
                setIsEditing(false);
            }
        }
    );

    // Record EMI payment mutation
    const recordEmiMutation = useMutation(
        async (paymentData) => {
            const response = await fetch('/api/payments/emi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            });
            if (!response.ok) throw new Error('Failed to record EMI payment');
            return response.json();
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('loanDetails');
            }
        }
    );

    const handleEdit = () => {
        setFormData({
            loanAmount: loanData?.loanAmount || '',
            interestRate: loanData?.interestRate || '',
            tenure: loanData?.tenure || '',
            startDate: loanData?.startDate || '',
            emiAmount: loanData?.emiAmount || '',
            bankName: loanData?.bankName || '',
            accountNumber: loanData?.accountNumber || '',
            loanAccountNumber: loanData?.loanAccountNumber || '',
            nextEmiDate: loanData?.nextEmiDate || '',
            totalAmountPaid: loanData?.totalAmountPaid || '',
            remainingAmount: loanData?.remainingAmount || ''
        });
        setIsEditing(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateLoanMutation.mutateAsync(formData);
    };

    const handleRecordEMI = async () => {
        const paymentData = {
            amount: loanData?.emiAmount,
            paymentDate: new Date().toISOString(),
            paymentMethod: 'auto-debit'
        };
        await recordEmiMutation.mutateAsync(paymentData);
    };

    const calculateProgress = () => {
        if (!loanData) return 0;
        const totalAmount = loanData.loanAmount;
        const paid = loanData.totalAmountPaid;
        return (paid / totalAmount) * 100;
    };

    if (isLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error.message}</Alert>;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <DollarSign className="w-6 h-6 mr-2" />
                    Loan Details
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
                            <input
                                type="number"
                                value={formData.loanAmount}
                                onChange={(e) => setFormData({...formData, loanAmount: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.interestRate}
                                onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tenure (months)</label>
                            <input
                                type="number"
                                value={formData.tenure}
                                onChange={(e) => setFormData({...formData, tenure: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">EMI Amount</label>
                            <input
                                type="number"
                                value={formData.emiAmount}
                                onChange={(e) => setFormData({...formData, emiAmount: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                            <input
                                type="text"
                                value={formData.bankName}
                                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Loan Account Number</label>
                            <input
                                type="text"
                                value={formData.loanAccountNumber}
                                onChange={(e) => setFormData({...formData, loanAccountNumber: e.target.value})}
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
                            <X className="w-4 h-4 mr-2 inline" />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateLoanMutation.isLoading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                        >
                            <Save className="w-4 h-4 mr-2 inline" />
                            {updateLoanMutation.isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Loan Progress</span>
                            <span className="text-sm font-medium text-gray-700">
                                {calculateProgress().toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-indigo-600 h-2.5 rounded-full"
                                style={{ width: `${calculateProgress()}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Loan Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Loan Amount</span>
                                    <span className="font-medium">₹{loanData?.loanAmount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Interest Rate</span>
                                    <span className="font-medium">{loanData?.interestRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tenure</span>
                                    <span className="font-medium">{loanData?.tenure} months</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">EMI Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">EMI Amount</span>
                                    <span className="font-medium">₹{loanData?.emiAmount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Next EMI Date</span>
                                    <span className="font-medium">
                                        {format(new Date(loanData?.nextEmiDate), 'dd MMM yyyy')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">EMIs Paid</span>
                                    <span className="font-medium">{loanData?.emiPaid} of {loanData?.totalEmis}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total Paid</span>
                                    <span className="font-medium">₹{loanData?.totalAmountPaid?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Remaining Amount</span>
                                    <span className="font-medium">₹{loanData?.remainingAmount?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Bank Name</span>
                                <span className="font-medium">{loanData?.bankName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Loan Account Number</span>
                                <span className="font-medium">{loanData?.loanAccountNumber}</span>
                            </div>
                        </div>
                    </div>

                    {/* EMI Payment Action */}
                    {loanData?.nextEmiDate && isBefore(new Date(loanData.nextEmiDate), new Date()) && (
                        <div className="mt-6">
                            <Alert 
                                severity="warning"
                                icon={<AlertTriangle className="w-5 h-5" />}
                                action={
                                    <button
                                        onClick={handleRecordEMI}
                                        disabled={recordEmiMutation.isLoading}
                                        className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                                    >
                                        {recordEmiMutation.isLoading ? 'Recording...' : 'Record Payment'}
                                    </button>
                                }
                            >
                                EMI payment is due. Please ensure timely payment to avoid late fees.
                            </Alert>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LoanDetails;
