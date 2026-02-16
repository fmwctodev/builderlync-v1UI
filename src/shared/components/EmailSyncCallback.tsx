import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';

const EmailSyncCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Connecting email account...');

  const getSettingsPath = () => {
    const savedReturnPath = localStorage.getItem('oauth_return_path');
    if (savedReturnPath) return savedReturnPath;

    let orgSlug = localStorage.getItem('currentOrganizationSlug');
    if (!orgSlug) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          orgSlug = user?.companySlug || null;
        } catch (e) {
          console.error('Failed to parse user from localStorage');
        }
      }
    }

    return orgSlug ? `/org/${orgSlug}/settings/profile` : '/auth/login';
  };

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const err = params.get('error');

      if (err) {
        setError(err);
        return;
      }

      if (!code) {
        setError('Missing authorization code');
        return;
      }

      // Store code and redirect back to settings
      const returnPath = getSettingsPath();
      localStorage.removeItem('oauth_return_path');
      localStorage.setItem('email_oauth_code', code);
      
      setStatus('Email connected! Redirecting...');
      setTimeout(() => {
        navigate(returnPath, { replace: true });
      }, 1000);
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {error ? (
          <>
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connection Failed
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <button
              onClick={() => navigate(getSettingsPath())}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Return to Settings
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {status}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailSyncCallback;
