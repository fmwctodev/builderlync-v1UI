import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { cloudAuthService } from '../services/cloudAuthService';
import { authApi } from '../services/authApi';
import { useAppDispatch } from '../store/hooks';
import { loginSuccess } from '../store/slices/authSlice';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Completing authentication...');
  const [success, setSuccess] = useState(false);
  // Guard against double-call in React StrictMode (dev only)
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double execution in React StrictMode
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const err = params.get('error');
      const state = params.get('state');

      if (err) {
        setError(err);
        return;
      }

      if (!code) {
        setError('Missing required parameters');
        return;
      }

      // 1. Try to parse state
      let stateData: any = null;
      try {
        stateData = state ? JSON.parse(state) : null;
      } catch {
        // If state is not JSON, might be from legacy or other flows (e.g. Analytics)
        navigate(`/auth/google-analytics/callback${window.location.search}`, { replace: true });
        return;
      }

      // 2. Determine flow based on stateData.type or stateData.provider
      try {
        if (stateData?.type === 'login') {
          // --- USER LOGIN FLOW ---
          setStatus('Verifying account...');
          const result = await authApi.googleSignIn(code);
          
          if (result.success && result.data) {
            dispatch(loginSuccess({
              user: result.data.user,
              token: result.data.token
            }));
            
            setSuccess(true);
            setStatus('Login successful! Redirecting...');
            
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          } else {
            throw new Error(result.message || 'Authentication failed');
          }
          return;
        }

        // --- CLOUD INTEGRATION FLOW (Google Drive / Outlook) ---
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
        setStatus('Verifying credentials...');
        await cloudAuthService.handleOAuthCallback(code, state!);

        setSuccess(true);
        setStatus('Authentication successful! Redirecting...');

        const returnPath = localStorage.getItem('oauth_return_path') || '/';
        localStorage.removeItem('oauth_return_path');

        setTimeout(() => {
          navigate(returnPath);
        }, 1500);
      } catch (e: any) {
        console.error('OAuth processing error:', e);
        setError(e.message || 'Failed to process authentication');
      }
    };

    handleCallback();
  }, [navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {error ? (
          <>
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Authentication Failed
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-mono break-all">
              {error}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Back to Login
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
