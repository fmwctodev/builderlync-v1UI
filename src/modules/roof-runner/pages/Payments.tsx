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
      <div className="bg-gray-900 dark:bg-gray-950 border-b border-gray-800 dark:border-gray-900 flex-shrink-0">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-white">Payments</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 px-6 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-white bg-gray-800 dark:bg-gray-900'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
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

      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Payments;
