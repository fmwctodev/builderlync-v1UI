import React, { useState } from 'react';
import { FileText, CreditCard, Tag } from 'lucide-react';
import InvoicesEstimatesTab from '../components/payments/InvoicesEstimatesTab';
import TransactionsTab from '../components/payments/TransactionsTab';
import CouponsTab from '../components/payments/CouponsTab';
import { PageHeader, Tabs, Section } from '../../../shared/components/ui';

type TabType = 'invoices' | 'transactions' | 'coupons';

const Payments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('invoices');

  const tabItems = [
    { id: 'invoices' as TabType,     label: 'Invoices & Estimates', icon: <FileText /> },
    { id: 'transactions' as TabType, label: 'Transactions',          icon: <CreditCard /> },
    { id: 'coupons' as TabType,      label: 'Coupons',               icon: <Tag /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'invoices':
        return <InvoicesEstimatesTab />;
      case 'transactions':
        return <TransactionsTab />;
      case 'coupons':
        return <CouponsTab />;
      default:
        return <InvoicesEstimatesTab />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-studio-page pt-8">
        <PageHeader eyebrow="Workspace" title="Payments" />
      </div>
      <div className="px-studio-page mt-4">
        <Tabs<TabType> items={tabItems} value={activeTab} onChange={setActiveTab} />
      </div>

      <Section className="flex-1 overflow-auto px-studio-page">
        {renderTabContent()}
      </Section>
    </div>
  );
};

export default Payments;
