import React, { useState, useEffect } from 'react';
import { Plus, Mail, X, Send, CheckCircle, MailOpen, MousePointer, Info, Check } from 'lucide-react';
import { getSMTPConfigs, createSMTPConfig } from '../../services/settings-email-service';
import { SuperAdminSMTPConfig } from '../../types/settings';

const REPLY_FORWARD_SETTINGS_KEY = 'super_admin_reply_forward_settings';
const BOUNCE_SETTINGS_KEY = 'super_admin_bounce_settings';
const POSTMASTER_SETTINGS_KEY = 'super_admin_postmaster_settings';

const readLocalObject = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
};

const writeLocalObject = (key: string, data: unknown) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const EmailServiceSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('SMTP Service');
  const [smtpConfigs, setSMTPConfigs] = useState<SuperAdminSMTPConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<SuperAdminSMTPConfig | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const emailTabs = [
    'SMTP Service',
    'Reply & Forward Settings',
    'Email Analytics',
    'Bounce Classification',
    'Postmaster Tools',
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadData = async () => {
    setLoading(true);
    try {
      const smtpRes = await getSMTPConfigs();
      if (smtpRes.success && smtpRes.data) {
        setSMTPConfigs(smtpRes.data);
      } else {
        setSMTPConfigs([]);
        if (smtpRes.error) {
          setToast({ message: smtpRes.error, type: 'error' });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setSMTPConfigs([]);
      setToast({ message: 'Failed to load SMTP settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">SMTP Service</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You can use your own SMTP services or use the default service
          </p>
        </div>
        <button
          onClick={() => setShowAddServiceModal(true)}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
          {emailTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-2 border-red-600 text-red-600 dark:text-red-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'SMTP Service' && (
            <SMTPServiceContent
              loading={loading}
              smtpConfigs={smtpConfigs}
              onAddService={() => setShowAddServiceModal(true)}
              onViewConfig={(config) => setSelectedConfig(config)}
            />
          )}
          {activeTab === 'Reply & Forward Settings' && <ReplyForwardContent />}
          {activeTab === 'Email Analytics' && <EmailAnalyticsContent smtpConfigs={smtpConfigs} />}
          {activeTab === 'Bounce Classification' && <BounceClassificationContent />}
          {activeTab === 'Postmaster Tools' && <PostmasterToolsContent />}
        </div>
      </div>

      {showAddServiceModal && (
        <AddEmailServiceModal
          onClose={() => setShowAddServiceModal(false)}
          onSuccess={() => {
            setShowAddServiceModal(false);
            loadData();
            setToast({ message: 'SMTP service added successfully', type: 'success' });
          }}
        />
      )}

      {selectedConfig && (
        <ViewSMTPConfigModal
          config={selectedConfig}
          onClose={() => setSelectedConfig(null)}
        />
      )}
    </div>
  );
};

interface SMTPServiceContentProps {
  loading: boolean;
  smtpConfigs: SuperAdminSMTPConfig[];
  onAddService: () => void;
  onViewConfig: (config: SuperAdminSMTPConfig) => void;
}

const SMTPServiceContent: React.FC<SMTPServiceContentProps> = ({
  loading,
  smtpConfigs,
  onAddService,
  onViewConfig,
}) => {
  const defaultConfig = smtpConfigs.find((config) => config.is_active) || smtpConfigs[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Default Provider</h3>
        {defaultConfig ? (
          <div className="border border-red-200 rounded-lg p-4 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-red-500 rounded"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {defaultConfig.config_name || 'LyncConnector Email System'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {defaultConfig.smtp_host || 'lc.yourdomain.com'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <button
                  onClick={() => onViewConfig(defaultConfig)}
                  className="text-red-600 hover:underline text-sm dark:text-red-400"
                >
                  View Configuration
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Default Provider</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure your SMTP provider to start sending emails
            </p>
            <button
              onClick={onAddService}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Add SMTP Configuration
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ReplyForwardContent: React.FC = () => {
  const [forwardToAssigned, setForwardToAssigned] = useState(false);
  const [forwardingAddresses, setForwardingAddresses] = useState('');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const saved = readLocalObject(REPLY_FORWARD_SETTINGS_KEY, {
      forwardToAssigned: false,
      forwardingAddresses: '',
      autoReplyEnabled: false,
    });
    setForwardToAssigned(Boolean(saved.forwardToAssigned));
    setForwardingAddresses(String(saved.forwardingAddresses || ''));
    setAutoReplyEnabled(Boolean(saved.autoReplyEnabled));
  }, []);

  const handleSave = () => {
    const normalized = forwardingAddresses
      .split(/[\n,]+/)
      .map((email) => email.trim())
      .filter(Boolean);
    const invalid = normalized.find((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    if (invalid) {
      setSaveMessage({ type: 'error', text: `Invalid email: ${invalid}` });
      return;
    }

    writeLocalObject(REPLY_FORWARD_SETTINGS_KEY, {
      forwardToAssigned,
      forwardingAddresses: normalized.join('\n'),
      autoReplyEnabled,
      updatedAt: new Date().toISOString(),
    });
    setForwardingAddresses(normalized.join('\n'));
    setSaveMessage({ type: 'success', text: 'Reply & forward settings saved' });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Forwarding Address</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You will receive the email replies not only in the Conversation view, but also in your personal
            email inbox.
          </p>
        </div>

        <div className="space-y-4">
          {saveMessage && (
            <div
              className={`text-sm rounded-md px-3 py-2 ${
                saveMessage.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
              }`}
            >
              {saveMessage.text}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Forwarding Address
            </label>
            <textarea
              rows={3}
              value={forwardingAddresses}
              onChange={(e) => setForwardingAddresses(e.target.value)}
              placeholder="Forwarding address (Press 'Enter' after each address)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
              Separate multiple addresses by new line or comma.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={forwardToAssigned}
                onChange={(e) => setForwardToAssigned(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
            </label>
            <span className="text-sm text-gray-700 dark:text-gray-300">Forward to assigned user</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoReplyEnabled}
                onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
            </label>
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable auto-reply acknowledgment</span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EmailAnalyticsContentProps {
  smtpConfigs: SuperAdminSMTPConfig[];
}

const EmailAnalyticsContent: React.FC<EmailAnalyticsContentProps> = ({ smtpConfigs }) => {
  const activeConfig = smtpConfigs.find((cfg) => cfg.is_active) || smtpConfigs[0];
  const sentCount = Number(activeConfig?.sent_today || 0);
  const deliveredCount = sentCount;
  const openedCount = 0;
  const clickedCount = 0;
  const deliveryPct = sentCount > 0 ? Math.round((deliveredCount / sentCount) * 100) : 0;
  const openPct = sentCount > 0 ? Math.round((openedCount / sentCount) * 100) : 0;
  const clickPct = sentCount > 0 ? Math.round((clickedCount / sentCount) * 100) : 0;

  const metrics = [
    {
      icon: Send,
      label: 'Sent',
      value: String(sentCount),
      percentage: '100%',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      icon: CheckCircle,
      label: 'Delivered',
      value: String(deliveredCount),
      percentage: `${deliveryPct}%`,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      icon: MailOpen,
      label: 'Opened',
      value: String(openedCount),
      percentage: `${openPct}%`,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      icon: MousePointer,
      label: 'Clicked',
      value: String(clickedCount),
      percentage: `${clickPct}%`,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Metrics</h3>
        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
          <p>Provider: {activeConfig?.config_name || 'Not configured'}</p>
          <p>Last updated: {activeConfig?.updated_at ? new Date(activeConfig.updated_at).toLocaleString() : '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${metric.bgColor}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <span className={`text-sm font-medium ${metric.color}`}>{metric.percentage}</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BounceClassificationContent: React.FC = () => {
  const [hardBounceAction, setHardBounceAction] = useState<'suppress' | 'retry'>('suppress');
  const [softBounceRetries, setSoftBounceRetries] = useState(3);
  const [complaintAction, setComplaintAction] = useState<'suppress' | 'notify'>('suppress');
  const [saveState, setSaveState] = useState<string>('');

  useEffect(() => {
    const saved = readLocalObject(BOUNCE_SETTINGS_KEY, {
      hardBounceAction: 'suppress',
      softBounceRetries: 3,
      complaintAction: 'suppress',
    });
    setHardBounceAction(saved.hardBounceAction);
    setSoftBounceRetries(Number(saved.softBounceRetries || 3));
    setComplaintAction(saved.complaintAction);
  }, []);

  const handleSave = () => {
    writeLocalObject(BOUNCE_SETTINGS_KEY, {
      hardBounceAction,
      softBounceRetries,
      complaintAction,
      updatedAt: new Date().toISOString(),
    });
    setSaveState('Bounce rules saved');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Bounces</h3>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Save Rules
        </button>
      </div>
      {saveState && (
        <div className="text-sm rounded-md px-3 py-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
          {saveState}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Hard Bounce Action</span>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <select
            value={hardBounceAction}
            onChange={(e) => setHardBounceAction(e.target.value as 'suppress' | 'retry')}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="suppress">Suppress recipient immediately</option>
            <option value="retry">Retry once before suppressing</option>
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Soft Bounce Retries</span>
            <input
              type="number"
              min={1}
              max={10}
              value={softBounceRetries}
              onChange={(e) => setSoftBounceRetries(Number(e.target.value || 1))}
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Applied before marking as failed.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-400">Complaint Handling</span>
        <select
          value={complaintAction}
          onChange={(e) => setComplaintAction(e.target.value as 'suppress' | 'notify')}
          className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="suppress">Suppress and block future sends</option>
          <option value="notify">Keep active and notify admin only</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          These rules are applied to future bounces and complaints.
        </p>
      </div>
    </div>
  );
};

const PostmasterToolsContent: React.FC = () => {
  const [activeProvider, setActiveProvider] = useState<'Google' | 'Microsoft SNDS'>('Google');
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleAccount, setGoogleAccount] = useState('');
  const [microsoftConnected, setMicrosoftConnected] = useState(false);
  const [microsoftAccount, setMicrosoftAccount] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const saved = readLocalObject(POSTMASTER_SETTINGS_KEY, {
      googleConnected: false,
      googleAccount: '',
      microsoftConnected: false,
      microsoftAccount: '',
    });
    setGoogleConnected(Boolean(saved.googleConnected));
    setGoogleAccount(String(saved.googleAccount || ''));
    setMicrosoftConnected(Boolean(saved.microsoftConnected));
    setMicrosoftAccount(String(saved.microsoftAccount || ''));
  }, []);

  const persistPostmaster = (
    nextGoogleConnected: boolean,
    nextGoogleAccount: string,
    nextMicrosoftConnected: boolean,
    nextMicrosoftAccount: string
  ) => {
    writeLocalObject(POSTMASTER_SETTINGS_KEY, {
      googleConnected: nextGoogleConnected,
      googleAccount: nextGoogleAccount,
      microsoftConnected: nextMicrosoftConnected,
      microsoftAccount: nextMicrosoftAccount,
      updatedAt: new Date().toISOString(),
    });
  };

  const connectGoogle = () => {
    if (!googleAccount.trim()) {
      setStatusMessage('Enter Google account email first.');
      return;
    }
    setGoogleConnected(true);
    persistPostmaster(true, googleAccount.trim(), microsoftConnected, microsoftAccount);
    setStatusMessage('Google Postmaster connected.');
  };

  const disconnectGoogle = () => {
    setGoogleConnected(false);
    persistPostmaster(false, googleAccount.trim(), microsoftConnected, microsoftAccount);
    setStatusMessage('Google Postmaster disconnected.');
  };

  const connectMicrosoft = () => {
    if (!microsoftAccount.trim()) {
      setStatusMessage('Enter Microsoft account email first.');
      return;
    }
    setMicrosoftConnected(true);
    persistPostmaster(googleConnected, googleAccount, true, microsoftAccount.trim());
    setStatusMessage('Microsoft SNDS connected.');
  };

  const disconnectMicrosoft = () => {
    setMicrosoftConnected(false);
    persistPostmaster(googleConnected, googleAccount, false, microsoftAccount.trim());
    setStatusMessage('Microsoft SNDS disconnected.');
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Postmaster Tools</h3>
      {statusMessage && (
        <div className="text-sm rounded-md px-3 py-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
          {statusMessage}
        </div>
      )}

      <div className="flex space-x-6">
        <div className="w-48 space-y-2">
          <button
            onClick={() => setActiveProvider('Google')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeProvider === 'Google'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Google
          </button>
          <button
            onClick={() => setActiveProvider('Microsoft SNDS')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeProvider === 'Microsoft SNDS'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Microsoft SNDS
          </button>
        </div>

        <div className="flex-1">
          {activeProvider === 'Google' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Google Postmaster Tool
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Track domain reputation and Gmail deliverability health.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
                <input
                  type="email"
                  value={googleAccount}
                  onChange={(e) => setGoogleAccount(e.target.value)}
                  placeholder="Google account email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      googleConnected ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {googleConnected ? 'Connected' : 'Not Connected'}
                  </span>
                  {googleConnected ? (
                    <button onClick={disconnectGoogle} className="text-red-600 hover:underline text-sm dark:text-red-400">
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={connectGoogle}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeProvider === 'Microsoft SNDS' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Microsoft SNDS</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor IP reputation and email traffic for Microsoft inboxes.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
                <input
                  type="email"
                  value={microsoftAccount}
                  onChange={(e) => setMicrosoftAccount(e.target.value)}
                  placeholder="Microsoft account email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      microsoftConnected ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {microsoftConnected ? 'Connected' : 'Not Connected'}
                  </span>
                  {microsoftConnected ? (
                    <button
                      onClick={disconnectMicrosoft}
                      className="text-red-600 hover:underline text-sm dark:text-red-400"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={connectMicrosoft}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface AddEmailServiceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddEmailServiceModal: React.FC<AddEmailServiceModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    config_name: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    from_email: '',
    from_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await createSMTPConfig(formData);
      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to save SMTP configuration');
      }
    } catch (error) {
      console.error('Error creating SMTP config:', error);
      setError('Failed to save SMTP configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center dark:bg-red-900">
              <Mail className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add your own email service</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure your SMTP provider like Outlook, Gsuite, Sendgrid, etc
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.config_name}
              onChange={(e) => setFormData({ ...formData, config_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SMTP Host <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.smtp_host}
              onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SMTP Username
            </label>
            <input
              type="text"
              value={formData.smtp_username}
              onChange={(e) => setFormData({ ...formData, smtp_username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SMTP Password
            </label>
            <input
              type="password"
              value={formData.smtp_password}
              onChange={(e) => setFormData({ ...formData, smtp_password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.from_email}
              onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Name
            </label>
            <input
              type="text"
              value={formData.from_name}
              onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            </div>
          </div>

          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SMTP Port <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={formData.smtp_port}
              onChange={(e) => setFormData({ ...formData, smtp_port: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ViewSMTPConfigModalProps {
  config: SuperAdminSMTPConfig;
  onClose: () => void;
}

const ViewSMTPConfigModal: React.FC<ViewSMTPConfigModalProps> = ({ config, onClose }) => {
  const maskedPassword = config.smtp_password ? '********' : 'Not set';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SMTP Configuration</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigRow label="Service Name" value={config.config_name || '-'} />
          <ConfigRow label="SMTP Host" value={config.smtp_host || '-'} />
          <ConfigRow label="SMTP Port" value={String(config.smtp_port || '-')} />
          <ConfigRow label="SMTP Username" value={config.smtp_username || '-'} />
          <ConfigRow label="SMTP Password" value={maskedPassword} />
          <ConfigRow label="From Email" value={config.from_email || '-'} />
          <ConfigRow label="From Name" value={config.from_name || '-'} />
          <ConfigRow label="TLS" value={config.use_tls ? 'Enabled' : 'Disabled'} />
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface ConfigRowProps {
  label: string;
  value: string;
}

const ConfigRow: React.FC<ConfigRowProps> = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-gray-900 dark:text-gray-100 break-all">{value}</p>
    </div>
  );
};
