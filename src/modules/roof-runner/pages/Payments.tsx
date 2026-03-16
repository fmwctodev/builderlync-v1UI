import React, { useEffect, useState } from 'react';
import { FileText, CreditCard, Tag, Settings, AlertTriangle, ArrowRight } from 'lucide-react';
import { useParams } from 'react-router-dom';
import InvoicesEstimatesTab from '../components/payments/InvoicesEstimatesTab';
import DocumentsContractsTab from '../components/payments/DocumentsContractsTab';
import TransactionsTab from '../components/payments/TransactionsTab';
import CouponsTab from '../components/payments/CouponsTab';
import SettingsTab from '../components/payments/SettingsTab';
import IntegrationsTab from '../components/payments/IntegrationsTab';

type TabType = 'invoices' | 'documents' | 'transactions' | 'coupons' | 'settings' | 'integrations';

const Payments: React.FC = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('invoices');
  const [isQuickBooksConnected, setIsQuickBooksConnected] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const showQuickBooksAlert = (activeTab === 'invoices' || activeTab === 'transactions') && !checkingStatus && !isQuickBooksConnected;

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { getQuickBooksStatus } = await import('../../../shared/store/services/quickbooksApi');
        const response = await getQuickBooksStatus();
        setIsQuickBooksConnected(response.data.connected);
      } catch (error) {
        console.error('Error checking QuickBooks status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkStatus();
  }, []);

  const tabs = [
    {
      id: 'invoices' as TabType,
      label: 'Invoices & Estimates',
      icon: FileText,
      badge: 'New',
    },
    // {
    //   id: 'documents' as TabType,
    //   label: 'Documents & Contracts',
    //   icon: FileCheck,
    //   badge: 'New',
    // },
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
    // {
    //   id: 'settings' as TabType,
    //   label: 'Settings',
    //   icon: Settings,
    //   badge: null,
    // },
    // {
    //   id: 'integrations' as TabType,
    //   label: 'Integrations',
    //   icon: Link2,
    //   badge: null,
    // },
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
        {showQuickBooksAlert && (
          <div className="p-6 pb-6">
            <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-0 overflow-hidden shadow-sm">
              <div className="p-4 bg-[#2C3344] bg-opacity-40 border-b border-gray-700/50 flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-yellow-500">
                    Connect Your QuickBooks Account
                  </h3>
                  <p className="text-sm text-yellow-500/80 mt-1">
                    To sync invoices and payments, you must first connect your QuickBooks account.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#1E293B] flex flex-col md:flex-row gap-6 md:items-center text-sm text-gray-400">
                <div className="flex items-center gap-2 text-red-400">
                  <Settings className="h-4 w-4" />
                  <span>No QuickBooks account configured</span>
                  <a
                    href={`/org/${orgSlug}/settings/integrations`}
                    className="text-blue-400 hover:text-blue-300 ml-2 flex items-center gap-1"
                  >
                    Go to Settings <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Payments;
