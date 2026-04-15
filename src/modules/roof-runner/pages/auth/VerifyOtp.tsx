import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { verifyRegistrationOtpRequest, resendRegistrationOtpRequest, clearError } from '../../../../shared/store/slices/authSlice';
import Toast from '../../../../shared/components/Toast';

const VerifyOtp: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((state) => state.auth);
  const hasBillingAccess = !!(
    user?.is_beta_user ||
    user?.has_active_subscription ||
    user?.subscription_status === 'active' ||
    user?.subscription_status === 'trialing'
  );
  const email = location.state?.email;
  const from = location.state?.from || 'signup';
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!email) {
      navigate('/auth/signup');
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    if (user) {
      if (hasBillingAccess) {
        navigate('/', { replace: true });
        return;
      }

      navigate(`/billing?email=${encodeURIComponent(email)}`, { replace: true });
    }
  }, [user, email, navigate, hasBillingAccess]);

  useEffect(() => {
    if (error) {
      setToast({ message: error, type: 'error' });
    }
  }, [error]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    // Handle only single digit input here. For paste, handlePaste will take over.
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      pastedData.forEach((char, index) => {
        if (index < 6 && /^[0-9]$/.test(char)) {
          newOtp[index] = char;
        }
      });
      setOtp(newOtp);

      // Focus the last filled input or the next empty one
      const lastIndex = Math.min(pastedData.length, 5);
      inputRefs.current[lastIndex]?.focus();
    }
    e.preventDefault();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length === 6) {
      dispatch(verifyRegistrationOtpRequest({ email, otp: otpString }));
    }
  };

  const handleResend = () => {
    dispatch(resendRegistrationOtpRequest(email));
    setTimer(60);
    setCanResend(false);
    setToast({ message: 'OTP resent successfully', type: 'success' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 relative">
        <button
          onClick={() => {
            const destination = from === 'login' ? '/auth/login' : '/auth/signup';
            const state = from === 'login' ? undefined : { fromVerifyOtp: true };
            navigate(destination, { replace: true, state });
          }}
          className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600 mt-2">
            We've sent a 6-digit code to<br />
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter verification code
            </label>
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 outline-none transition-colors"
                  style={{ '--tw-ring-color': '#dc2626' } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(209 213 219)'}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full text-white py-3 px-4 rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            style={{ backgroundColor: '#dc2626', '--tw-ring-color': '#dc2626' } as React.CSSProperties}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                onClick={handleResend}
                className="font-medium hover:opacity-80"
                style={{ color: '#dc2626' }}
              >
                Resend Code
              </button>
            ) : (
              <span className="text-gray-400">
                Resend in {timer}s
              </span>
            )}
          </p>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default VerifyOtp;
