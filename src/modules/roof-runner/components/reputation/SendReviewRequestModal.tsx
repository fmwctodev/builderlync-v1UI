import React, { useState } from 'react';
import { X, Mail, MessageSquare, Phone } from 'lucide-react';

interface SendReviewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SendReviewRequestModal: React.FC<SendReviewRequestModalProps> = ({ isOpen, onClose }) => {
  const [activeMode, setActiveMode] = useState('email');
  const [formData, setFormData] = useState({
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    modes: [] as string[]
  });

  if (!isOpen) return null;

  const modes = [
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'sms', label: 'SMS', icon: MessageSquare }
  ];

  const renderModeContent = () => {
    switch (activeMode) {
      case 'email':
        return (
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Reach out to your customers through Email for more reviews!<br />
              Enable Email Review Requests to seamlessly collect customer feedback and boost your online reputation.
            </p>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg">
              Enable email request
            </button>
          </div>
        );
      case 'sms':
        return (
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Reach out to your customers through SMS for instant reviews!<br />
              SMS has higher open rates, making it a quick, direct, and easy way to collect valuable feedback.
            </p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
              Enable sms request
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Send Review Request</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Invite Your Customers to Leave a Review</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter contact name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter email address"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose Modes
            </label>
            <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
              {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                      activeMode === mode.id
                        ? 'bg-primary-50 text-blue-700 border-b-2 border-blue-700 dark:bg-primary-900/30 dark:text-blue-300'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {mode.label}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4">
              {renderModeContent()}
            </div>
          </div>

          <div className="flex justify-end">
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg">
              Send Review Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendReviewRequestModal;