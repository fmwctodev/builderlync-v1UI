import React, { useState, useEffect } from 'react';
import { Plus, Mail, X, Send, CheckCircle, MailOpen, MousePointer, Info, Check } from 'lucide-react';
import { getSMTPConfigs, createSMTPConfig } from '../../services/settings-email-service';
import { SuperAdminSMTPConfig } from '../../types/settings';

export const EmailServiceSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('SMTP Service');
  const [smtpConfigs, setSMTPConfigs] = useState<SuperAdminSMTPConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
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
      }
    } catch (error) {
      console.error('Error loading data:', error);
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
          {activeTab === 'SMTP Service' && <SMTPServiceContent loading={loading} smtpConfigs={smtpConfigs} />}
          {activeTab === 'Reply & Forward Settings' && <ReplyForwardContent />}
          {activeTab === 'Email Analytics' && <EmailAnalyticsContent />}
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
    </div>
  );
};

interface SMTPServiceContentProps {
  loading: boolean;
  smtpConfigs: SuperAdminSMTPConfig[];
}

const SMTPServiceContent: React.FC<SMTPServiceContentProps> = ({ loading, smtpConfigs }) => {
  const defaultConfig = smtpConfigs.find((config) => config.is_default);

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
                    {defaultConfig.name || 'LyncConnector Email System'}
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
                <button className="text-red-600 hover:underline text-sm dark:text-red-400">
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
            <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
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

  const handleSave = () => {
    console.log('Saving forwarding settings:', { forwardingAddresses, forwardToAssigned });
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
          </div>

          <div className="flex items-center space-x-3">
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

const EmailAnalyticsContent: React.FC = () => {
  const metrics = [
    {
      icon: Send,
      label: 'Sent',
      value: '109',
      percentage: '100%',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      icon: CheckCircle,
      label: 'Delivered',
      value: '109',
      percentage: '100%',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      icon: MailOpen,
      label: 'Opened',
      value: '14',
      percentage: '13%',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      icon: MousePointer,
      label: 'Clicked',
      value: '0',
      percentage: '0%',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Metrics</h3>
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Bounces</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Permanent Bounce</span>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Rate</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">100%</p>
        </div>
      </div>
    </div>
  );
};

const PostmasterToolsContent: React.FC = () => {
  const [activeProvider, setActiveProvider] = useState('Google');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Postmaster Tools</h3>

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
                  With Google Postmaster Tools, you can optimize email performance and ensure accurate delivery to
                  Gmail inboxes.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Connected to Google Postmaster
                    </span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <button className="text-red-600 hover:underline text-sm dark:text-red-400">Revoke</button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connected Account: admin@builderlync.com | Account Name: Platform Admin
                </p>
              </div>
            </div>
          )}

          {activeProvider === 'Microsoft SNDS' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Microsoft SNDS</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Microsoft Smart Network Data Services helps monitor and improve email deliverability to Outlook and
                  Microsoft email services.
                </p>
              </div>

              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Not Connected</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Connect your Microsoft SNDS account to start monitoring
                </p>
                <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Connect to Microsoft SNDS
                </button>
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
    name: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    from_name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await createSMTPConfig(formData);
      if (response.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating SMTP config:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

          <div>
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

          <div className="flex justify-end space-x-3 mt-6">
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
