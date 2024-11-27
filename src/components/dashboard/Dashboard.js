 
// src/components/dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format, addDays } from 'date-fns';
import { useLocation } from '../../hooks/useLocation';
import { Alert, CircularProgress, Tabs, Tab, Box } from '@mui/material';
import { 
  Car, 
  Calendar, 
  AlertCircle, 
  DollarSign, 
  Droplet,
  FileText
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { coordinates } = useLocation();
  const [mileage, setMileage] = useState('');
  const queryClient = useQueryClient();

  // Fetch car details
  const { data: carDetails, isLoading: carLoading } = useQuery('carDetails', 
    async () => {
      const response = await fetch('/api/cars/details');
      return response.json();
    }
  );

  // Fetch reminders
  const { data: reminders } = useQuery('reminders', 
    async () => {
      const response = await fetch('/api/reminders');
      return response.json();
    }
  );

  // Fetch loan details
  const { data: loanDetails } = useQuery('loanDetails', 
    async () => {
      const response = await fetch('/api/loan/details');
      return response.json();
    }
  );

  // Update mileage mutation
  const updateMileageMutation = useMutation(
    async (newMileage) => {
      const response = await fetch('/api/cars/mileage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mileage: newMileage }),
      });
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('carDetails');
        setMileage('');
      },
    }
  );

  const handleMileageUpdate = () => {
    updateMileageMutation.mutate(mileage);
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} className="p-4">
      {value === index && children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Car Service Dashboard
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab icon={<Car className="w-4 h-4" />} label="Car Details" />
            <Tab icon={<Calendar className="w-4 h-4" />} label="Reminders" />
            <Tab icon={<DollarSign className="w-4 h-4" />} label="Loan & Payments" />
            <Tab icon={<FileText className="w-4 h-4" />} label="Documents" />
          </Tabs>
        </Box>

        {/* Car Details Tab */}
        <TabPanel value={activeTab} index={0}>
          <div className="bg-white rounded-lg shadow p-6">
            {carLoading ? (
              <div className="flex justify-center">
                <CircularProgress />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Vehicle Information</h3>
                    <dl className="mt-2 space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Model</dt>
                        <dd className="text-sm text-gray-900">{carDetails?.model}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
                        <dd className="text-sm text-gray-900">{carDetails?.registration_no}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Current Mileage</dt>
                        <dd className="text-sm text-gray-900">{carDetails?.current_mileage} km</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Update Mileage</h3>
                    <div className="mt-2">
                      <input
                        type="number"
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter new mileage"
                      />
                      <button
                        onClick={handleMileageUpdate}
                        disabled={updateMileageMutation.isLoading}
                        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {updateMileageMutation.isLoading ? 'Updating...' : 'Update Mileage'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Location Updates */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">Current Location</h3>
                  {coordinates ? (
                    <p className="mt-2 text-sm text-gray-600">
                      Lat: {coordinates.latitude}, Long: {coordinates.longitude}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">
                      Location services not available
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabPanel>

        {/* Reminders Tab */}
        <TabPanel value={activeTab} index={1}>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Upcoming Reminders</h3>
              <div className="mt-6 space-y-4">
                {reminders?.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-start p-4 border rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {reminder.type === 'service' && <Droplet className="w-5 h-5 text-blue-500" />}
                      {reminder.type === 'document' && <FileText className="w-5 h-5 text-green-500" />}
                      {reminder.type === 'loan' && <DollarSign className="w-5 h-5 text-yellow-500" />}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{reminder.title}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Due: {format(new Date(reminder.due_date), 'PPP')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabPanel>

        {/* Loan & Payments Tab */}
        <TabPanel value={activeTab} index={2}>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Loan Details</h3>
              {loanDetails && (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500">Loan Amount</h4>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      ₹{loanDetails.loan_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500">EMI Amount</h4>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      ₹{loanDetails.emi_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500">Interest Rate</h4>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {loanDetails.interest_rate}%
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500">Remaining Tenure</h4>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {loanDetails.remaining_months} months
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabPanel>

        {/* Documents Tab */}
        <TabPanel value={activeTab} index={3}>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Document Status</h3>
              <div className="mt-6 space-y-4">
                {carDetails?.documents?.map((doc) => (
                  <div
                    key={doc.type}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.type}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          Expires: {format(new Date(doc.expiry_date), 'PPP')}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        new Date(doc.expiry_date) > new Date()
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {new Date(doc.expiry_date) > new Date() ? 'Valid' : 'Expired'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabPanel>
      </main>
    </div>
  );
};

export default Dashboard;