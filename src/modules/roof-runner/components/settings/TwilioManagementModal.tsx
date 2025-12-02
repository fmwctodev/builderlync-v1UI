import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Phone, CheckCircle, Loader2 } from 'lucide-react';
import { getTwilioStatus, connectTwilio, disconnectTwilio } from '../../../../shared/store/services/twilioApi';

interface TwilioManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: any) => void;
  initialStatus?: TwilioStatus;
}

interface TwilioStatus {
  connected: boolean;
  accountSid?: string;
  phoneNumbers?: string[];
}

const TwilioManagementModal: React.FC<TwilioManagementModalProps> = ({
  isOpen,
  onClose,
  onStatusChange,
  initialStatus
}) => {
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [status, setStatus] = useState<TwilioStatus>({ connected: false });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // Regex patterns for Twilio credentials
  const ACCOUNT_SID_REGEX = /^AC[a-f0-9]{32}$/i;
  const AUTH_TOKEN_REGEX = /^[a-f0-9]{32}$/i;

  useEffect(() => {
    if (isOpen) {
      if (initialStatus) {
        setStatus(initialStatus);
        setChecking(false);
      } else {
        checkTwilioStatus();
      }
    }
  }, [isOpen, initialStatus]);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'accountSid':
        if (!ACCOUNT_SID_REGEX.test(value)) {
          newErrors.accountSid = 'Account SID must start with "AC" followed by 32 hexadecimal characters';
        } else {
          delete newErrors.accountSid;
        }
        break;
      case 'authToken':
        if (!AUTH_TOKEN_REGEX.test(value)) {
          newErrors.authToken = 'Auth Token must be 32 hexadecimal characters';
        } else {
          delete newErrors.authToken;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const checkTwilioStatus = async () => {
    setChecking(true);
    try {
      const response = await getTwilioStatus();
      if (response.success) {
        setStatus(response.data);
        onStatusChange(response.data);
      }
    } catch (error) {
      console.error('Error checking Twilio status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleConnect = async () => {
    validateField('accountSid', accountSid);
    validateField('authToken', authToken);
    
    if (Object.keys(errors).length > 0 || !accountSid || !authToken) return;

    setLoading(true);
    try {
      const response = await connectTwilio(accountSid, authToken);
      if (response.success) {
        await checkTwilioStatus();
        setAccountSid('');
        setAuthToken('');
        setErrors({});
      } else {
        setErrors({ general: response.message || 'Failed to connect to Twilio' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const response = await disconnectTwilio();
      if (response.success) {
        setStatus({ connected: false });
        onStatusChange({ connected: false });
      } else {
        setErrors({ general: response.message || 'Failed to disconnect from Twilio' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Twilio Integration
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {checking ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
            <p className="text-gray-600 dark:text-gray-400 mt-2">Checking connection status...</p>
          </div>
        ) : status.connected ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Connected to Twilio</span>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account SID:</span>
                <p className="text-sm text-gray-900 dark:text-white font-mono">{status.accountSid}</p>
              </div>
              
              {status.phoneNumbers && status.phoneNumbers.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Numbers:</span>
                  <div className="space-y-1 mt-1">
                    {status.phoneNumbers.map((number, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-white font-mono">{number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {errors.general && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.general}</span>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                Close
              </button>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect your Twilio account to enable SMS functionality.
            </p>

            {errors.general && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.general}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account SID
              </label>
              <input
                type="text"
                value={accountSid}
                onChange={(e) => {
                  setAccountSid(e.target.value);
                  const newErrors = { ...errors };
                  delete newErrors.general;
                  setErrors(newErrors);
                  validateField('accountSid', e.target.value);
                }}
                placeholder="AC1234567890abcdef1234567890abcdef"
                autoComplete="off"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.accountSid ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                required
              />
              {errors.accountSid && (
                <div className="flex items-center space-x-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.accountSid}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Auth Token
              </label>
              <input
                type="password"
                value={authToken}
                onChange={(e) => {
                  setAuthToken(e.target.value);
                  const newErrors = { ...errors };
                  delete newErrors.general;
                  setErrors(newErrors);
                  validateField('authToken', e.target.value);
                }}
                placeholder="32-character hexadecimal token"
                autoComplete="new-password"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.authToken ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                required
              />
              {errors.authToken && (
                <div className="flex items-center space-x-1 mt-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.authToken}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={loading || !accountSid || !authToken || errors.accountSid || errors.authToken}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwilioManagementModal;

/*
BACKEND API ENDPOINTS NEEDED:

1. GET /api/twilio/status
   Headers: Authorization: Bearer {token}
   Response: {
     "success": true,
     "data": {
       "connected": true,
       "accountSid": "AC1234567890abcdef1234567890abcdef",
       "phoneNumbers": ["+1234567890", "+0987654321"]
     }
   }

2. POST /api/twilio/connect
   Headers: Authorization: Bearer {token}, Content-Type: application/json
   Body: {
     "accountSid": "AC1234567890abcdef1234567890abcdef",
     "authToken": "32characterhexadecimaltoken"
   }
   Response: {
     "success": true,
     "data": {
       "accountSid": "AC1234567890abcdef1234567890abcdef",
       "phoneNumbers": ["+1234567890", "+0987654321"]
     },
     "message": "Twilio connected successfully"
   }

3. POST /api/twilio/disconnect
   Headers: Authorization: Bearer {token}, Content-Type: application/json
   Response: {
     "success": true,
     "message": "Twilio disconnected successfully"
   }

4. GET /api/twilio/phone-numbers
   Headers: Authorization: Bearer {token}
   Response: {
     "success": true,
     "data": ["+1234567890", "+0987654321"]
   }

ERROR RESPONSES (for all endpoints):
{
  "success": false,
  "message": "Error description here"
}
*/