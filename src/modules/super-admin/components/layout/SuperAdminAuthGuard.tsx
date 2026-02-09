import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isSuperAdminAuthenticated } from '../../utils/super-admin-auth';

interface SuperAdminAuthGuardProps {
  children: React.ReactNode;
}

export const SuperAdminAuthGuard: React.FC<SuperAdminAuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isSuperAdminAuthenticated()) {
        navigate('/super-admin/login', {
          replace: true,
          state: { from: location.pathname }
        });
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate, location]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
