import React, { useState, useEffect } from 'react';
import { X, Shield, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verificationType: 'phone' | 'email';
  contactValue: string;
  contactId: string;
  onVerified: () => void;
}

export function VerificationModal({
  isOpen,
  onClose,
  verificationType,
  contactValue,
  contactId,
  onVerified
}: VerificationModalProps) {
  const [step, setStep] = useState<'send' | 'verify' | 'success' | 'error'>('send');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleSendCode = async () => {
    setIsLoading(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep('verify');
      setResendTimer(60);
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const enteredCode = code.join('');
    if (enteredCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep('success');
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1500);
    } catch (err) {
      setError('Invalid verification code. Please try again.');
      setCode(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setCode(['', '', '', '', '', '']);
    setError('');
    handleSendCode();
  };

  const Icon = verificationType === 'email' ? Mail : Phone;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            step === 'success' ? 'bg-green-100 dark:bg-green-900' :
            step === 'error' ? 'bg-red-100 dark:bg-red-900' :
            verificationType === 'email' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'
          }`}>
            {step === 'success' ? (
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            ) : step === 'error' ? (
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            ) : (
              <Icon className={`w-8 h-8 ${
                verificationType === 'email' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
              }`} />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {step === 'success' ? 'Verified!' :
             step === 'send' ? `Verify ${verificationType === 'email' ? 'Email' : 'Phone'}` :
             'Enter Verification Code'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {step === 'success' ? `${verificationType === 'email' ? 'Email' : 'Phone'} successfully verified` :
             step === 'send' ? `We'll send a verification code to ${contactValue}` :
             `Enter the 6-digit code sent to ${contactValue}`}
          </p>
        </div>

        {step === 'send' && (
          <button
            onClick={handleSendCode}
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-medium transition-all shadow-md ${
              verificationType === 'email'
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </button>
        )}

        {step === 'verify' && (
          <div>
            <div className="flex justify-center space-x-2 mb-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleVerifyCode}
              disabled={isLoading || code.join('').length !== 6}
              className={`w-full py-3 rounded-xl font-medium transition-all shadow-md mb-3 ${
                verificationType === 'email'
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              onClick={handleResend}
              disabled={resendTimer > 0}
              className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-green-600 dark:text-green-400 font-medium">
              <Shield className="w-5 h-5" />
              <span>Contact verified successfully</span>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div>
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
            <button
              onClick={() => setStep('send')}
              className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
