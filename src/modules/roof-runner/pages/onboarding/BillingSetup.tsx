import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Check, Loader } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingApi } from '../../../../shared/services/onboardingApi';
import { useSupabaseUser } from '../../../../shared/hooks/useSupabaseUser';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';

export const BillingSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseUser();
  const { currentOrganization } = useCurrentOrganization();
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExistingConfig();
  }, [currentOrganization?.id]);

  const loadExistingConfig = async () => {
    if (!currentOrganization?.id) return;

    try {
      const settings = await onboardingApi.getSettings(currentOrganization.id);
      if (settings?.billing_config) {
        if (settings.billing_config.plan) setSelectedPlan(settings.billing_config.plan);
        if (settings.billing_config.interval) setBillingInterval(settings.billing_config.interval);
      }
    } catch (err) {
      console.error('Error loading billing config:', err);
    }
  };

  const handleSave = async () => {
    if (!user || !currentOrganization?.id) return;

    setSaving(true);
    try {
      await onboardingApi.updateBillingConfig(currentOrganization.id, {
        plan: selectedPlan,
        interval: billingInterval,
        confirmed_at: new Date().toISOString(),
      });

      await onboardingApi.completeStep(user.id, currentOrganization.id, 8);
      navigate('/onboarding/ai-agent');
    } catch (err) {
      console.error('Error saving billing config:', err);
    } finally {
      setSaving(false);
    }
  };

  const plans = [
    {
      id: 'professional',
      name: 'Professional',
      monthlyPrice: 497,
      annualPrice: 4970,
      features: [
        'Unlimited contacts & jobs',
        'Advanced CRM & pipeline',
        'AI-powered assistant',
        'Phone system integration',
        'Email & SMS campaigns',
        'Team collaboration tools',
        'Custom reports & analytics',
        'QuickBooks integration',
      ],
    },
  ];

  const currentPlan = plans.find((p) => p.id === selectedPlan)!;
  const displayPrice = billingInterval === 'monthly' ? currentPlan.monthlyPrice : Math.floor(currentPlan.annualPrice / 12);

  return (
    <OnboardingLayout
      currentStep={8}
      title="Confirm Your Plan"
      description="Review your subscription details before completing onboarding."
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 border-2 border-red-500 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentPlan.name} Plan
              </h3>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${displayPrice}
                </span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
                {billingInterval === 'annual' && (
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Save ${(currentPlan.monthlyPrice * 12 - currentPlan.annualPrice).toFixed(0)}/year
                  </span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Billing Interval
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  billingInterval === 'monthly'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white">Monthly</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ${currentPlan.monthlyPrice}/month
                </div>
              </button>
              <button
                onClick={() => setBillingInterval('annual')}
                className={`p-3 rounded-lg border-2 transition-colors relative ${
                  billingInterval === 'annual'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 17%
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">Annual</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ${Math.floor(currentPlan.annualPrice / 12)}/month
                </div>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              What's Included:
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Payment Information
          </h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expires 12/25</p>
              </div>
            </div>
            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
              Update
            </button>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                30-Day Money-Back Guarantee
              </h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                Try risk-free. If you're not satisfied within the first 30 days, we'll refund your payment in full.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/onboarding/branding')}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {saving && <Loader className="w-4 h-4 animate-spin" />}
          <span>Continue</span>
        </button>
      </div>
    </OnboardingLayout>
  );
};
