import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cloudDriveService } from '../../../shared/services/cloudDriveService';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    if (error) {
      setStatus('error');
      setMessage(`Authentication failed: ${error}`);
      notifyParent('error', error);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      notifyParent('error', 'No authorization code');
      return;
    }

    const provider = window.location.pathname.includes('google-drive') ? 'google_drive' : 'onedrive';

    try {
      if (provider === 'google_drive') {
        const tokenData = await cloudDriveService.exchangeGoogleDriveCode(code);
        await cloudDriveService.saveConnection(
          'google_drive',
          tokenData.email,
          tokenData.access_token,
          tokenData.refresh_token,
          tokenData.expires_in
        );
      } else {
        const tokenData = await cloudDriveService.exchangeOneDriveCode(code);
        await cloudDriveService.saveConnection(
          'onedrive',
          tokenData.email,
          tokenData.access_token,
          tokenData.refresh_token,
          tokenData.expires_in
        );
      }

      setStatus('success');
      setMessage('Successfully connected! You can close this window.');
      notifyParent('success');

      setTimeout(() => {
        window.close();
      }, 2000);
    } catch (err) {
      console.error('OAuth error:', err);
      setStatus('error');
      setMessage('Failed to complete authentication. Please try again.');
      notifyParent('error', 'Authentication failed');
    }
  };

  const notifyParent = (type: 'success' | 'error', error?: string) => {
    if (window.opener) {
      window.opener.postMessage(
        {
          type: type === 'success' ? 'oauth-success' : 'oauth-error',
          error
        },
        window.location.origin
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Completing authentication...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we connect your account
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Successfully connected!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Connection failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <button
                onClick={() => window.close()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Close Window
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
