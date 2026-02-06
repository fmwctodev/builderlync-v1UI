import React, { useState, useEffect } from 'react';
import { Mail, Check, Copy, Loader2 } from 'lucide-react';
import { getEmailConnections, disconnectEmail, connectEmail, EmailConnection } from '../../../../shared/store/services/profileApi';

const EmailSyncSection: React.FC = () => {
  const [connections, setConnections] = useState<EmailConnection[]>([]);
  const [bccEmail, setBccEmail] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<'gmail' | 'outlook'>('gmail');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadEmailConnections();
  }, []);

  const loadEmailConnections = async () => {
    try {
      setLoading(true);
      const response = await getEmailConnections();
      if (response.success) {
        setConnections(response.data.connections);
        setBccEmail(response.data.bcc_email);
      }
    } catch (err) {
      console.error('Error loading email connections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBccEmail = () => {
    navigator.clipboard.writeText(bccEmail);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDeleteConnection = async (id: string) => {
    if (confirm('Are you sure you want to disconnect this email?')) {
      try {
        const response = await disconnectEmail(id);
        if (response.success) {
          setConnections(connections.filter(c => c.id !== id));
        }
      } catch (err) {
        console.error('Error disconnecting email:', err);
        alert('Failed to disconnect email');
      }
    }
  };

  const handleConnectEmail = async () => {
    setConnecting(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';
      const token = localStorage.getItem('token');

      // Get OAuth URL from backend for selected provider
      const response = await fetch(`${API_BASE_URL}/profile/email-connections/oauth-url?provider=${selectedProvider}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!data.success || !data.data.authUrl) {
        throw new Error('Failed to get OAuth URL');
      }

      const authUrl = data.data.authUrl;
      const state = data.data.state;

      // Open OAuth popup
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        'OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for OAuth callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'oauth-success') {
          const { code } = event.data;

          try {
            // Send to backend
            const response = await connectEmail({
              provider: selectedProvider,
              authCode: code,
              email: ''
            });

            if (response.success) {
              await loadEmailConnections();
              alert(`Successfully connected!`);
            }
          } catch (err: any) {
            console.error('Error connecting email:', err);
            alert(err.response?.data?.message || 'Failed to connect email');
          } finally {
            setConnecting(false);
          }

          window.removeEventListener('message', handleMessage);
          if (popup) popup.close();
        } else if (event.data.type === 'oauth-error') {
          alert('Authentication failed. Please try again.');
          setConnecting(false);
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was blocked
      if (!popup || popup.closed) {
        alert('Popup was blocked. Please allow popups for this site.');
        setConnecting(false);
        window.removeEventListener('message', handleMessage);
      }
    } catch (err: any) {
      console.error('Error initiating OAuth:', err);
      alert('Failed to initiate authentication');
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Email (2-way sync)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Connect to sync incoming & outgoing emails between the CRM & your personal email account.
            </p>

            {connections.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select your email provider
                </p>

                <button
                  onClick={() => setSelectedProvider('gmail')}
                  className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all ${selectedProvider === 'gmail'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8">
                        <path fill="#EA4335" d="M6 12l-6 4.5V7.5z" />
                        <path fill="#FBBC05" d="M24 12l-6 4.5V7.5z" />
                        <path fill="#34A853" d="M0 7.5l6 4.5 6-4.5V3L6 7.5z" />
                        <path fill="#4285F4" d="M24 7.5l-6 4.5-6-4.5V3l6 4.5z" />
                      </svg>
                    </div>
                    <span className="text-base font-medium text-gray-900 dark:text-white">Gmail</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedProvider === 'gmail'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                    }`}>
                    {selectedProvider === 'gmail' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setSelectedProvider('outlook')}
                  className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all ${selectedProvider === 'outlook'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8">
                        <path fill="#0078D4" d="M24 12.5v-1L12 6 0 11.5v1L12 18z" />
                        <path fill="#0364B8" d="M0 11.5L12 6v12z" />
                        <path fill="#28A8EA" d="M12 6l12 5.5L12 18z" />
                        <path fill="#0078D4" d="M12 18l12-6.5v1L12 18z" />
                      </svg>
                    </div>
                    <span className="text-base font-medium text-gray-900 dark:text-white">Outlook</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedProvider === 'outlook'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                    }`}>
                    {selectedProvider === 'outlook' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </button>

                <div className="flex items-center justify-between pt-2">
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {/* Learn More */}
                  </a>
                  <button
                    onClick={handleConnectEmail}
                    disabled={connecting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {connecting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {connecting ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {connections.map((connection) => (
                      <tr key={connection.id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
                              <Mail className="w-5 h-5 text-red-500" />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {connection.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600">Connected</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleDeleteConnection(connection.id)}
                            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                          >
                            Disconnect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Auto Bcc Sync
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Add your smart Bcc address to the Cc or Bcc field when sending an email from Gmail/Outlook
          to automatically add this conversation and contact in CRM
        </p>

        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={bccEmail}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white text-sm"
          />
          <button
            onClick={handleCopyBccEmail}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <Copy className="w-4 h-4" />
            <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        <a
          href="#"
          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 mt-4 inline-block"
        >
          Learn More
        </a>
      </div> */}

          {/* <div className="flex justify-end">
            <button
              type="button"
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <span>Update Availability</span>
            </button>
          </div> */}
        </>
      )}
    </div>
  );
};

export default EmailSyncSection;
