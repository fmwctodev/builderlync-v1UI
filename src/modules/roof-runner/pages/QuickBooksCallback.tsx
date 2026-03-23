import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const QuickBooksCallback: React.FC = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const isSuccess = urlParams.get('success') === 'true';
  const isError = urlParams.get('error') === 'true';

  useEffect(() => {

    // Redirect to settings after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = '/settings/integrations';
    }, 3000);

    return () => clearTimeout(timer);
  }, [isSuccess, isError]);

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-red-900/20">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Connection Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            There was an error connecting to QuickBooks. Redirecting to settings...
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-green-900/20">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            QuickBooks Connected Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your QuickBooks integration has been saved. Redirecting to settings...
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center max-w-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Processing Connection...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Saving your QuickBooks integration...
        </p>
      </div>
    </div>
  );
};

export default QuickBooksCallback;