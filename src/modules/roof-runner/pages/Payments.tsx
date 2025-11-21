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
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payments</h1>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white rounded-t-lg'
                    : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
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
      <div className="flex-1 overflow-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Payments;
