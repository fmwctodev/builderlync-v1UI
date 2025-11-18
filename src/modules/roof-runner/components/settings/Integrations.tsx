import React from 'react';
import { connectQuickBooks, getQuickBooksStatus, disconnectQuickBooks } from '../../../../shared/store/services/quickbooksApi';

const Integrations: React.FC = () => {
  const [quickbooksStatus, setQuickbooksStatus] = React.useState({ connected: false, companyInfo: null });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchQuickBooksStatus();
  }, []);

  const fetchQuickBooksStatus = async () => {
    try {
      const response = await getQuickBooksStatus();
      if (response.success) {
        setQuickbooksStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching QuickBooks status:', error);
    }
  };

  const handleQuickBooksConnect = async () => {
    try {
      setLoading(true);
      const response = await connectQuickBooks();
      if (response.success) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting to QuickBooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBooksDisconnect = async () => {
    try {
      setLoading(true);
      const response = await disconnectQuickBooks();
      if (response.success) {
        setQuickbooksStatus({ connected: false, companyInfo: null });
      }
    } catch (error) {
      console.error('Error disconnecting QuickBooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const integrations = [
    {
      name: 'QuickBooks',
      description: '2-way sync for customers and payments',
      connected: quickbooksStatus.connected,
      type: 'Accounting',
      companyInfo: quickbooksStatus.companyInfo
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Integrations</h2>
        <p className="text-gray-600 dark:text-gray-400">Connect with third-party services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <div key={integration.name} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${integration.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{integration.name}</h3>
              </div>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs dark:bg-gray-700 dark:text-gray-300">
                {integration.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{integration.description}</p>
            {integration.name === 'QuickBooks' && integration.connected && integration.companyInfo && (
              <p className="text-xs text-green-600 dark:text-green-400 mb-4">
                Connected to: {integration.companyInfo.Name}
              </p>
            )}
            {integration.name === 'QuickBooks' ? (
              <button
                onClick={integration.connected ? handleQuickBooksDisconnect : handleQuickBooksConnect}
                disabled={loading}
                className={`w-full px-4 py-2 rounded-lg disabled:opacity-50 ${
                  integration.connected
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {loading ? 'Processing...' : (integration.connected ? 'Disconnect' : 'Connect')}
              </button>
            ) : (
              <button className={`w-full px-4 py-2 rounded-lg ${
                integration.connected
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}>
                {integration.connected ? 'Disconnect' : 'Connect'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Integrations;