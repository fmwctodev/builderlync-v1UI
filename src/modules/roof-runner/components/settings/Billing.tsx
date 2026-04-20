import React, { useState } from 'react';
import { AlertTriangle, Sparkles, Camera, ExternalLink } from 'lucide-react';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { supabase } from '../../../../shared/lib/supabase';

interface BillingProps {
  userRole?: string;
}

const AI_CREDITS_PRICE_ID = 'price_ai_credits';
const MEASUREMENT_CREDITS_PRICE_ID = 'price_measurement_credits';

const Billing: React.FC<BillingProps> = ({ userRole = 'Owner' }) => {
  const { currentOrganization, currentOrganizationSlug } = useCurrentOrganization();
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingMeasurement, setLoadingMeasurement] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuyCredits = async (creditType: 'ai' | 'measurement') => {
    if (!currentOrganization) {
      setError('No organization selected');
      return;
    }

    const isAi = creditType === 'ai';
    const setLoading = isAi ? setLoadingAi : setLoadingMeasurement;
    const priceId = isAi ? AI_CREDITS_PRICE_ID : MEASUREMENT_CREDITS_PRICE_ID;

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to purchase credits');
        setLoading(false);
        return;
      }

      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/org/${currentOrganizationSlug}/settings/billing?purchase=success&type=${creditType}`;
      const cancelUrl = `${baseUrl}/org/${currentOrganizationSlug}/settings/billing?purchase=cancelled`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            price_id: priceId,
            success_url: successUrl,
            cancel_url: cancelUrl,
            mode: 'payment',
            metadata: {
              organization_id: currentOrganization.id,
              credit_type: creditType,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Billing & Subscription</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your subscription and payment methods</p>
      </div>

      {userRole !== 'Owner' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <p className="text-yellow-800 dark:text-yellow-200">Only account owners can manage billing settings.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Professional Plan</h4>
            <p className="text-gray-600 dark:text-gray-400">$497/month - Billed monthly</p>
          </div>
          <button
            className={`px-4 py-2 rounded-lg ${userRole === 'Owner'
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            disabled={userRole !== 'Owner'}
          >
            Change Plan
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Purchase Credits</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">AI Credits</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">For Sierra AI conversations and content generation</p>
              </div>
            </div>
            <button
              onClick={() => handleBuyCredits('ai')}
              disabled={loadingAi || userRole !== 'Owner'}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
            >
              {loadingAi ? (
                <span>Loading...</span>
              ) : (
                <>
                  Buy
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Measurement Credits</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">For property measurements and aerial reports</p>
              </div>
            </div>
            <button
              onClick={() => handleBuyCredits('measurement')}
              disabled={loadingMeasurement || userRole !== 'Owner'}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
            >
              {loadingMeasurement ? (
                <span>Loading...</span>
              ) : (
                <>
                  Buy
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-8 bg-primary-600 rounded flex items-center justify-center text-white text-xs font-bold">
              VISA
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">---- ---- ---- 4242</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expires 12/25</p>
            </div>
          </div>
          <button
            className={`px-4 py-2 rounded-lg ${userRole === 'Owner'
                ? 'text-primary-600 hover:underline dark:text-primary-400'
                : 'text-gray-400 cursor-not-allowed'
              }`}
            disabled={userRole !== 'Owner'}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
