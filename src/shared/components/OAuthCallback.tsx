import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const OAuthCallback: React.FC = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    const state = params.get('state');

    if (error) {
      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'oauth-error',
          error: error
        }, window.location.origin);
      }
      window.close();
      return;
    }

    if (code) {
      // For Gmail, we can extract email from the token info endpoint
      // For now, we'll send the code and let backend handle it
      if (window.opener) {
        window.opener.postMessage({
          type: 'oauth-success',
          code: code,
          email: 'user@example.com' // Backend will get actual email from token
        }, window.location.origin);
      }
      
      // Close popup after a short delay
      setTimeout(() => {
        window.close();
      }, 1000);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Completing authentication...
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please wait while we connect your account.
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
