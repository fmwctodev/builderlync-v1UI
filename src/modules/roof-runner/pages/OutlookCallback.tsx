import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const OutlookCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    let companySlug = localStorage.getItem('currentOrganizationSlug');
    
    if (!companySlug && userStr) {
      try {
        const user = JSON.parse(userStr);
        companySlug = user.companySlug;
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
    
    const timer = setTimeout(() => {
      if (companySlug) {
        navigate(`/org/${companySlug}/settings/profile?outlook=${status}`);
      } else {
        navigate('/auth/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {status === 'success' ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Outlook Connected Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Redirecting to settings...
            </p>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Redirecting back...
            </p>
          </>
        )}
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
      </div>
    </div>
  );
};

export default OutlookCallback;
