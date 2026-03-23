import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSuperAdminSession } from '../utils/super-admin-auth';

export const Logout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    clearSuperAdminSession();

    const timer = setTimeout(() => {
      navigate('/super-admin/login', { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 text-lg">Logging out...</p>
      </div>
    </div>
  );
};
