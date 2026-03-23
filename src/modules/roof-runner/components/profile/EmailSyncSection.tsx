import React, { useState } from 'react';
import { Mail, Check, Edit, Trash2, Copy, Loader2 } from 'lucide-react';

interface EmailConnection {
  id: string;
  email: string;
  provider: 'gmail' | 'outlook';
  status: 'connected' | 'disconnected';
}

const EmailSyncSection: React.FC = () => {
  const [connections, setConnections] = useState<EmailConnection[]>([
    {
      id: '1',
      email: 'sean@sitehues.com',
      provider: 'gmail',
      status: 'connected',
    },
  ]);

  const [bccEmail] = useState('q2iaW0RqmhWprtDxMwrx@email.usercontent.site');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyBccEmail = () => {
    navigator.clipboard.writeText(bccEmail);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDeleteConnection = (id: string) => {
    if (confirm('Are you sure you want to disconnect this email?')) {
      setConnections(connections.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Email (2-way sync)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Connect to sync incoming & outgoing emails between the CRM & your personal email account.
        </p>

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
                    <div className="flex items-center space-x-3">
                      <button
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteConnection(connection.id)}
                        className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
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
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <span>Update Availability</span>
        </button>
      </div>
    </div>
  );
};

export default EmailSyncSection;
