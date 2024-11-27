 // src/components/payments/EMICalculator.js
import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { Calculator, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const EMICalculator = () => {
    const [loanAmount, setLoanAmount] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [tenure, setTenure] = useState('');
    const [emi, setEMI] = useState(0);
    const [loading, setLoading] = useState(false);
    const [breakup, setBreakup] = useState([]);

    const calculateEMI = () => {
        setLoading(true);
        const P = parseFloat(loanAmount);
        const R = parseFloat(interestRate) / (12 * 100); // Monthly interest rate
        const N = parseFloat(tenure) * 12; // Total number of months

        // EMI calculation formula: P * R * (1 + R)^N / ((1 + R)^N - 1)
        const emiAmount = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1);
        setEMI(emiAmount);

        // Calculate payment breakup
        let balance = P;
        const newBreakup = [];
        let totalInterest = 0;
        let totalPrincipal = 0;

        for (let i = 1; i <= N; i++) {
            const interest = balance * R;
            const principal = emiAmount - interest;
            balance = balance - principal;
            totalInterest += interest;
            totalPrincipal += principal;

            if (i % 12 === 0) { // Yearly data points
                newBreakup.push({
                    year: i / 12,
                    principalPaid: totalPrincipal,
                    interestPaid: totalInterest,
                    balance: balance > 0 ? balance : 0
                });
            }
        }

        setBreakup(newBreakup);
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <Calculator className="w-6 h-6 mr-2" />
                EMI Calculator
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Loan Amount (₹)
                        </label>
                        <input
                            type="number"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Enter loan amount"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Interest Rate (% per annum)
                        </label>
                        <input
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Enter interest rate"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Loan Tenure (Years)
                        </label>
                        <input
                            type="number"
                            value={tenure}
                            onChange={(e) => setTenure(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Enter loan tenure"
                        />
                    </div>

                    <button
                        onClick={calculateEMI}
                        disabled={loading || !loanAmount || !interestRate || !tenure}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        {loading ? <CircularProgress size={20} /> : 'Calculate EMI'}
                    </button>
                </div>

                {/* Results Display */}
                {emi > 0 && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">EMI Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Monthly EMI</span>
                                    <span className="font-medium">₹{emi.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total Interest</span>
                                    <span className="font-medium">
                                        ₹{(emi * tenure * 12 - loanAmount).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total Amount</span>
                                    <span className="font-medium">₹{(emi * tenure * 12).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Breakup Chart */}
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Breakup</h3>
                            <div className="h-64">
                                <LineChart
                                    width={500}
                                    height={250}
                                    data={breakup}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" label={{ value: 'Years', position: 'bottom' }} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="principalPaid" stroke="#4F46E5" name="Principal Paid" />
                                    <Line type="monotone" dataKey="interestPaid" stroke="#10B981" name="Interest Paid" />
                                    <Line type="monotone" dataKey="balance" stroke="#EF4444" name="Balance" />
                                </LineChart>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EMICalculator;
