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
    const token = localStorage.getItem('token');
    const orgSlug = user?.companySlug || localStorage.getItem('currentOrganizationSlug');
    
    console.log('Callback received:', { 
      code: !!code, 
      error: errorParam, 
      token: !!token, 
      orgSlug,
      user: user?.email,
      companySlug: user?.companySlug
    });
    
    if (errorParam) {
      setError(`Google OAuth Error: ${errorParam}`);
      alert(`Authentication failed: ${errorParam}`);
      setTimeout(() => {
        if (orgSlug && token) {
          navigate(`/org/${orgSlug}/marketing/analytics/google-analytics`, { replace: true });
        } else {
          navigate('/marketing', { replace: true });
        }
      }, 2000);
      return;
    }
    
    if (!token) {
      console.error('No auth token found');
      setError('Please login first');
      alert('Please login to connect Google Analytics');
      navigate('/auth/login', { replace: true });
      return;
    }
    
    if (code) {
      console.log('Redirecting to Google Analytics page with code');
      if (orgSlug) {
        navigate(`/org/${orgSlug}/marketing/analytics/google-analytics?code=${code}`, { replace: true });
      } else {
        navigate(`/marketing/analytics/google-analytics?code=${code}`, { replace: true });
      }
    } else {
      console.error('No code received from Google');
      setError('No authorization code received');
      alert('Authorization failed. Please try again.');
      if (orgSlug) {
        navigate(`/org/${orgSlug}/marketing/analytics/google-analytics`, { replace: true });
      } else {
        navigate('/marketing/analytics/google-analytics', { replace: true });
      }
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
