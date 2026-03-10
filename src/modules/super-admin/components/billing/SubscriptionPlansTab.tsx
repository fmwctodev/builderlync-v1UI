import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token');

export const SubscriptionPlansTab: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/stripe/plans`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();
      setPlans(result.data || []);
    } catch (error) {
      console.error('Failed to load plans:', error);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.length === 0 ? (
        <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No subscription plans found</p>
        </div>
      ) : (
        plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                {plan.description && (
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                )}
              </div>
              <button
                onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedPlan === plan.id ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {expandedPlan === plan.id && (
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="text-sm">
                  <p className="text-gray-600 mb-3"><strong>Product ID:</strong> {plan.stripe_product_id}</p>
                  {/* <p className="text-gray-600 mt-2"><strong>Status:</strong> {plan.active ? 'Active' : 'Inactive'}</p> */}
                  {plan.metadata && Object.keys(plan.metadata).length > 0 && (
                    <p className="text-gray-600 mt-2"><strong>Metadata:</strong> {JSON.stringify(plan.metadata)}</p>
                  )}
                </div>
              </div>
            )}
            <div className="space-y-3">
              {plan.prices?.map((price: any) => (
                <div key={price.id} className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {price.recurring_interval ? `${price.recurring_interval.charAt(0).toUpperCase() + price.recurring_interval.slice(1)}` : 'One-time'}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {price.currency.toUpperCase()} {(price.unit_amount / 100).toFixed(2)}
                    </span>
                  </div>
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                    price.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {price.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
