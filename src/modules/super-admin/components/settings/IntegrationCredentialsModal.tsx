import React, { useState } from 'react';
import { X, Loader2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import {
  testTwilioConnection,
  testStripeConnection,
  testJiraConnection,
  testGoogleWorkspaceConnection,
  saveIntegrationCredentials,
  IntegrationCredentials,
  TestConnectionResult,
  generateOAuthUrl,
} from '../../services/integrations-api-service';

interface Props {
  integrationId: 'twilio' | 'stripe' | 'jira' | 'google_workspace';
  integrationName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const IntegrationCredentialsModal: React.FC<Props> = ({
  integrationId,
  integrationName,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setTestResult(null);
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      let result: TestConnectionResult;

      switch (integrationId) {
        case 'twilio':
          result = await testTwilioConnection(formData);
          break;
        case 'stripe':
          result = await testStripeConnection(formData);
          break;
        case 'jira':
          result = await testJiraConnection(formData);
          break;
        case 'google_workspace':
          result = await testGoogleWorkspaceConnection(formData);
          break;
        default:
          result = { success: false, error: 'Unknown integration' };
      }

      setTestResult(result);
    } catch (error: any) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!testResult?.success) {
      setTestResult({
        success: false,
        error: 'Please test the connection before saving',
      });
      return;
    }

    setSaving(true);

    try {
      const result = await saveIntegrationCredentials(integrationId, formData);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setTestResult({
          success: false,
          error: result.error || 'Failed to save credentials',
        });
      }
    } catch (error: any) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleOAuthConnect = () => {
    if (integrationId === 'google_workspace') {
      const clientId = formData.clientId;
      if (!clientId) {
        setTestResult({ success: false, error: 'Please enter Client ID first' });
        return;
      }

      const redirectUri = `${window.location.origin}/super-admin/settings/integrations/oauth/callback`;
      const url = generateOAuthUrl('google_workspace', clientId, redirectUri);

      window.location.href = url;
    }
  };

  const renderTwilioFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account SID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.accountSid || ''}
          onChange={(e) => handleInputChange('accountSid', e.target.value)}
          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Auth Token <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showSecrets.authToken ? 'text' : 'password'}
            value={formData.authToken || ''}
            onChange={(e) => handleInputChange('authToken', e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => toggleSecretVisibility('authToken')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showSecrets.authToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.phoneNumber || ''}
          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
          placeholder="+1234567890"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent"
        />
      </div>
    </>
  );

  const renderStripeFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Secret Key <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showSecrets.secretKey ? 'text' : 'password'}
            value={formData.secretKey || ''}
            onChange={(e) => handleInputChange('secretKey', e.target.value)}
            placeholder="sk_live_..."
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => toggleSecretVisibility('secretKey')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showSecrets.secretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Publishable Key <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.publishableKey || ''}
          onChange={(e) => handleInputChange('publishableKey', e.target.value)}
          placeholder="pk_live_..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Webhook Secret (optional)
        </label>
        <div className="relative">
          <input
            type={showSecrets.webhookSecret ? 'text' : 'password'}
            value={formData.webhookSecret || ''}
            onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
            placeholder="whsec_..."
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => toggleSecretVisibility('webhookSecret')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showSecrets.webhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </>
  );

  const renderJiraFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Domain <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.domain || ''}
          onChange={(e) => handleInputChange('domain', e.target.value)}
          placeholder="your-domain.atlassian.net"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="your@email.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          API Token <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showSecrets.apiToken ? 'text' : 'password'}
            value={formData.apiToken || ''}
            onChange={(e) => handleInputChange('apiToken', e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => toggleSecretVisibility('apiToken')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showSecrets.apiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Key <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.projectKey || ''}
          onChange={(e) => handleInputChange('projectKey', e.target.value.toUpperCase())}
          placeholder="SUPPORT"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent"
        />
      </div>
    </>
  );

  const renderGoogleWorkspaceFields = () => (
    <>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-red-800">
          Google Workspace uses OAuth 2.0 for authentication. You'll need to create OAuth credentials in the Google Cloud Console.
        </p>
        <a
          href="https://console.cloud.google.com/apis/credentials"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center mt-2 text-sm text-red-600 hover:text-red-700"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Open Google Cloud Console
        </a>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.clientId || ''}
          onChange={(e) => handleInputChange('clientId', e.target.value)}
          placeholder="123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client Secret <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showSecrets.clientSecret ? 'text' : 'password'}
            value={formData.clientSecret || ''}
            onChange={(e) => handleInputChange('clientSecret', e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => toggleSecretVisibility('clientSecret')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showSecrets.clientSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleOAuthConnect}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Connect with Google
        </button>
      </div>
    </>
  );

  const renderFields = () => {
    switch (integrationId) {
      case 'twilio':
        return renderTwilioFields();
      case 'stripe':
        return renderStripeFields();
      case 'jira':
        return renderJiraFields();
      case 'google_workspace':
        return renderGoogleWorkspaceFields();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Connect {integrationName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {renderFields()}

          {testResult && (
            <div
              className={`rounded-lg p-4 ${
                testResult.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {testResult.success ? testResult.message : testResult.error}
              </p>
              {testResult.details && (
                <pre className="text-xs mt-2 text-gray-600">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          {integrationId !== 'google_workspace' && (
            <>
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {testing && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Test Connection</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !testResult?.success}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save & Connect</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
