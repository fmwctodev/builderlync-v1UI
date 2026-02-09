import React from 'react';
import { Edit, Power, RefreshCw } from 'lucide-react';
import { Plan } from '../../types/billing';
import { clsx } from 'clsx';

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onToggleActive: (plan: Plan) => void;
  onSync?: (plan: Plan) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onEdit, onToggleActive, onSync }) => {
  const priceMonthly = parseFloat(plan.price_monthly);
  const priceAnnual = parseFloat(plan.price_annual);

  const calculateSavings = (monthly: number, annual: number): number => {
    if (monthly === 0 || annual === 0) return 0;
    const annualEquivalent = monthly * 12;
    return Math.round(((annualEquivalent - annual) / annualEquivalent) * 100);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const savings = calculateSavings(priceMonthly, priceAnnual);
  const isCustomPlan = priceMonthly === 0 && priceAnnual === 0;

  const features = plan.limits?.features || [];
  const displayLimits = {
    ...(plan.limits?.seats !== undefined && { seats: plan.limits.seats }),
    ...(plan.limits?.sms_messages !== undefined && { sms: plan.limits.sms_messages }),
    ...(plan.limits?.email_sent !== undefined && { emails: plan.limits.email_sent }),
    ...(plan.limits?.ai_minutes !== undefined && { 'ai min': plan.limits.ai_minutes }),
  };

  return (
    <div className={clsx(
      'bg-white rounded-lg border-2 p-6 transition-all hover:shadow-lg',
      plan.active ? 'border-green-200' : 'border-gray-200 opacity-60'
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
          <p className="text-sm text-gray-500 uppercase tracking-wide">{plan.name.toUpperCase()}</p>
        </div>
        <span className={clsx(
          'px-2 py-1 text-xs font-medium rounded',
          plan.active
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600'
        )}>
          {plan.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {plan.description && (
        <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
      )}

      <div className="mb-6">
        {isCustomPlan ? (
          <div className="text-center py-4">
            <span className="text-2xl font-bold text-gray-900">Custom</span>
            <p className="text-sm text-gray-500 mt-1">Talk to Sales</p>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(priceMonthly)}
              </span>
              <span className="text-gray-500">/month</span>
            </div>
            <div className="text-sm text-gray-600">
              {formatPrice(priceAnnual)}/year
              {savings > 0 && (
                <span className="ml-2 text-green-600 font-medium">
                  (Save {savings}%)
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {features.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Features</h4>
          <ul className="space-y-1">
            {features.slice(0, 5).map((feature: string, index: number) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{feature}</span>
              </li>
            ))}
            {features.length > 5 && (
              <li className="text-sm text-gray-500 italic">
                +{features.length - 5} more features
              </li>
            )}
          </ul>
        </div>
      )}

      {Object.keys(displayLimits).length > 0 && (
        <div className="mb-6 pb-6 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Limits</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(displayLimits).slice(0, 4).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}: </span>
                <span className="font-medium text-gray-900">
                  {value === -1 ? 'Unlimited' : (value as number).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(plan)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onToggleActive(plan)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
              plan.active
                ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                : 'text-white bg-green-600 hover:bg-green-700'
            )}
          >
            <Power className="w-4 h-4" />
            {plan.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
        {onSync && (
          <button
            onClick={() => onSync(plan)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Sync with Stripe
          </button>
        )}
      </div>
    </div>
  );
};
