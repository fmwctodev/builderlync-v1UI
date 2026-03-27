import React from 'react';
import { Check, ExternalLink, Building2, Phone, Mail, MapPin, Hash, Calendar, X, RefreshCw, CheckCircle2, User } from 'lucide-react';
import axios from 'axios';
import { connectQuickBooks, getQuickBooksStatus, disconnectQuickBooks } from '../../../../shared/store/services/quickbooksApi';
import { getTwilioStatus, TwilioStatus } from '../../../../shared/store/services/twilioApi';
import TwilioManagementModal from './TwilioManagementModal';
import EagleViewConnectionModal from './EagleViewConnectionModal';
import { googleBusinessApi } from '../../../../shared/services/googleBusinessApi';
import { srsService } from '../../services/srsService';
import SRSConnection from '../catalog/SRSConnection';
import QxoConnection from '../catalog/QxoConnection';
import { qxoService } from '../../services/qxoService';
import QxoDetailsModal from './QxoDetailsModal';
import { cloudDriveApi } from '../../../../shared/services/cloudDriveApi';
import { useNavigate, useParams } from 'react-router-dom';


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
  customStatus?: React.ReactNode;
}

const Integrations: React.FC = () => {
  const { orgSlug } = useParams();
  const navigate = useNavigate();
  const [quickbooksStatus, setQuickbooksStatus] = React.useState<{ connected: boolean; companyInfo: { Name?: string } | null }>({ connected: false, companyInfo: null });
  const [twilioStatus, setTwilioStatus] = React.useState<TwilioStatus>({ connected: false });
  const [srsStatus, setSrsStatus] = React.useState<{ connected: boolean; accountNumber?: string; profile?: any }>({ connected: false });
  const [showSrsDetailsModal, setShowSrsDetailsModal] = React.useState(false);
  const [abcSupplyStatus, setAbcSupplyStatus] = React.useState({ connected: false });
  const [qxoStatus, setQxoStatus] = React.useState<{ connected: boolean; email?: string; profile?: any }>({ connected: false });
  const [showQxoModal, setShowQxoModal] = React.useState(false);
  const [showQxoDetailsModal, setShowQxoDetailsModal] = React.useState(false);
  const [eagleViewStatus, setEagleViewStatus] = React.useState<{ connected: boolean; usingOwnAccount: boolean; credits: number }>({ connected: false, usingOwnAccount: false, credits: 0 });
  const [googleDriveStatus, setGoogleDriveStatus] = React.useState<{ connected: boolean; email?: string }>({ connected: false });
  const [oneDriveStatus, setOneDriveStatus] = React.useState<{ connected: boolean; email?: string }>({ connected: false });
  const [googleBusinessStatus, setGoogleBusinessStatus] = React.useState({ connected: false });
  const [facebookAdsStatus, setFacebookAdsStatus] = React.useState({ connected: false });
  const [tiktokAdsStatus, setTiktokAdsStatus] = React.useState({ connected: false });
  const [loading, setLoading] = React.useState<string | null>(null);
  const [showTwilioModal, setShowTwilioModal] = React.useState(false);
  const [showSrsModal, setShowSrsModal] = React.useState(false);
  const [showEagleViewModal, setShowEagleViewModal] = React.useState(false);


  React.useEffect(() => {
    fetchQuickBooksStatus();
    fetchTwilioStatus();
    fetchABCSupplyStatus();
    handleABCSupplyCallback();
    fetchSrsStatus();
    fetchQxoStatus();
    fetchEagleViewStatus();
    fetchGoogleDriveStatus();
    fetchOneDriveStatus();
    fetchGoogleBusinessStatus();
    fetchSocialAdsStatus();
  }, []);

  const fetchSocialAdsStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/integrations`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFacebookAdsStatus({ connected: data.data?.some((i: any) => i.platform === 'facebook_ads') });
        setTiktokAdsStatus({ connected: data.data?.some((i: any) => i.platform === 'tiktok_ads') });
      }
    } catch (error) {
      console.error('Error fetching Social Ads status:', error);
    }
  };

  const fetchGoogleBusinessStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/integrations`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        const googleIntegrations = data.data?.filter((i: any) => i.platform.startsWith('google_')) || [];
        setGoogleBusinessStatus({ connected: googleIntegrations.length > 0 });
      }
    } catch (error) {
      console.error('Error fetching Google services status:', error);
    }
  };

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

  const fetchEagleViewStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/eagleview/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEagleViewStatus(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching EagleView status:', error);
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
      const result = await srsService.getCustomerProfile();
      if (result?.success && result.data?.connected) {
        const accountNumber = result.data?.profile?.customer_code || result.data?.profile?.customerCode;
        setSrsStatus({ connected: true, accountNumber, profile: result.data?.profile });
        return;
      }
      setSrsStatus({ connected: false });
    } catch (error) {
      setSrsStatus({ connected: false });
    }
  };

  const fetchQxoStatus = async () => {
    try {
      const result = await qxoService.getStatus();
      if (result?.success && result.data?.connected) {
        setQxoStatus({ connected: true, email: result.data?.email, profile: result.data?.profileData });
        return;
      }
      setQxoStatus({ connected: false });
    } catch (error) {
      setQxoStatus({ connected: false });
    }
  };

  const fetchGoogleDriveStatus = async () => {
    try {
      const connection = await cloudDriveApi.getCurrentUserConnection();
      if (connection && connection.provider === 'google_drive') {
        setGoogleDriveStatus({
          connected: true,
          email: connection.provider_email
        });
      } else {
        setGoogleDriveStatus({ connected: false });
      }
    } catch (error) {
      console.error('Error fetching Google Drive status:', error);
      setGoogleDriveStatus({ connected: false });
    }
  };

  const fetchOneDriveStatus = async () => {
    try {
      const connection = await cloudDriveApi.getCurrentUserConnection();
      if (connection && (connection.provider === 'onedrive_personal' || connection.provider === 'onedrive_business')) {
        setOneDriveStatus({
          connected: true,
          email: connection.provider_email
        });
      } else {
        setOneDriveStatus({ connected: false });
      }
    } catch (error) {
      console.error('Error fetching OneDrive status:', error);
      setOneDriveStatus({ connected: false });
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

  const handleConnect = async (integrationId: string) => {
    if (integrationId === 'quickbooks') {
      handleQuickBooksConnect();
    } else if (integrationId === 'twilio') {
      setShowTwilioModal(true);
    } else if (integrationId === 'srs-distribution') {
      if (srsStatus.connected) {
        setShowSrsDetailsModal(true);
      } else {
        setShowSrsModal(true);
      }
    } else if (integrationId === 'qxo') {
      setShowQxoModal(true);
    } else if (integrationId === 'google-business') {
      googleBusinessApi.connect("integrations");
    } else if (integrationId === 'abc-supply') {
      handleABCSupplyConnect();
    } else if (integrationId === 'eagleview') {
      setShowEagleViewModal(true);
    } else if (integrationId === 'google-drive') {
      // Redirect to File Manager to connect
      navigate(`/org/${orgSlug}/file-manager`);
    } else if (integrationId === 'onedrive') {
      // Redirect to File Manager to connect
      navigate(`/org/${orgSlug}/file-manager`);
    } else if (integrationId === 'meta') {
      try {
        setLoading('meta');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/social-ads/facebook/connect`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.data?.authUrl) window.location.href = data.data.authUrl;
      } catch (err) { console.error(err); } finally { setLoading(null); }
    } else if (integrationId === 'tiktok') {
      try {
        setLoading('tiktok');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/social-ads/tiktok/connect`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.data?.authUrl) window.location.href = data.data.authUrl;
      } catch (err) { console.error(err); } finally { setLoading(null); }
    } else {
      console.log(`Connecting to ${integrationId}...`);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    if (integrationId === 'quickbooks') {
      handleQuickBooksDisconnect();
    } else if (integrationId === 'twilio') {
      setShowTwilioModal(true);
    } else if (integrationId === 'abc-supply') {
      handleABCSupplyDisconnect();
    } else if (integrationId === 'srs-distribution') {
      await srsService.logout();
      setSrsStatus({ connected: false });
    } else if (integrationId === 'qxo') {
      try {
        setLoading('qxo');
        await qxoService.logout();
        setQxoStatus({ connected: false });
      } finally { setLoading(null); }
    } else if (integrationId === 'eagleview') {
      try {
        setLoading('eagleview');
        const token = localStorage.getItem('token');
        await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/eagleview/disconnect`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchEagleViewStatus();
      } catch (error) {
        console.error('Error disconnecting EagleView:', error);
      } finally {
        setLoading(null);
      }
    } else if (integrationId === 'google-drive') {
      try {
        setLoading('google-drive');
        await cloudDriveApi.disconnectCurrentUser();
        setGoogleDriveStatus({ connected: false });
      } catch (error) {
        console.error('Error disconnecting Google Drive:', error);
      } finally {
        setLoading(null);
      }
    } else if (integrationId === 'onedrive') {
      try {
        setLoading('onedrive');
        await cloudDriveApi.disconnectCurrentUser();
        setOneDriveStatus({ connected: false });
      } catch (error) {
        console.error('Error disconnecting OneDrive:', error);
      } finally {
        setLoading(null);
      }
    } else if (integrationId === 'google-business') {
      try {
        setLoading('google-business');
        // Get all integration IDs connected to google and delete them
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/integrations`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const allIntegrations = await response.json();
        const googleIntegrations = allIntegrations.data?.filter((i: any) => i.platform.startsWith('google_'));

        for (const i of googleIntegrations || []) {
          await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/integrations/${i.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
        }
        setGoogleBusinessStatus({ connected: false });
      } catch (error) {
        console.error('Error disconnecting Google Services:', error);
      } finally {
        setLoading(null);
      }
    } else if (integrationId === 'meta' || integrationId === 'tiktok') {
      try {
        setLoading(integrationId);
        const platform = integrationId === 'meta' ? 'facebook_ads' : 'tiktok_ads';
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/integrations`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const allIntegrations = await response.json();
        const integration = allIntegrations.data?.find((i: any) => i.platform === platform);

        if (integration) {
          await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/integrations/${integration.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
        }

        if (integrationId === 'meta') setFacebookAdsStatus({ connected: false });
        if (integrationId === 'tiktok') setTiktokAdsStatus({ connected: false });

      } catch (error) {
        console.error(`Error disconnecting ${integrationId}:`, error);
      } finally {
        setLoading(null);
      }
    } else {
      console.log(`Disconnecting from ${integrationId}...`);
    }
  };

  const handleManage = (integrationId: string) => {
    if (integrationId === 'twilio') {
      setShowTwilioModal(true);
    } else if (integrationId === 'srs-distribution') {
      if (srsStatus.connected) {
        setShowSrsDetailsModal(true);
      } else {
        setShowSrsModal(true);
      }
    } else if (integrationId === 'qxo') {
      if (qxoStatus.connected) {
        setShowQxoDetailsModal(true);
      } else {
        setShowQxoModal(true);
      }
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
      name: 'QXO (Beacon)',
      description: 'The largest publicly traded distributor of roofing materials in the United States and Canada.',
      category: 'Supply Chain',
      connected: qxoStatus.connected,
      companyInfo: qxoStatus.email ? { Email: qxoStatus.email } : null,
      hasManage: true,
    },
    {
      id: 'eagleview',
      name: 'EagleView',
      description: eagleViewStatus.usingOwnAccount
        ? 'Aerial imagery connected via your own account.'
        : 'Aerial imagery and property measurement services for roofing professionals.',
      category: 'Imaging',
      connected: eagleViewStatus.connected,
      customStatus: !eagleViewStatus.connected && !eagleViewStatus.usingOwnAccount ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          Credits: {eagleViewStatus.credits}
        </span>
      ) : null
    },
    {
      id: 'meta',
      name: 'Facebook / Meta Ads',
      description: 'Auto-sync ad leads, manage DMs, and respond to reviews across Facebook and Instagram.',
      category: 'Marketing',
      connected: facebookAdsStatus.connected,
      hasManage: false,
    },
    {
      id: 'tiktok',
      name: 'TikTok Ads',
      description: 'Connect to get leads from your TikTok lead generation ads into your CRM.',
      category: 'Marketing',
      connected: tiktokAdsStatus.connected,
      hasManage: false,
    },
    {
      id: 'google-business',
      name: 'Google Services',
      description: 'Connect Google Ads, Analytics, and Business Profile all at once.',
      category: 'Marketing',
      connected: googleBusinessStatus.connected,
      hasManage: false, // Managed on the Marketing page 
    },
    // {
    //   id: 'linkedin',
    //   name: 'LinkedIn',
    //   description: 'LinkedIn advertising and lead generation for B2B marketing',
    //   category: 'Marketing',
    //   connected: false,
    // },
    // {
    //   id: 'notion',
    //   name: 'Notion',
    //   description: 'Workspace and documentation integration for team collaboration',
    //   category: 'Productivity',
    //   connected: false,
    // },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Cloud storage and file management for documents and media',
      category: 'Productivity',
      connected: googleDriveStatus.connected,
      companyInfo: googleDriveStatus.email ? { Email: googleDriveStatus.email } : null,
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      description: 'Microsoft cloud storage for documents and media',
      category: 'Productivity',
      connected: oneDriveStatus.connected,
      companyInfo: oneDriveStatus.email ? { Email: oneDriveStatus.email } : null,
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
                  {integration.customStatus}
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

            {integration.id === 'google-drive' && integration.connected && integration.companyInfo && (
              <p className="text-xs text-green-600 dark:text-green-400 mb-4">
                Connected to: {integration.companyInfo.Email}
              </p>
            )}

            {integration.id === 'onedrive' && integration.connected && integration.companyInfo && (
              <p className="text-xs text-green-600 dark:text-green-400 mb-4">
                Connected to: {integration.companyInfo.Email}
              </p>
            )}

            {integration.id === 'srs-distribution' && integration.connected && srsStatus.accountNumber && (
              <div className="text-xs text-green-600 dark:text-green-400 mb-4 space-y-0.5">
                <p>Account: <span className="font-medium">{srsStatus.accountNumber}</span></p>
                {srsStatus.profile?.customer_details?.customerName && (
                  <p>Name: <span className="font-medium">{srsStatus.profile.customer_details.customerName}</span></p>
                )}
                {srsStatus.profile?.customer_details?.homeBranch && (
                  <p>Home Branch: <span className="font-medium">{srsStatus.profile.customer_details.homeBranch}</span></p>
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
            fetchSrsStatus();
            setShowSrsModal(false);
          }}
          onClose={() => setShowSrsModal(false)}
        />
      )}

      {showQxoModal && (
        <QxoConnection
          onConnectionSuccess={() => {
            fetchQxoStatus();
            setShowQxoModal(false);
          }}
          onClose={() => setShowQxoModal(false)}
        />
      )}

      {showQxoDetailsModal && (
        <QxoDetailsModal
          qxoStatus={qxoStatus as any}
          onClose={() => setShowQxoDetailsModal(false)}
        />
      )}

      {showSrsDetailsModal && srsStatus.profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-700">

            {/* Header hero */}
            <div className="relative bg-gradient-to-br from-red-600 to-red-700 px-6 pt-6 pb-8">
              <button
                onClick={() => setShowSrsDetailsModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-red-200 text-xs font-medium uppercase tracking-wider">SRS Distribution</p>
                  <h2 className="text-white text-lg font-bold leading-tight">Account Details</h2>
                </div>
              </div>
              {/* Big account number display */}
              <div className="bg-white/15 rounded-xl px-4 py-3">
                <p className="text-red-200 text-xs font-medium mb-0.5">Account Number</p>
                <p className="text-white text-xl font-bold tracking-wide font-mono">{srsStatus.profile.customer_code}</p>
              </div>
              {/* Connected badge */}
              <div className="absolute -bottom-3 right-6 flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Connected
              </div>
            </div>

            {/* Details rows */}
            <div className="flex-1 overflow-y-auto px-6 pt-7 pb-4 space-y-1">
              {[
                { icon: User, label: 'Customer Name', value: srsStatus.profile.customer_details?.customerName },
                { icon: Hash, label: 'Home Branch', value: srsStatus.profile.customer_details?.homeBranch },
                { icon: Mail, label: 'Email', value: srsStatus.profile.customer_details?.email || srsStatus.profile.customer_details?.emailAddress },
                { icon: Phone, label: 'Phone', value: srsStatus.profile.customer_details?.phone || srsStatus.profile.customer_details?.phoneNumber },
                { icon: MapPin, label: 'Location', value: [srsStatus.profile.customer_details?.city, srsStatus.profile.customer_details?.state].filter(Boolean).join(', ') || undefined },
                { icon: CheckCircle2, label: 'Validation', value: srsStatus.profile.customer_details?.validIndicator === 'Y' ? 'Valid ✓' : srsStatus.profile.customer_details?.validIndicator },
                { icon: Calendar, label: 'Connected Since', value: srsStatus.profile.updated_at ? new Date(srsStatus.profile.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined },
              ].filter(row => row.value).map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-red-500 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{value}</p>
                  </div>
                </div>
              ))}

              {/* Extra fields from SRS API response */}
              {srsStatus.profile.customer_details && (() => {
                const knownKeys = ['customerName','homeBranch','email','emailAddress','phone','phoneNumber','city','state','validIndicator'];
                const extras = Object.entries(srsStatus.profile.customer_details).filter(([k, v]) => !knownKeys.includes(k) && v !== null && v !== undefined && v !== '');
                return extras.length > 0 ? (
                  <details className="mt-1">
                    <summary className="text-xs text-gray-400 cursor-pointer select-none hover:text-gray-600 dark:hover:text-gray-300 py-1">
                      {extras.length} more field{extras.length !== 1 ? 's' : ''} from SRS
                    </summary>
                    <div className="mt-2 space-y-1">
                      {extras.map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                          <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[180px] ml-2">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                ) : null;
              })()}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 flex gap-3">
              <button
                onClick={() => { setShowSrsDetailsModal(false); setShowSrsModal(true); }}
                className="flex items-center justify-center gap-2 flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <RefreshCw className="h-4 w-4" />
                Reconnect
              </button>
              <button
                onClick={() => setShowSrsDetailsModal(false)}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2.5 text-sm font-medium text-white transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <EagleViewConnectionModal
        isOpen={showEagleViewModal}
        onClose={() => setShowEagleViewModal(false)}
        onSuccess={() => fetchEagleViewStatus()}
        currentCredits={eagleViewStatus.credits}
      />
    </div>
  );
};

export default Integrations;
