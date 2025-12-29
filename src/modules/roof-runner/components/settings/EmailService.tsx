import React, { useState, useEffect } from 'react';
import { Plus, Mail, X, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { smtpApi } from '../../../../shared/services/smtpApi';

const EmailService: React.FC = () => {
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [smtpSettings, setSmtpSettings] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');

  useEffect(() => {
    fetchSmtpSettings();
  }, []);

  const fetchSmtpSettings = async () => {
    try {
      const data = await smtpApi.getSettings();
      setSmtpSettings(data);
      if (data.host) {
        testConnection(data);
      }
    } catch (error) {
      console.error('Failed to fetch SMTP settings:', error);
    }
  };

  const testConnection = async (settings: any) => {
    setConnectionStatus('testing');
    try {
      const result = await smtpApi.testConnection(settings);
      setConnectionStatus(result.success ? 'connected' : 'disconnected');
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Email Service
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your SMTP settings to send emails from your own email account
          </p>
        </div>
        <button
          onClick={() => setShowAddServiceModal(true)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus size={16} />
          <span>{smtpSettings?.host ? 'Edit Settings' : 'Add Service'}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        {smtpSettings?.host ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center dark:bg-primary-900">
                  <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{smtpSettings.from_name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{smtpSettings.from_email}</p>
                  <p className="text-xs text-gray-500">{smtpSettings.host}:{smtpSettings.port}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {connectionStatus === 'testing' && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Testing...</span>
                  </div>
                )}
                {connectionStatus === 'connected' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Connected</span>
                  </div>
                )}
                {connectionStatus === 'disconnected' && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">Disconnected</span>
                  </div>
                )}
                <button 
                  onClick={() => testConnection(smtpSettings)}
                  className="text-primary-600 hover:underline text-sm dark:text-primary-400"
                >
                  Test Connection
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Email Service Configured</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure your SMTP settings to start sending emails from your own account
            </p>
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Configure SMTP
            </button>
          </div>
        )}
      </div>

      {showAddServiceModal && (
        <AddEmailServiceModal 
          onClose={() => setShowAddServiceModal(false)} 
          onSave={fetchSmtpSettings}
          existingSettings={smtpSettings}
        />
      )}
    </div>
  );
};

const AddEmailServiceModal: React.FC<{ 
  onClose: () => void; 
  onSave: () => void;
  existingSettings?: any;
}> = ({ onClose, onSave, existingSettings }) => {
  const [formData, setFormData] = useState({
    host: existingSettings?.host || '',
    port: existingSettings?.port || '587',
    secure: existingSettings?.secure || false,
    user: existingSettings?.user || '',
    pass: existingSettings?.pass || '',
    fromName: existingSettings?.from_name || '',
    fromEmail: existingSettings?.from_email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await smtpApi.saveSettings(formData);
      onSave();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save SMTP settings';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTestStatus('testing');
    try {
      const result = await smtpApi.testConnection(formData);
      setTestStatus(result.success ? 'success' : 'error');
    } catch (error) {
      setTestStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {existingSettings ? 'Edit SMTP Settings' : 'Add SMTP Service'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Host *
              </label>
              <input
                type="text"
                required
                value={formData.host}
                onChange={(e) => setFormData({...formData, host: e.target.value})}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Port *
              </label>
              <input
                type="number"
                required
                value={formData.port}
                onChange={(e) => setFormData({...formData, port: e.target.value})}
                placeholder="587"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.user}
              onChange={(e) => setFormData({...formData, user: e.target.value})}
              placeholder="your-email@gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password *
            </label>
            <input
              type="password"
              required
              value={formData.pass}
              onChange={(e) => setFormData({...formData, pass: e.target.value})}
              placeholder="App password or email password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Name *
            </label>
            <input
              type="text"
              required
              value={formData.fromName}
              onChange={(e) => setFormData({...formData, fromName: e.target.value})}
              placeholder="Your Company Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Email *
            </label>
            <input
              type="email"
              required
              value={formData.fromEmail}
              onChange={(e) => setFormData({...formData, fromEmail: e.target.value})}
              placeholder="noreply@yourcompany.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="secure"
              checked={formData.secure}
              onChange={(e) => setFormData({...formData, secure: e.target.checked})}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="secure" className="text-sm text-gray-700 dark:text-gray-300">
              Use SSL/TLS (port 465)
            </label>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={testConnection}
              disabled={testStatus === 'testing'}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {testStatus === 'testing' && <Loader2 className="w-4 h-4 animate-spin" />}
              {testStatus === 'success' && <Check className="w-4 h-4 text-green-600" />}
              {testStatus === 'error' && <AlertTriangle className="w-4 h-4 text-red-600" />}
              <span>Test Connection</span>
            </button>

            <div className="flex space-x-3">
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
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailService;