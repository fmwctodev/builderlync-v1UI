import React from 'react';
import { Plus, HelpCircle } from 'lucide-react';

const IntegrationsTab: React.FC = () => {
  const integrations = [
    { name: 'Custom Links', icon: '+', color: 'bg-gray-100', hasAddButton: true },
    { name: 'Angies List', icon: 'AL', color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
    { name: 'Angi', icon: 'A', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' },
    { name: 'Better Business Bureau', icon: 'BBB', color: 'bg-primary-50 dark:bg-primary-900/20 text-red-700 dark:text-primary-400' },
    { name: 'Citysearch', icon: '🔍', color: 'bg-gray-50 dark:bg-gray-900/20' },
    { name: 'Facebook', icon: 'f', color: 'bg-primary-600 text-white' },
    { name: 'Glassdoor', icon: 'G', color: 'bg-green-600 text-white' },
    { name: 'Google Business Profile', icon: 'G', color: 'bg-red-600 text-white' },
    { name: 'Homeadvisor', icon: 'HA', color: 'bg-orange-600 text-white' },
    { name: 'Indeed', icon: 'i', color: 'bg-red-700 text-white' },
    { name: 'Thumbtack', icon: '📌', color: 'bg-green-50 dark:bg-green-900/20' },
    { name: 'Trustradius', icon: 'TR', color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
    { name: 'Trustpilot', icon: '⭐', color: 'bg-green-600 text-white' },
    { name: 'Yellow Pages', icon: 'YP', color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' },
    { name: 'Yelp', icon: 'Y', color: 'bg-red-600 text-white' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Integrations</h3>
        <p className="text-primary-600 dark:text-primary-400">
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
              <button className="w-full bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 text-primary-600 dark:text-primary-400 py-2 px-4 rounded text-sm transition-colors">
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