import React from 'react';
import { Plus, HelpCircle } from 'lucide-react';

const IntegrationsTab: React.FC = () => {
  const integrations = [
    { name: 'Custom Links', icon: '+', color: 'bg-gray-100', hasAddButton: true },
    { name: 'Airbnb', icon: '🏠', color: 'bg-red-50' },
    { name: 'AliExpress', icon: '📦', color: 'bg-orange-50' },
    { name: 'Angi', icon: 'A', color: 'bg-red-50' },
    { name: 'Amazon', icon: 'a', color: 'bg-yellow-50' },
    { name: 'Agoda', icon: '🏨', color: 'bg-blue-50' },
    { name: 'Apple App Store', icon: '🍎', color: 'bg-blue-50' },
    { name: 'Avvo', icon: 'A', color: 'bg-gray-50' },
    { name: 'Better Business Bureau', icon: '$', color: 'bg-blue-50' },
    { name: 'Booking.com', icon: 'B', color: 'bg-blue-600 text-white' },
    { name: 'Capterra', icon: '🚀', color: 'bg-orange-50' },
    { name: 'CarGurus', icon: 'CG', color: 'bg-blue-50' },
    { name: 'Caring.com', icon: '💜', color: 'bg-purple-50' },
    { name: 'Cars.com', icon: '🚗', color: 'bg-purple-600 text-white' },
    { name: 'Citysearch', icon: '🔍', color: 'bg-gray-50' },
    { name: 'Consumer Affairs', icon: '⭐', color: 'bg-blue-50' },
    { name: 'DealerRater', icon: '📊', color: 'bg-orange-50' },
    { name: 'Doordash', icon: '🍕', color: 'bg-red-50' },
    { name: 'Ebay', icon: 'ebay', color: 'bg-blue-50' },
    { name: 'Expedia', icon: 'e', color: 'bg-blue-600 text-white' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Integrations</h3>
        <p className="text-blue-600 dark:text-blue-400">
          Add review platforms by entering the page link to import reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {integrations.map((integration, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center hover:shadow-md transition-shadow"
          >
            <div className="mb-4">
              {integration.name === 'Custom Links' ? (
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto">
                  <Plus size={24} className="text-gray-600 dark:text-gray-400" />
                </div>
              ) : (
                <div className={`w-12 h-12 ${integration.color} rounded-lg flex items-center justify-center mx-auto text-lg font-bold`}>
                  {integration.icon}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-1 mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                {integration.name}
              </h4>
              {integration.name === 'Custom Links' && (
                <HelpCircle size={14} className="text-gray-400" />
              )}
            </div>

            {integration.hasAddButton ? (
              <button className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded text-sm transition-colors">
                Add Platform
              </button>
            ) : (
              <button className="w-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 py-2 px-4 rounded text-sm transition-colors">
                Integrate
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsTab;