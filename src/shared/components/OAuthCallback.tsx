import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { cloudAuthService } from '../services/cloudAuthService';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Completing authentication...');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const err = params.get('error');
      const state = params.get('state');

      if (err) {
        setError(err);
        return;
      }

      if (!code || !state) {
        setError('Missing required parameters');
        return;
      }

      // Handle Popup Flow (Legacy or specific use case)
      if (window.opener) {
        window.opener.postMessage({
          type: 'oauth-success',
          code: code,
          state: state
        }, window.location.origin);
        setTimeout(() => window.close(), 1000);
        return;
      }

      // Handle Redirect Flow
      try {
        setStatus('Verifying credentials...');
        await cloudAuthService.handleOAuthCallback(code, state);

        setSuccess(true);
        setStatus('Authentication successful! Redirecting...');

        const returnPath = localStorage.getItem('oauth_return_path') || '/';
        localStorage.removeItem('oauth_return_path');

        // Short delay to show success message
        setTimeout(() => {
          navigate(returnPath);
        }, 1500);
      } catch (e: any) {
        console.error('OAuth processing error:', e);
        setError(e.message || 'Failed to process authentication');
      }
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
              Authentication Failed
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Return to Dashboard
            </button>
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Success!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {status}
            </p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {status}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we connect your account.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
