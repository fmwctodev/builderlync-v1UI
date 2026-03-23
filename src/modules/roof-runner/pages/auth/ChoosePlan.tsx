import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Building2, Crown } from 'lucide-react';
import { supabase } from '../../../../shared/lib/supabase';

const ChoosePlan: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = {
    starter: {
      name: 'Starter',
      monthlyPrice: 497,
      annualPrice: 4970,
      description: 'For contractors who want full control — build your own automations, templates, and workflows at your own pace.',
      features: [
        '5,000 SMS messages/month',
        '1,000 MMS messages/month',
        '2,000 call minutes/month',
        '500 AI minutes/month',
        '10,000 emails sent/month',
        '50 GB storage',
        'Unlimited seats',
        '50,000 API calls/month',
        'Full CRM access',
        'Pipeline management',
        'Proposals & invoices',
        'Basic integrations',
      ],
      icon: Zap,
      color: 'red',
    },
    pro: {
      name: 'Pro',
      monthlyPrice: 997,
      annualPrice: 9970,
      description: 'For contractors ready to scale — automation, pre-built workflows, and AI tools fully configured from day one.',
      features: [
        '15,000 SMS messages/month',
        '3,000 MMS messages/month',
        '6,000 call minutes/month',
        '2,000 AI minutes/month',
        '50,000 emails sent/month',
        '200 GB storage',
        'Unlimited seats',
        '200,000 API calls/month',
        'Advanced AI agent',
        'Pre-built automations',
        'Premium integrations',
        'Priority support',
      ],
      icon: Crown,
      color: 'yellow',
      popular: true,
    },
  };

  const getPrice = (plan: typeof plans.starter) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice / 12;
  };

  const getSavings = () => {
    if (billingCycle === 'annual') {
      return '2 months free!';
    }
    return null;
  };

  const handleSelectPlan = async (planName: 'Starter' | 'Pro') => {
    try {
      setLoading(true);
      setError('');

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('You must be logged in to select a plan');
        return;
      }

      // Get user's organization
      const { data: orgMember, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (orgError || !orgMember) {
        setError('Organization not found. Please complete signup first.');
        return;
      }

      // Get organization slug for redirect URL
      const { data: org, error: orgFetchError } = await supabase
        .from('organizations')
        .select('slug')
        .eq('id', orgMember.organization_id)
        .single();

      if (orgFetchError || !org) {
        console.error('Error fetching organization:', orgFetchError);
        setError('Failed to load organization details');
        return;
      }

      // Update organization with selected plan
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          selected_plan: planName,
          subscription_tier: planName,
          subscription_status: 'pending_payment',
        })
        .eq('id', orgMember.organization_id);

      if (updateError) {
        console.error('Error updating organization:', updateError);
        setError('Failed to save plan selection');
        return;
      }

      // Get plan price ID from plan_definitions
      const { data: planDef, error: planError } = await supabase
        .from('plan_definitions')
        .select('stripe_price_id')
        .eq('name', planName)
        .eq('billing_interval', billingCycle)
        .single();

      if (planError || !planDef?.stripe_price_id) {
        console.error('Plan definition not found:', planError);
        setError('Plan configuration error. Please contact support.');
        return;
      }

      // Create Stripe checkout session
      const { data: session, error: stripeError } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: planDef.stripe_price_id,
          mode: 'subscription',
          success_url: `${window.location.origin}/org/${org.slug}/dashboard`,
          cancel_url: `${window.location.origin}/auth/choose-plan`,
        },
      });

      if (stripeError || !session?.url) {
        console.error('Stripe checkout error:', stripeError);
        setError('Failed to create payment session. Please try again.');
        return;
      }

      // Redirect to Stripe checkout
      window.location.href = session.url;
    } catch (err: any) {
      console.error('Error selecting plan:', err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleEnterpriseContact = () => {
    window.location.href = 'mailto:sales@builderlync.com?subject=Enterprise Plan Inquiry';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mx-auto mb-6">
            <img src="/logo/icon.png" alt="BuilderLync" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your business. All plans include full access to the platform with no hidden fees.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-white rounded-full p-1 shadow-md inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              {billingCycle === 'annual' && (
                <span className="ml-2 text-xs bg-yellow-400 text-gray-900 px-2 py-1 rounded-full">
                  Save 17%
                </span>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Starter Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-red-300 transition-all">
            <div className="flex items-center mb-4">
              <Zap className="w-10 h-10 text-red-600 mr-3" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
              </div>
            </div>
            <p className="text-gray-600 mb-6 min-h-[60px]">
              {plans.starter.description}
            </p>
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-5xl font-bold text-gray-900">
                  ${getPrice(plans.starter).toFixed(0)}
                </span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-sm text-green-600 mt-2">
                  ${plans.starter.annualPrice}/year - {getSavings()}
                </p>
              )}
            </div>
            <button
              onClick={() => handleSelectPlan('Starter')}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {loading ? 'Processing...' : 'Get Started'}
            </button>
            <ul className="space-y-3">
              {plans.starter.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-yellow-400 hover:border-yellow-500 transition-all relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </span>
            </div>
            <div className="flex items-center mb-4">
              <Crown className="w-10 h-10 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
              </div>
            </div>
            <p className="text-gray-600 mb-6 min-h-[60px]">
              {plans.pro.description}
            </p>
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-5xl font-bold text-gray-900">
                  ${getPrice(plans.pro).toFixed(0)}
                </span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-sm text-green-600 mt-2">
                  ${plans.pro.annualPrice}/year - {getSavings()}
                </p>
              )}
            </div>
            <button
              onClick={() => handleSelectPlan('Pro')}
              disabled={loading}
              className="w-full bg-yellow-500 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {loading ? 'Processing...' : 'Get Started'}
            </button>
            <ul className="space-y-3">
              {plans.pro.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Enterprise Option */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center">
                <Building2 className="w-12 h-12 text-white mr-4" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                  <p className="text-gray-300">
                    For multi-location, franchise, or enterprise contractors. Custom pricing and features tailored to your needs.
                  </p>
                </div>
              </div>
              <button
                onClick={handleEnterpriseContact}
                className="bg-white text-gray-900 py-3 px-8 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Compare Plans
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Starter</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Pro</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">SMS Messages/month</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">5,000</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">15,000</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">50,000+</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Call Minutes/month</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">2,000</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">6,000</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">20,000+</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">AI Agent Minutes</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">500</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">2,000</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">10,000+</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Storage</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">50 GB</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">200 GB</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">500 GB+</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Pre-built Automations</td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Priority Support</td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">White Label</td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoosePlan;
