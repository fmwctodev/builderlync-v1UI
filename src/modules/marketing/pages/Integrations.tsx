import React from 'react';

export function Integrations() {
  const integrations = [
    { name: 'Google Calendar', logo: '📅', color: 'bg-primary-500', status: 'Connect' },
    { name: 'Google My Business', logo: '🏢', color: 'bg-red-500', status: 'Connect', featured: true },
    { name: 'Microsoft Teams', logo: '👥', color: 'bg-purple-500', status: 'Connect' },
    { name: 'Facebook & Instagram', logo: '📱', color: 'bg-primary-600', status: 'Connect' },
    { name: 'QuickBooks', logo: 'qb', color: 'bg-green-500', status: 'Connect' },
    { name: 'Xero', logo: 'xero', color: 'bg-blue-400', status: 'Connect' },
    { name: 'Wave', logo: 'wave', color: 'bg-primary-500', status: 'Connect' },
    { name: 'Veem', logo: '✓', color: 'bg-primary-500', status: 'Connect' },
    { name: 'Stripe', logo: 'stripe', color: 'bg-purple-600', status: 'Connect' },
    { name: 'Shopify', logo: '🛍️', color: 'bg-green-600', status: 'Connect' },
    { name: 'TikTok', logo: '🎵', color: 'bg-black', status: 'Connect' },
    { name: 'LinkedIn', logo: 'in', color: 'bg-blue-700', status: 'Connect' },
    { name: 'Slack', logo: 'slack', color: 'bg-purple-500', status: 'Connect' },
    { name: 'WooCommerce', logo: 'woo', color: 'bg-purple-600', status: 'Connect' },
    { name: 'ClickUp', logo: 'clickup', color: 'bg-pink-500', status: 'Connect' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Integrations</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {integrations.map((integration, index) => (
            <div 
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                integration.featured ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 dark:border-gray-700'
              } p-6 hover:shadow-md transition-shadow`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 ${integration.color} rounded-lg flex items-center justify-center mb-4`}>
                  {integration.logo.length === 1 ? (
                    <span className="text-white text-xl">{integration.logo}</span>
                  ) : (
                    <span className="text-white text-xs font-bold">{integration.logo}</span>
                  )}
                </div>
                
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">{integration.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Connect your {integration.name} account
                </p>
                
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  {integration.status}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}