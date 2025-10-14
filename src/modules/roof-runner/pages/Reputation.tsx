import React, { useState } from 'react';
import { Send } from 'lucide-react';
import SendReviewRequestModal from '../components/reputation/SendReviewRequestModal';
import OverviewTab from '../components/reputation/OverviewTab';
import RequestsTab from '../components/reputation/RequestsTab';
import ReviewsTab from '../components/reputation/ReviewsTab';
import WidgetsTab from '../components/reputation/WidgetsTab';
import ListingsTab from '../components/reputation/ListingsTab';
import SettingsTab from '../components/reputation/SettingsTab';

const Reputation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'requests', label: 'Requests' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'widgets', label: 'Widgets' },
    { id: 'listings', label: 'Listings' },
    { id: 'settings', label: 'Settings' },
    { id: 'gbp-optimization', label: 'GBP Optimization' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab onOpenModal={() => setIsModalOpen(true)} />;
      case 'requests':
        return <RequestsTab onOpenModal={() => setIsModalOpen(true)} />;
      case 'reviews':
        return <ReviewsTab onOpenModal={() => setIsModalOpen(true)} />;
      case 'widgets':
        return <WidgetsTab />;
      case 'listings':
        return <ListingsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            Content for {tabs.find(tab => tab.id === activeTab)?.label} tab coming soon...
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reputation</h1>
          
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-50 text-red-700 border-b-2 border-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {renderTabContent()}

      <SendReviewRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Reputation;