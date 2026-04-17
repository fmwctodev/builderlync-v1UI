import React, { useEffect } from 'react';
import { Check, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../shared/store/hooks';
import { logoutAndRedirect } from '../../../shared/utils/auth';

const PublicBilling: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAppSelector((state) => state.auth);
  console.log("user", user);
  const isStaff = user?.user_type === 'staff' || !!user?.parentId;
  
  const hasBillingAccess = !!(
    isStaff ||
    user?.is_beta_user ||
    user?.has_active_subscription ||
    user?.subscription_status === 'active' ||
    user?.subscription_status === 'trialing'
  );

  useEffect(() => {
    // Staff users should never see the billing page, they should be redirected to the dashboard
    if (isStaff && user && token) {
      const orgSlug = user.companySlug || localStorage.getItem('currentOrganizationSlug');
      if (orgSlug) {
        navigate(`/org/${orgSlug}`, { replace: true });
        return;
      }
      navigate('/', { replace: true });
      return;
    }

    if (!user || !token || !hasBillingAccess) {
      return;
    }

    const orgSlug = user.companySlug || localStorage.getItem('currentOrganizationSlug');
    if (orgSlug) {
      navigate(`/org/${orgSlug}`, { replace: true });
      return;
    }

    navigate('/', { replace: true });
  }, [user, token, hasBillingAccess, isStaff, navigate]);


  const plans = [
    {
      name: 'Starter',
      price: '$497',
      period: '/ month',
      description: 'The foundation for your construction business to scale efficiently.',
      features: [
        'Full CRM access',
        '2 Staff Users',
        'Job Tracking',
        'Basic Proposals',
        'Email Integration',
        '24/7 Support'
      ],
      buttonText: 'Get Started',
      highlight: false
    },
    {
      name: 'Pro',
      price: '$997',
      period: '/ month',
      description: 'Advanced tools for companies looking to dominate their market.',
      features: [
        'Everything in Starter',
        'Unlimited Staff Users',
        'Advanced Analytics',
        'Custom Contract Templates',
        'Priority Phone Support',
        'Initial Training Session'
      ],
      buttonText: 'Get Started',
      highlight: true,
      tag: 'Best Value'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Tailored solutions for large-scale construction organizations.',
      features: [
        'Multi-Org Management',
        'Custom Integrations',
        'Dedicated Account Manager',
        'On-site Training',
        'SLA Guarantees',
        'Custom Feature Requests'
      ],
      buttonText: 'Contact Sales',
      highlight: false
    }
  ];

  const comparisonFeatures = [
    { category: 'CRM', starter: true, pro: true, enterprise: true },
    { category: 'Jobs', starter: true, pro: true, enterprise: true },
    { category: 'Staff', starter: '2 Users', pro: 'Unlimited', enterprise: 'Unlimited' },
    { category: 'AI Tools', starter: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
    { category: 'Support', starter: 'Email', pro: 'Email/Phone', enterprise: 'Dedicated' },
  ];
  const handlePurchase = async (priceId: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      console.log('Initiating checkout session...');

      const headers: any = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const email = searchParams.get('email');

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/billing/checkout/create-session`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          priceId: priceId,
          email: email,
          successUrl: `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/billing/cancel`
        })
      });

      const data = await response.json();
      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        throw new Error(data.message || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Purchase error:', err);
      alert('Error initiating purchase. Please try again or contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-red-500/30">
      {/* Red Alert Banner */}
      <div className="bg-red-600/10 border-b border-red-500/20 py-3 px-4 text-center">
        <p className="text-sm font-medium text-red-400">
          Subscribe to the BuilderLync Starter Plan to unlock full access.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex justify-end mb-8">
          <button
            type="button"
            onClick={logoutAndRedirect}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Two Plans. One System<br />
            Built to <span className="text-red-600">Win Jobs Faster.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Unlock Full Access. Choose a plan to finish your registration and start managing your business like a pro.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${plan.highlight
                ? 'bg-[#151515] border-red-600 shadow-2xl shadow-red-900/10 scale-105 z-10'
                : 'bg-[#111111] border-gray-800 hover:border-gray-700'
                }`}
            >
              {plan.tag && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {plan.tag}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                <span className="text-gray-500 ml-1">{plan.period}</span>
              </div>

              <button
                className={`w-full py-4 rounded-xl font-bold transition-all ${plan.highlight
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                onClick={() => {
                  if (plan.name === 'Enterprise') window.location.href = 'mailto:sales@builderlync.com';
                  else handlePurchase('annual'); // We use annual by default as requested
                }}
              >
                {plan.buttonText}
              </button>

              <div className="mt-8 space-y-4">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start">
                    <Check className="text-red-600 mt-0.5 mr-3 flex-shrink-0" size={18} />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Pricing Summary Table</h2>
          <p className="text-gray-500">Compare the features and see what fits you.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#111111] p-1">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-6 text-gray-400 font-medium">Category</th>
                <th className="p-6 text-white font-bold">Starter</th>
                <th className="p-6 text-white font-bold text-red-500">Pro</th>
                <th className="p-6 text-white font-bold">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {comparisonFeatures.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-6 text-gray-300 text-sm font-medium">{row.category}</td>
                  <td className="p-6 text-sm">
                    {typeof row.starter === 'boolean' ? (row.starter ? <Check size={18} className="text-green-500" /> : <X size={18} className="text-gray-600" />) : row.starter}
                  </td>
                  <td className="p-6 text-sm text-red-400">
                    {typeof row.pro === 'boolean' ? (row.pro ? <Check size={18} className="text-red-500" /> : <X size={18} className="text-gray-600" />) : row.pro}
                  </td>
                  <td className="p-6 text-sm">
                    {typeof row.enterprise === 'boolean' ? (row.enterprise ? <Check size={18} className="text-green-500" /> : <X size={18} className="text-gray-600" />) : row.enterprise}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Usage Based Costs */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#111111] border border-gray-800 text-center">
            <h4 className="text-red-500 font-bold mb-2">Marketplace</h4>
            <p className="text-gray-500 text-xs">Included in all plans</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#111111] border border-gray-800 text-center">
            <h4 className="text-white font-bold mb-1">Extra SMS</h4>
            <p className="text-gray-400 text-sm">$0.02/message</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#111111] border border-gray-800 text-center">
            <h4 className="text-white font-bold mb-1">Extra Phone</h4>
            <p className="text-gray-400 text-sm">$1.00/month</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#111111] border border-gray-800 text-center">
            <h4 className="text-red-500 font-bold mb-1 italic">Coming Soon</h4>
            <p className="text-gray-500 text-xs text-uppercase">AI Credits</p>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-24 text-center text-gray-500 text-sm">
          <p>© 2024 BuildLync Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PublicBilling;
