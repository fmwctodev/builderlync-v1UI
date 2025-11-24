import React, { useState } from 'react';
import { Info, Loader2 } from 'lucide-react';

const TwoFactorAuthSection: React.FC = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSetup2FA = () => {
    setLoading(true);
    // TODO: Implement 2FA setup flow
    console.log('Setting up 2FA...');
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Two-factor Authentication (2FA) App
          </h3>
          <Info className="w-5 h-5 text-gray-400 mt-0.5" />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Two-factor authentication (2FA) adds an extra layer of security to your account. By setting up an
          authenticator app, you'll have the option to use it alongside your phone number and email for
          verifying your identity during login.
        </p>

        <button
          onClick={handleSetup2FA}
          disabled={loading}
          className="text-red-600 hover:text-red-700 dark:text-red-400 font-medium flex items-center space-x-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Setup Two-factor Authentication (2FA) App</span>
        </button>
      </div>
    </div>
  );
};

export default TwoFactorAuthSection;
