import React, { useState } from 'react';
import { Send, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
      case 'gbp-optimization':
        return (
          <div className="flex flex-col items-center justify-center px-6 py-16">
            <div className="mb-8">
              <svg width="400" height="300" viewBox="0 0 400 300" className="text-gray-300 dark:text-gray-600">
                <rect x="300" y="60" width="80" height="100" rx="4" fill="currentColor" opacity="0.3" />
                <rect x="320" y="40" width="40" height="60" rx="4" fill="#FCD34D" />
                <rect x="340" y="80" width="20" height="40" rx="2" fill="currentColor" opacity="0.4" />
                <rect x="100" y="180" width="200" height="80" rx="8" fill="currentColor" opacity="0.4" />
                <rect x="90" y="250" width="220" height="20" rx="4" fill="currentColor" opacity="0.3" />
                <rect x="120" y="120" width="160" height="100" rx="8" fill="white" stroke="currentColor" strokeWidth="2" />
                <rect x="130" y="130" width="140" height="80" rx="4" fill="currentColor" opacity="0.1" />
                <ellipse cx="200" cy="200" rx="25" ry="20" fill="currentColor" opacity="0.6" />
                <circle cx="190" cy="190" r="15" fill="currentColor" opacity="0.7" />
                <circle cx="210" cy="190" r="15" fill="currentColor" opacity="0.7" />
                <polygon points="185,180 195,170 205,180" fill="currentColor" opacity="0.7" />
                <polygon points="205,180 215,170 225,180" fill="currentColor" opacity="0.7" />
                <circle cx="188" cy="185" r="2" fill="white" />
                <circle cx="212" cy="185" r="2" fill="white" />
                <ellipse cx="200" cy="195" rx="3" ry="2" fill="white" />
                <rect x="350" y="200" width="8" height="40" fill="currentColor" opacity="0.4" />
                <ellipse cx="354" cy="190" rx="12" ry="8" fill="currentColor" opacity="0.5" />
                <ellipse cx="354" cy="185" rx="8" ry="6" fill="currentColor" opacity="0.6" />
              </svg>
            </div>
            <div className="text-center max-w-md">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nothing to see here!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Add new business to see how you can later optimize it better for a great online visibility.
              </p>
              <button 
                onClick={() => navigate('/marketing/integrations')}
                className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Integrate GBP
              </button>
            </div>
          </div>
        );
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