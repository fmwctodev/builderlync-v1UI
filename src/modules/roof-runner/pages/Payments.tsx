import React, { useState } from 'react';
import { FileText, FileCheck, CreditCard, Tag, Settings, Link2 } from 'lucide-react';
import InvoicesEstimatesTab from '../components/payments/InvoicesEstimatesTab';
import DocumentsContractsTab from '../components/payments/DocumentsContractsTab';
import TransactionsTab from '../components/payments/TransactionsTab';
import CouponsTab from '../components/payments/CouponsTab';
import SettingsTab from '../components/payments/SettingsTab';
import IntegrationsTab from '../components/payments/IntegrationsTab';

type TabType = 'invoices' | 'documents' | 'transactions' | 'coupons' | 'settings' | 'integrations';

const Payments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('invoices');

  const tabs = [
    {
      id: 'invoices' as TabType,
      label: 'Invoices & Estimates',
      icon: FileText,
      badge: 'New',
    },
    {
      id: 'documents' as TabType,
      label: 'Documents & Contracts',
      icon: FileCheck,
      badge: 'New',
    },
    {
      id: 'transactions' as TabType,
      label: 'Transactions',
      icon: CreditCard,
      badge: 'New',
    },
    {
      id: 'coupons' as TabType,
      label: 'Coupons',
      icon: Tag,
      badge: 'New',
    },
    {
      id: 'settings' as TabType,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
    {
      id: 'integrations' as TabType,
      label: 'Integrations',
      icon: Link2,
      badge: null,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'invoices':
        return <InvoicesEstimatesTab />;
      case 'documents':
        return <DocumentsContractsTab />;
      case 'transactions':
        return <TransactionsTab />;
      case 'coupons':
        return <CouponsTab />;
      case 'settings':
        return <SettingsTab />;
      case 'integrations':
        return <IntegrationsTab />;
      default:
        return <InvoicesEstimatesTab />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payments</h1>

        {/* Sub Navigation */}
        <div className="flex items-center space-x-1 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-red-600 border-b-2 border-red-600 dark:text-red-400 dark:border-red-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-xs bg-yellow-500 text-gray-900 px-1.5 py-0.5 rounded font-semibold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Payments;
