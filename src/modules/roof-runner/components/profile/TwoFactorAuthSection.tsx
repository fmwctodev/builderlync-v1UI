import React, { useState, useEffect } from 'react';
import { Info, Loader2, X } from 'lucide-react';
import { get2FAStatus, setup2FA, verify2FA, disable2FA } from '../../../../shared/store/services/profileApi';

const TwoFactorAuthSection: React.FC = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    load2FAStatus();
  }, []);

  const load2FAStatus = async () => {
    try {
      setLoading(true);
      const response = await get2FAStatus();
      if (response.success) {
        setIs2FAEnabled(response.data.is_enabled);
      }
    } catch (err) {
      console.error('Error loading 2FA status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      setLoading(true);
      const response = await setup2FA();
      if (response.success) {
        setQrCode(response.data.qr_code);
        setSecret(response.data.secret);
        setBackupCodes(response.data.backup_codes);
        setShowSetupModal(true);
      }
    } catch (err) {
      console.error('Error setting up 2FA:', err);
      alert('Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      alert('Please enter a valid 6-digit code');
      return;
    }

    try {
      setVerifying(true);
      const response = await verify2FA(verificationCode);
      if (response.success) {
        setIs2FAEnabled(true);
        setShowSetupModal(false);
        alert('2FA enabled successfully!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    const password = prompt('Enter your password to disable 2FA:');
    if (!password) return;

    try {
      setLoading(true);
      const response = await disable2FA(password);
      if (response.success) {
        setIs2FAEnabled(false);
        alert('2FA disabled successfully');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Two-factor Authentication (2FA) App
          </h3>
          <Info className="w-5 h-5 text-gray-400 mt-0.5" />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Two-factor authentication (2FA) adds an extra layer of security to your account. By setting up an
          authenticator app, you'll have the option to use it alongside your phone number and email for
          verifying your identity during login.
        </p>

        <button
          onClick={is2FAEnabled ? handleDisable2FA : handleSetup2FA}
          disabled={loading}
          className="text-red-600 hover:text-red-700 dark:text-red-400 font-medium flex items-center space-x-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{is2FAEnabled ? 'Disable' : 'Setup'} Two-factor Authentication (2FA) App</span>
        </button>
      </div>

      {showSetupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Setup 2FA</h3>
              <button onClick={() => setShowSetupModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Scan this QR code with your authenticator app
                </p>
                {qrCode && <img src={qrCode} alt="2FA QR Code" className="mx-auto" />}
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Or enter this code manually:</p>
                <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded text-center">{secret}</code>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter verification code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="123456"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Backup Codes:</p>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded space-y-1">
                  {backupCodes.map((code, i) => (
                    <code key={i} className="block text-sm">{code}</code>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Save these codes in a safe place</p>
              </div>

              <button
                onClick={handleVerify2FA}
                disabled={verifying || verificationCode.length !== 6}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Verify and Enable</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuthSection;
