import React from 'react';
import { Package, Users, FileText, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

export type BillingTab = 'plans' | 'subscription-plans' | 'subscriptions' | 'accounts' | 'invoices' | 'metrics';

interface BillingTabsProps {
  activeTab: BillingTab;
  onChange: (tab: BillingTab) => void;
}

const tabs = [
  { id: 'plans' as BillingTab, label: 'Plans', icon: Package },
  { id: 'subscription-plans' as BillingTab, label: 'Subscription Plans', icon: Package },
  { id: 'subscriptions' as BillingTab, label: 'Subscriptions', icon: Users },
  { id: 'accounts' as BillingTab, label: 'Accounts', icon: Users },
  { id: 'invoices' as BillingTab, label: 'Invoices', icon: FileText },
  { id: 'metrics' as BillingTab, label: 'Metrics', icon: TrendingUp },
];

export const BillingTabs: React.FC<BillingTabsProps> = ({ activeTab, onChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                isActive
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
