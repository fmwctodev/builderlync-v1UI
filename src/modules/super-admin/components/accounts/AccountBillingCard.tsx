import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EnterpriseAccount } from '../../types';
import { DollarSign, Calendar, CreditCard } from 'lucide-react';

interface AccountBillingCardProps {
  account: EnterpriseAccount;
  onChangePlan: () => void;
}

export const AccountBillingCard: React.FC<AccountBillingCardProps> = ({
  account,
  onChangePlan,
}) => {
  const getPlanBadgeVariant = (plan: EnterpriseAccount['plan']) => {
    switch (plan) {
      case 'Enterprise':
        return 'info';
      case 'Pro':
        return 'success';
      default:
        return 'neutral';
    }
  };

  return (
    <Card
      title="Billing Information"
      subtitle="Subscription and payment details"
      footer={
        <button
          onClick={onChangePlan}
          className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
        >
          Change Plan
        </button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium">Current Plan</span>
          </div>
          <Badge variant={getPlanBadgeVariant(account.plan)}>{account.plan}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Monthly Recurring Revenue</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            ${account.mrr.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Annual Recurring Revenue</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            ${account.arr.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Billing Cycle</span>
          </div>
          <span className="text-sm text-gray-900 capitalize">{account.billingCycle}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Next Billing Date</span>
          </div>
          <span className="text-sm text-gray-900">
            {new Date(account.renewalDate).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Card>
  );
};
