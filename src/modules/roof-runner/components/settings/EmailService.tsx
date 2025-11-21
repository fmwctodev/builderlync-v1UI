import React, { useState } from 'react';
import { Plus, Mail, X, ExternalLink, Send, CheckCircle, MailOpen, MousePointer, Flag, MessageSquare, Bell, XCircle, Info, ArrowRight, AlertTriangle, Check } from 'lucide-react';

const EmailService: React.FC = () => {
  const emailTabs = [
    "SMTP Service",
    "Reply & Forward Settings", 
    "Email Analytics",
    "Bounce Classification",
    "Postmaster Tools",
  ];

  const [activeEmail, setActiveEmail] = useState(emailTabs[0]);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            SMTP Service
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You can use your own SMTP services or use the default service
          </p>
        </div>
        <button
          onClick={() => setShowAddServiceModal(true)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus size={16} />
          <span>Add Service</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
          {emailTabs.map((emailTab) => (
            <button
              key={emailTab}
              onClick={() => setActiveEmail(emailTab)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap
                ${activeEmail === emailTab
                  ? "border-b-2 border-primary-600 text-primary-600 dark:text-primary-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }
              `}
            >
              {emailTab}
            </button>
          ))}
        </div>

        <div>
          {activeEmail === "SMTP Service" && <SMTPServiceContent />}
          {activeEmail === "Reply & Forward Settings" && <ReplyForwardContent />}
          {activeEmail === "Email Analytics" && <EmailAnalyticsContent />}
          {activeEmail === "Bounce Classification" && <BounceClassificationContent />}
          {activeEmail === "Postmaster Tools" && <PostmasterToolsContent />}
        </div>
      </div>

      {showAddServiceModal && (
        <AddEmailServiceModal onClose={() => setShowAddServiceModal(false)} />
      )}
    </div>
  );
};

const AddEmailServiceModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center dark:bg-primary-900">
              <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add your own email service</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Configure your SMTP provider like Outlook, Gsuite, Sendgrid, etc</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SMTP Provider <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const SMTPServiceContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Default Provider</h3>
        <div className="border border-primary-200 rounded-lg p-4 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-primary-500 rounded"></div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">LeadConnector Email System</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">lc.automationlab.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <button className="text-primary-600 hover:underline text-sm dark:text-primary-400">
                View Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReplyForwardContent: React.FC = () => {
  const [forwardToAssigned, setForwardToAssigned] = useState(false);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Forwarding Address</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You will receive the email replies not only in the Conversation view, but also in your personal email inbox.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Forwarding Address</label>
            <textarea
              rows={3}
              placeholder="Forwarding address (Press 'Enter' after each address)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
            <span className="text-sm text-gray-700 dark:text-gray-300">Forward to assigned user</span>
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
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
    { icon: Send, label: 'Sent', value: '109', percentage: '100%', color: 'text-green-600', bgColor: 'bg-green-100' },
    { icon: CheckCircle, label: 'Delivered', value: '109', percentage: '100%', color: 'text-green-600', bgColor: 'bg-green-100' },
    { icon: MailOpen, label: 'Opened', value: '14', percentage: '13%', color: 'text-green-600', bgColor: 'bg-green-100' },
    { icon: MousePointer, label: 'Clicked', value: '0', percentage: '0%', color: 'text-green-600', bgColor: 'bg-green-100' },
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
                <span className={`text-sm font-medium ${metric.color}`}>
                  {metric.percentage}
                </span>
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
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Google Postmaster Tool</h4>
                <p className="text-gray-600 dark:text-gray-400">With Google Postmaster Tools, you can optimize email performance and ensure accurate delivery to Gmail inboxes.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Connected to Google Postmaster</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <button className="text-red-600 hover:underline text-sm dark:text-red-400">Revoke</button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Connected Account: sean@sitehues.com | Account Name: Sean Richard</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailService;