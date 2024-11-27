 // src/components/payments/Subscription.js
import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { CircularProgress, Alert } from '@mui/material';
import { CreditCard, Check, X } from 'lucide-react';

const Subscription = () => {
    const queryClient = useQueryClient();

    // Fetch subscription plans
    const { data: plans, isLoading, error } = useQuery('subscriptionPlans', async () => {
        const response = await fetch('/api/subscriptions/plans');
        if (!response.ok) throw new Error('Failed to fetch subscription plans');
        return response.json();
    });

    // Subscribe mutation
    const subscribeMutation = useMutation(
        async (planId) => {
            const response = await fetch('/api/subscriptions/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
            });
            if (!response.ok) throw new Error('Failed to subscribe');
            return response.json();
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('userSubscription');
            }
        }
    );

    const handleSubscribe = async (planId) => {
        try {
            await subscribeMutation.mutateAsync(planId);
        } catch (error) {
            console.error('Subscription error:', error);
        }
    };

    if (isLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error.message}</Alert>;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <CreditCard className="w-6 h-6 mr-2" />
                Subscription Plans
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans?.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative rounded-lg border ${
                            plan.recommended ? 'border-indigo-500' : 'border-gray-200'
                        } p-6 shadow-sm`}
                    >
                        {plan.recommended && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm">
                                    Recommended
                                </span>
                            </div>
                        )}

                        <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                        <p className="mt-4">
                            <span className="text-4xl font-bold">₹{plan.price}</span>
                            <span className="text-gray-500">/{plan.interval}</span>
                        </p>

                        <ul className="mt-6 space-y-4">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={subscribeMutation.isLoading}
                            className={`mt-8 w-full px-4 py-2 rounded-md ${
                                plan.recommended
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                            } disabled:opacity-50`}
                        >
                            {subscribeMutation.isLoading ? 'Processing...' : 'Subscribe Now'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Features Comparison */}
            <div className="mt-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Features Comparison</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Feature
                                </th>
                                {plans?.map((plan) => (
                                    <th key={plan.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {plan.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {plans?.[0]?.featureDetails?.map((feature, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {feature.name}
                                    </td>
                                    {plans?.map((plan) => (
                                        <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {plan.featureDetails[index].included ? (
                                                <Check className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <X className="w-5 h-5 text-red-500" />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
