import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token');

export const SubscriptionsTab: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/stripe/subscriptions`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();
      setSubscriptions(result.data || []);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plan</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Billing Cycle</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Started</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Renewal Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {subscriptions.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                No subscriptions found
              </td>
            </tr>
          ) : (
            subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {sub.stripe_customers?.name || sub.stripe_customers?.email || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{sub.plan_name}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    sub.status === 'active' ? 'bg-green-100 text-green-800' :
                    sub.status === 'canceled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{sub.billing_cycle}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(sub.current_period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(sub.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
