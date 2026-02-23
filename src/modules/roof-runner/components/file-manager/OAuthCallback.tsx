import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { cloudAuthService } from '../../../../shared/services/cloudAuthService';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing OAuth parameters');
        }

        setMessage('Connecting your cloud drive...');

        const connection = await cloudAuthService.handleOAuthCallback(code, state);

        if (!initialized.current) return; // Cleanup check

        setStatus('success');
        setMessage(`Successfully connected ${connection.provider}!`);

        // Get return path or organization slug
        const returnPath = localStorage.getItem('oauth_return_path');
        const orgSlug = localStorage.getItem('currentOrganizationSlug') || localStorage.getItem('companySlug');

        let redirectPath = '/file-manager';
        if (returnPath && returnPath.includes('/org/')) {
          redirectPath = returnPath;
        } else if (orgSlug) {
          redirectPath = `/org/${orgSlug}/file-manager`;
        }

        localStorage.removeItem('oauth_return_path');

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate(redirectPath);
        }, 2000);

      } catch (err: any) {
        if (!initialized.current) return;

        console.error('OAuth callback error:', err);

        // Only update status if we aren't already successful
        setStatus(current => {
          if (current === 'success') return 'success';
          return 'error';
        });

        setMessage(current => {
          if (current === 'success') return message; // Keep the success message
          return err.message || 'Failed to connect cloud drive';
        });

        // Get return path or organization slug for error redirect as well
        const orgSlug = localStorage.getItem('currentOrganizationSlug') || localStorage.getItem('companySlug');
        let redirectPath = '/file-manager';
        if (orgSlug) {
          redirectPath = `/org/${orgSlug}/file-manager`;
        }

        // Redirect after 3 seconds if it was an error
        setTimeout(() => {
          navigate(redirectPath);
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connecting Cloud Drive
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connection Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to File Manager...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to File Manager...
            </p>
          </>
        )}
      </div>
    </div>
  );
}