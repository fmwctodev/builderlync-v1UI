import React, { useState, useEffect } from 'react';
import { Info, Loader2, Shield, Copy, Check, X } from 'lucide-react';
import { profileService, enable2FA } from '../../services/profile-service';

const TwoFactorAuthSection: React.FC = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [setupStep, setSetupStep] = useState<'qr' | 'verify' | 'backup'>('qr');

  useEffect(() => {
    load2FAStatus();
  }, []);

  const load2FAStatus = async () => {
    try {
      setLoading(true);
      const profile = await profileService.getProfile();
      if (profile?.staff_id) {
        setStaffId(profile.staff_id);
        const status = await profileService.get2FAStatus(profile.staff_id);
        if (status.success && status.data) {
          setIs2FAEnabled(status.data.enabled);
        }
      }
    } catch (err) {
      console.error('Failed to load 2FA status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setProcessing(true);
    setError(null);
    try {
      const result = await enable2FA(staffId);
      if (result.success && result.data) {
        setQrCode(result.data.qrCode);
        setSecret(result.data.secret);
        setBackupCodes(result.data.backupCodes);
        setShowSetupModal(true);
        setSetupStep('qr');
      } else {
        setError(result.error || 'Failed to enable 2FA');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to set up 2FA');
    } finally {
      setProcessing(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      const result = await profileService.verify2FACode(staffId, verificationCode);
      if (result.success) {
        setSetupStep('backup');
        setVerificationCode('');
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify code');
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete2FASetup = () => {
    setShowSetupModal(false);
    setIs2FAEnabled(true);
    setSetupStep('qr');
    setQrCode('');
    setSecret('');
    setBackupCodes([]);
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication?')) {
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      const result = await profileService.disable2FA(staffId);
      if (result.success) {
        setIs2FAEnabled(false);
      } else {
        setError(result.error || 'Failed to disable 2FA');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to disable 2FA');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
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
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-start space-x-2 mb-4">
          <Shield className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Two-Factor Authentication (2FA)
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Two-factor authentication adds an extra layer of security to your account. Use an
              authenticator app to verify your identity during login.
            </p>
          </div>
        </div>

        {is2FAEnabled ? (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">2FA is enabled</span>
              </div>
              <button
                onClick={handleDisable2FA}
                disabled={processing}
                className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Disable 2FA'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Enhanced Security</p>
                  <p>
                    As a super admin, we strongly recommend enabling 2FA to protect your account and all platform data.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSetup2FA}
                disabled={processing}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Setup Two-Factor Authentication</span>
              </button>
            </div>
          </>
        )}
      </div>

      {showSetupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {setupStep === 'qr' && 'Scan QR Code'}
                {setupStep === 'verify' && 'Verify Setup'}
                {setupStep === 'backup' && 'Backup Codes'}
              </h2>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {setupStep === 'qr' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
                  </p>
                  <div className="flex justify-center">
                    <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-2">Or enter this key manually:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono break-all">{secret}</code>
                      <button
                        onClick={() => copyToClipboard(secret)}
                        className="ml-2 p-2 hover:bg-gray-200 rounded"
                      >
                        {copiedCode === secret ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setSetupStep('verify')}
                    className="w-full px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Next: Verify
                  </button>
                </div>
              )}

              {setupStep === 'verify' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Enter the 6-digit code from your authenticator app to verify the setup.
                  </p>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    maxLength={6}
                  />
                  <button
                    onClick={handleVerify2FA}
                    disabled={processing || verificationCode.length !== 6}
                    className="w-full px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Verify Code</span>
                  </button>
                </div>
              )}

              {setupStep === 'backup' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 font-medium">
                      Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between py-1">
                        <code className="text-sm font-mono">{code}</code>
                        <button
                          onClick={() => copyToClipboard(code)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {copiedCode === code ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleComplete2FASetup}
                    className="w-full px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Complete Setup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuthSection;
