import React from 'react';
import { Check, ExternalLink } from 'lucide-react';
import { connectQuickBooks, getQuickBooksStatus, disconnectQuickBooks } from '../../../../shared/store/services/quickbooksApi';
import { connectTwilio, getTwilioStatus, disconnectTwilio, TwilioStatus } from '../../../../shared/store/services/twilioApi';
import TwilioManagementModal from './TwilioManagementModal';
import { googleBusinessApi } from '../../../../shared/services/googleBusinessApi';
import { srsService } from '../../services/srsService';
import SRSConnection from '../catalog/SRSConnection';


interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
  logo?: string;
  companyInfo?: any;
  hasManage?: boolean;
  learnMoreUrl?: string;
  setupInstructionsUrl?: string;
}

const Integrations: React.FC = () => {
  const [quickbooksStatus, setQuickbooksStatus] = React.useState<{ connected: boolean; companyInfo: { Name?: string } | null }>({ connected: false, companyInfo: null });
  const [twilioStatus, setTwilioStatus] = React.useState<TwilioStatus>({ connected: false });
  const [srsStatus, setSrsStatus] = React.useState({ connected: false });
  const [abcSupplyStatus, setAbcSupplyStatus] = React.useState({ connected: false });
  const [loading, setLoading] = React.useState<string | null>(null);
  const [showTwilioModal, setShowTwilioModal] = React.useState(false);
  const [showSrsModal, setShowSrsModal] = React.useState(false);


  React.useEffect(() => {
    fetchQuickBooksStatus();
    fetchTwilioStatus();
    fetchABCSupplyStatus();
    handleABCSupplyCallback();
    fetchSrsStatus();
    fetchABCSupplyStatus();
    handleABCSupplyCallback();
  }, []);

  const fetchQuickBooksStatus = async () => {
    try {
      const response = await getQuickBooksStatus();
      if (response.success) {
        setQuickbooksStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching QuickBooks status:', error);
    }
  };

  const fetchTwilioStatus = async () => {
    try {
      const response = await getTwilioStatus();
      if (response.success) {
        setTwilioStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching Twilio status:', error);
    }
  };

  const fetchABCSupplyStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/abc-supply/status`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAbcSupplyStatus({ connected: data.data?.connected || false });
      }
    } catch (error) {
      console.error('Error fetching ABC Supply status:', error);
    }
  };

  const handleABCSupplyConnect = async () => {
    try {
      setLoading('abc-supply');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/abc-supply/connect`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data?.authUrl) {
          window.location.href = data.data.authUrl;
        }
      }
    } catch (error) {
      console.error('Error connecting to ABC Supply:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleABCSupplyCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state === 'anythingworkshere') {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/abc-supply/callback?code=${code}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          setAbcSupplyStatus({ connected: true });
          window.history.replaceState({}, document.title, window.location.pathname);
          await fetchABCSupplyStatus();
        }
      } catch (error) {
        console.error('Error handling ABC Supply callback:', error);
      }
    }
  };

  const handleABCSupplyDisconnect = async () => {
    try {
      setLoading('abc-supply');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/abc-supply/disconnect`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        setAbcSupplyStatus({ connected: false });
      }
    } catch (error) {
      console.error('Error disconnecting ABC Supply:', error);
    } finally {
      setLoading(null);
    }
  };

  const fetchSrsStatus = async () => {
    try {
      const isConnected = await srsService.validateConnection();
      setSrsStatus({ connected: isConnected });
    } catch (error) {
      setSrsStatus({ connected: false });
    }
  };

  const handleQuickBooksConnect = async () => {
    try {
      setLoading('quickbooks');
      const response = await connectQuickBooks();
      if (response.success) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting to QuickBooks:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleQuickBooksDisconnect = async () => {
    try {
      setLoading('quickbooks');
      const response = await disconnectQuickBooks();
      if (response.success) {
        setQuickbooksStatus({ connected: false, companyInfo: null });
      }
    } catch (error) {
      console.error('Error disconnecting QuickBooks:', error);
    } finally {
      setLoading(null);
    }
  };



  const handleTwilioStatusChange = (status: TwilioStatus) => {
    setTwilioStatus(status);
  };

  const handleConnect = (integrationId: string) => {
    if (integrationId === 'quickbooks') {
      handleQuickBooksConnect();
    } else if (integrationId === 'twilio') {
      setShowTwilioModal(true);
    } else if (integrationId === 'srs-distribution') {
      setShowSrsModal(true);
    } else if (integrationId === 'google-business') {
      googleBusinessApi.connect();
    } else if (integrationId === 'abc-supply') {
      handleABCSupplyConnect();
    } else if (integrationId === 'srs-distribution') {
      setShowSrsModal(true);
    } else {
      console.log(`Connecting to ${integrationId}...`);
    }
  };

  const handleDisconnect = (integrationId: string) => {
    if (integrationId === 'quickbooks') {
      handleQuickBooksDisconnect();
    } else if (integrationId === 'twilio') {
      setShowTwilioModal(true);
    } else if (integrationId === 'abc-supply') {
      handleABCSupplyDisconnect();
    } else if (integrationId === 'srs-distribution') {
      srsService.logout();
      setSrsStatus({ connected: false });
    } else if (integrationId === 'srs-distribution') {
      srsService.logout();
      setSrsStatus({ connected: false });
    } else if (integrationId === 'abc-supply') {
      handleABCSupplyDisconnect();
    } else {
      console.log(`Disconnecting from ${integrationId}...`);
    }
  };

  const handleManage = (integrationId: string) => {
    if (integrationId === 'twilio') {
      setShowTwilioModal(true);
    } else if (integrationId === 'srs-distribution') {
      setShowSrsModal(true);
    } else {
      console.log(`Managing ${integrationId}...`);
    }
  };

  const integrations: Integration[] = [
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'QuickBooks allows you to keep track of business income and expenses',
      category: 'Accounting',
      connected: quickbooksStatus.connected,
      companyInfo: quickbooksStatus.companyInfo,
      hasManage: true,
    },
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'SMS and voice communication platform for customer engagement',
      category: 'Communication',
      connected: twilioStatus.connected,
      hasManage: true,
    },
    {
      id: 'abc-supply',
      name: 'ABC Supply',
      description: "ABC is North America's leader in supplying and serving contractors",
      category: 'Supply Chain',
      connected: abcSupplyStatus.connected,
      hasManage: true,
    },
    {
      id: 'srs-distribution',
      name: 'SRS Distribution',
      description: 'SRS Distribution is the fastest growing distributor of building products in the United States.',
      category: 'Supply Chain',
      connected: srsStatus.connected,
      hasManage: true,
    },
    {
      id: 'qxo',
      name: 'QXO',
      description: 'The largest publicly traded distributor of roofing materials in the United States and Canada.',
      category: 'Supply Chain',
      connected: false,
      learnMoreUrl: '#',
      setupInstructionsUrl: '#',
    },
    {
      id: 'eagleview',
      name: 'EagleView',
      description: 'Aerial imagery and property measurement services for roofing professionals',
      category: 'Imaging',
      connected: false,
    },
    {
      id: 'meta',
      name: 'Meta',
      description: 'Auto-sync ad leads, manage DMs, and respond to reviews across Facebook and Instagram',
      category: 'Marketing',
      connected: false,
      hasManage: true,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'Connect to get leads from your TikTok lead generation ads into your CRM',
      category: 'Marketing',
      connected: false,
      learnMoreUrl: '#',
    },
    {
      id: 'google-business',
      name: 'Google Business',
      description: 'Manage your Google Business Profile and sync customer reviews',
      category: 'Marketing',
      connected: false,
      hasManage: true,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'LinkedIn advertising and lead generation for B2B marketing',
      category: 'Marketing',
      connected: false,
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Workspace and documentation integration for team collaboration',
      category: 'Productivity',
      connected: false,
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Cloud storage and file management for documents and media',
      category: 'Productivity',
      connected: false,
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Accounting': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'Communication': 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300',
      'Supply Chain': 'bg-primary-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'Imaging': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'Marketing': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
      'Productivity': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Integrations</h2>
        <p className="text-gray-600 dark:text-gray-400">Connect with third-party services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{integration.name}</h3>
                  {integration.connected && (
                    <span className="inline-flex items-center space-x-1 bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium dark:bg-green-900/20 dark:text-green-400">
                      <Check className="w-3 h-3" />
                      <span>Connected</span>
                    </span>
                  )}
                </div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(integration.category)}`}>
                  {integration.category}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 min-h-[40px]">
              {integration.description}
            </p>

            {integration.id === 'quickbooks' && integration.connected && integration.companyInfo && (
              <p className="text-xs text-green-600 dark:text-green-400 mb-4">
                Connected to: {integration.companyInfo.Name}
              </p>
            )}

            {integration.id === 'twilio' && integration.connected && twilioStatus.accountSid && (
              <div className="text-xs text-green-600 dark:text-green-400 mb-4">
                <p>Account: {twilioStatus.accountSid}</p>
                {twilioStatus.phoneNumbers && twilioStatus.phoneNumbers.length > 0 && (
                  <p>Phone Numbers: {twilioStatus.phoneNumbers.length}</p>
                )}
              </div>
            )}

            <div className="flex flex-col space-y-2">
              {integration.connected ? (
                <>
                  {integration.hasManage && (
                    <button
                      onClick={() => handleManage(integration.id)}
                      disabled={loading === integration.id}
                      className="w-full px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                    >
                      + Manage
                    </button>
                  )}
                  <button
                    onClick={() => handleDisconnect(integration.id)}
                    disabled={loading === integration.id}
                    className="w-full px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                  >
                    {loading === integration.id ? 'Processing...' : 'Disconnect'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleConnect(integration.id)}
                    disabled={loading === integration.id}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading === integration.id ? 'Processing...' : 'Connect'}
                  </button>
                  {(integration.learnMoreUrl || integration.setupInstructionsUrl) && (
                    <div className="flex items-center space-x-3 pt-1">
                      {integration.learnMoreUrl && (
                        <a
                          href={integration.learnMoreUrl}
                          className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Learn more</span>
                        </a>
                      )}
                      {integration.setupInstructionsUrl && (
                        <a
                          href={integration.setupInstructionsUrl}
                          className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Setup instructions</span>
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <TwilioManagementModal
        isOpen={showTwilioModal}
        onClose={() => setShowTwilioModal(false)}
        onStatusChange={handleTwilioStatusChange}
        initialStatus={twilioStatus}
      />
      
      {showSrsModal && (
        <SRSConnection
          onConnectionSuccess={() => {
            setSrsStatus({ connected: true });
            setShowSrsModal(false);
          }}
          onClose={() => setShowSrsModal(false)}
        />
      )}
    </div>
  );
};

export default Integrations;
