import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { authApi } from '../../../shared/store/services/authApi';
import { useAppDispatch } from '../../../shared/store/hooks';
import { loginSuccess } from '../../../shared/store/slices/authSlice';

const Success: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sessionId = searchParams.get('session_id');

    if (sessionId) {
      verifyAndLogin(sessionId);
    }
  }, []);

  const verifyAndLogin = async (sessionId: string) => {
    setIsVerifying(true);
    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin.replace('5174', '5176') + '/api';
        const response = await fetch(`${API_URL}/billing/checkout/verify-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const result = await response.json();

        if (response.ok && result.data?.token) {
          const { user, token } = result.data;
          
          // Zaroori cheezein set karna taaki redirect work kare
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          if (user.companySlug) {
            localStorage.setItem('currentOrganizationSlug', user.companySlug);
          }
          if (user.organizationId) {
            localStorage.setItem('organizationId', user.organizationId.toString());
          }

          dispatch(loginSuccess({ user, token }));
          
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 2000);
          } else {
            setIsVerifying(false);
          }
        }
      } catch (err) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setIsVerifying(false);
        }
      }
    };

    poll();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 p-12 bg-[#111111] border border-gray-800 rounded-3xl shadow-2xl">
        <div className="flex justify-center">
          <div className="p-4 bg-green-500/10 rounded-full">
            {isVerifying ? (
              <Loader2 className="w-20 h-20 text-red-600 animate-spin" />
            ) : (
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">
            {isVerifying ? 'Verifying Payment...' : 'Payment Successful!'}
          </h1>
          <p className="text-gray-400 text-lg">
            {isVerifying 
              ? 'Please wait a moment while we set up your account.' 
              : "Welcome to BuilderLync. Your account has been upgraded and you're ready to start winning jobs."}
          </p>
        </div>

        {!isVerifying && (
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

        <p className="text-gray-500 text-sm">
          {isVerifying ? 'This usually takes a few seconds.' : 'A receipt has been sent to your email.'}
        </p>
      </div>
    </div>
  );
};

export default Success;
