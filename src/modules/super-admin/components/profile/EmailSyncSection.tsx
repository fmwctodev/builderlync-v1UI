import React, { useState } from 'react';
import { Mail, Check, Copy, Loader2 } from 'lucide-react';

const EmailSyncSection: React.FC = () => {
  const [bccEmail] = useState('super-admin@builderlync.com');
  const [copySuccess, setCopySuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCopyBccEmail = () => {
    navigator.clipboard.writeText(bccEmail);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Email Sync
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure email synchronization settings for your super admin account.
        </p>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Auto Bcc Sync</h4>
          <p className="text-sm text-gray-600 mb-4">
            Add this email address to the Bcc field when sending emails to automatically sync conversations.
          </p>

          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={bccEmail}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
            />
            <button
              onClick={handleCopyBccEmail}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              <Copy className="w-4 h-4" />
              <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};

export default EmailSyncSection;
