export default function Integrations() {
  const integrations = [
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Sync your invoices and payments with QuickBooks',
      isConnected: false,
      logo: '📊',
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Accept payments through Stripe',
      isConnected: false,
      logo: '💳',
    },
  ];

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Integrations
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{integration.logo}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {integration.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {integration.description}
                    </p>
                  </div>
                </div>
              </div>

              <button
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  integration.isConnected
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {integration.isConnected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
