export default function PaymentsSettings() {
  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Payment Settings
        </h1>

        {/* Default Payment Methods */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Default payment methods
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            When you create future payment requests, these will be the default acceptable payment methods. You can change them for each individual request.
          </p>

          <div className="space-y-4">
            {['Credit card', 'American Express', 'ACH'].map((method) => (
              <div key={method} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{method}</h4>
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Show fee details
                  </button>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Platform Fees */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform fees</h3>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
              Beta
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Pass on credit card and ACH platform fees to your customers
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Pass through fees for credit card payments
                </h4>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Show fee details
                </button>
              </div>
              <input type="checkbox" className="rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Pass through fees for ACH payments
                </h4>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Show fee details
                </button>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
