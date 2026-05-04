import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  getProposalSettings,
  updateProposalSettings,
  ProposalSettings
} from '../../../../shared/store/services/profileApi';

export default function SettingsPanel() {
  const [settings, setSettings] = useState<ProposalSettings>({
    enableCompanyRepresentativeSignature: true,
    signatureFullName: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await getProposalSettings();
        if (response.success && response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Failed to load proposal settings:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        ...settings,
        signatureFullName: settings.signatureFullName.trim()
      };
      const response = await updateProposalSettings(payload);
      if (response.success && response.data) {
        setSettings(response.data);
      }
      alert('Proposal settings saved');
    } catch (error) {
      console.error('Failed to save proposal settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Supplier</h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-gray-900 dark:text-white">Enable preferred suppliers on future proposals for your team</div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Automatically select your preferred supplier to use their costs instead of unit costs
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No preferred suppliers have been selected. <button className="text-primary-600 hover:text-primary-700">Click here to update your preferences.</button>
          </p>
        </div>
      </div> */}

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Company representative signatures</h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-gray-900 dark:text-white">Enable on future proposals for your team</div>
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  enableCompanyRepresentativeSignature: !prev.enableCompanyRepresentativeSignature
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableCompanyRepresentativeSignature
                  ? 'bg-primary-600'
                  : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableCompanyRepresentativeSignature ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Proposals will automatically include the job assignee's signature on the authorization page
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your signature</h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your full name
            </label>
            <input
              type="text"
              value={settings.signatureFullName}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  signatureFullName: e.target.value
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Below is how your signature will appear on documents to customers
            </p>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-4">
              <div className="text-lg font-script text-gray-900 dark:text-white mb-1">
                {settings.signatureFullName || 'Your Name'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {settings.signatureFullName || 'Your Name'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
