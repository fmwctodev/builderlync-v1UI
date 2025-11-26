import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function OAuthCallbackRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract the provider from the pathname
    const pathParts = location.pathname.split('/');
    const provider = pathParts[pathParts.length - 2]; // e.g., 'google' or 'microsoft'
    
    // Get query parameters
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Redirect to the OAuth callback component with the provider and parameters
    const callbackUrl = `/file-manager/oauth-callback?${searchParams.toString()}`;
    navigate(callbackUrl, { replace: true });
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );
}