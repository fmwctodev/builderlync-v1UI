import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

export const GoogleAnalyticsCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');
    const state = urlParams.get('state');
    const token = localStorage.getItem('token');
    const orgSlug = user?.companySlug || localStorage.getItem('currentOrganizationSlug');

    // Determine which service and orgId based on state
    let service = 'google-analytics';
    let inferredOrgId = '';

    if (state) {
      console.log('OAuth Callback State:', state);
      const decodedState = decodeURIComponent(state);

      if (decodedState.toLowerCase().includes('business')) {
        service = 'google-business';
      } else if (decodedState.toLowerCase().includes('ads')) {
        service = 'google-ads';
      } else if (decodedState.toLowerCase().includes('analytics')) {
        service = 'google-analytics';
      }

      // Extract orgId from state (format: service:orgId)
      if (decodedState.includes(':')) {
        inferredOrgId = decodedState.split(':')[1];
      }
    }

    const finalOrgSlug = orgSlug || (inferredOrgId ? `company-${inferredOrgId}` : '');
    console.log(`OAuth Redirecting to: ${service} for org: ${finalOrgSlug}`);

    if (errorParam) {
      setError(`Google OAuth Error: ${errorParam}`);
      alert(`Authentication failed: ${errorParam}`);
      setTimeout(() => {
        const redirectUrl = finalOrgSlug
          ? `/org/${finalOrgSlug}/marketing/analytics/${service}`
          : `/marketing/analytics/${service}`;
        navigate(redirectUrl, { replace: true });
      }, 2000);
      return;
    }

    if (!token) {
      setError('Please login first');
      alert('Please login to connect Google services');
      navigate('/auth/login', { replace: true });
      return;
    }

    if (code) {
      const returnPath = localStorage.getItem('google_auth_return');

      // If returning to integrations, redirect back without code after verifying
      if (returnPath === 'integrations') {
        localStorage.removeItem('google_auth_return');

        // We need to call the API here directly since the Integrations page doesn't have the callback logic
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/google-analytics/google-business/callback?code=${code}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => {
            if (!res.ok) throw new Error('Failed to connect to Google');
            return res.json();
          })
          .then(() => {
            const targetUrl = finalOrgSlug ? `/org/${finalOrgSlug}/settings/integrations` : '/settings/integrations';
            navigate(targetUrl, { replace: true });
          })
          .catch(err => {
            console.error(err);
            setError('Failed to swap code during Integration connection');
            setTimeout(() => navigate(finalOrgSlug ? `/org/${finalOrgSlug}/settings/integrations` : '/settings/integrations'), 2000);
          });
        return;
      }

      const targetUrl = finalOrgSlug
        ? `/org/${finalOrgSlug}/marketing/analytics/${service}?code=${code}`
        : `/marketing/analytics/${service}?code=${code}`;

      console.log('Redirecting to target:', targetUrl);
      navigate(targetUrl, { replace: true });
    } else {
      setError('No authorization code received');
      alert('Authorization failed. Please try again.');
      const fallbackUrl = finalOrgSlug
        ? `/org/${finalOrgSlug}/marketing/analytics/${service}`
        : `/marketing/analytics/${service}`;
      navigate(fallbackUrl, { replace: true });
    }
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-semibold">{error}</p>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
          </>
        ) : (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        )}
      </div>
    </div>
  );
};
