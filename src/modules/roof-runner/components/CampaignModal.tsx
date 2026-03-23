import React, { useState, useEffect } from 'react';
import { X, Mail, MessageSquare, Calendar, Users, Save, Send } from 'lucide-react';
import { CampaignType, CampaignFormData, CAMPAIGN_TEMPLATES } from '../types/campaigns';

interface CampaignModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: CampaignFormData, sendNow: boolean) => Promise<void>;
  initialData?: Partial<CampaignFormData>;
}

const CampaignModal: React.FC<CampaignModalProps> = ({ show, onClose, onSave, initialData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignType, setCampaignType] = useState<CampaignType>('email');

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    type: 'email',
    subject: '',
    from_name: '',
    from_email: '',
    content: '',
    target_audience: {
      filter_type: 'all',
      estimated_count: 0,
    },
    tags: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
      if (initialData.type) {
        setCampaignType(initialData.type);
      }
    }
  }, [initialData]);

  useEffect(() => {
    setFormData({ ...formData, type: campaignType });
  }, [campaignType]);

  if (!show) return null;

  const handleTypeChange = (type: CampaignType) => {
    setCampaignType(type);
  };

  const handleTemplateSelect = (templateKey: keyof typeof CAMPAIGN_TEMPLATES) => {
    const template = CAMPAIGN_TEMPLATES[templateKey];
    setFormData({
      ...formData,
      name: template.name,
      subject: campaignType === 'email' ? template.email_subject : '',
      content: campaignType === 'email' ? template.email_content : template.sms_content,
    });
  };

  const handleAudienceChange = (key: string, value: any) => {
    setFormData({
      ...formData,
      target_audience: {
        ...formData.target_audience,
        [key]: value,
      },
    });
  };

  const calculateSMSSegments = (text: string): number => {
    const length = text.length;
    if (length === 0) return 0;
    if (length <= 160) return 1;
    return Math.ceil(length / 153);
  };

  const handleSubmit = async (sendNow: boolean) => {
    setIsLoading(true);
    try {
      await onSave(formData, sendNow);
      onClose();
    } catch (error) {
      console.error('Error saving campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (!formData.name || !formData.content) return false;
    if (campaignType === 'email' && !formData.subject) return false;
    return true;
  };

  const smsSegments = campaignType === 'sms' ? calculateSMSSegments(formData.content) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {initialData ? 'Edit Campaign' : 'Create New Campaign'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Campaign Type and Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Type</h3>

            {/* Type Selector */}
            <div className="flex gap-4">
              <button
                onClick={() => handleTypeChange('email')}
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  campaignType === 'email'
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Mail className={`h-8 w-8 ${campaignType === 'email' ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${campaignType === 'email' ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    Email Campaign
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleTypeChange('sms')}
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  campaignType === 'sms'
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <MessageSquare className={`h-8 w-8 ${campaignType === 'sms' ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${campaignType === 'sms' ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    SMS Campaign
                  </span>
                </div>
              </button>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Use Template (Optional)
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                onChange={(e) => e.target.value && handleTemplateSelect(e.target.value as keyof typeof CAMPAIGN_TEMPLATES)}
              >
                <option value="">Start from scratch</option>
                <option value="database_reactivation">Database Reactivation</option>
                <option value="follow_up">Follow-up Sequence</option>
                <option value="proposal_followup">Proposal Follow-up</option>
              </select>
            </div>

            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter campaign name"
              />
            </div>

            {/* Email-specific fields */}
            {campaignType === 'email' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject Line <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter email subject"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={formData.from_name}
                      onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Your Company"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={formData.from_email}
                      onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                      placeholder="hello@company.com"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Step 2: Content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {campaignType === 'email' ? 'Email Content' : 'SMS Message'}
              </h3>
              {campaignType === 'sms' && (
                <span className={`text-sm font-medium ${formData.content.length > 160 ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400'}`}>
                  {formData.content.length} characters • {smsSegments} segment{smsSegments !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={campaignType === 'email' ? 12 : 6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                placeholder={campaignType === 'email' ? 'Enter your email content...' : 'Enter your SMS message...'}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Use merge fields: {'{'}{'{'} first_name {'}'}{'}'}, {'{'}{'{'} last_name {'}'}{'}'}, {'{'}{'{'} company_name {'}'}{'}'}
              </p>
            </div>
          </div>

          {/* Step 3: Target Audience */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Target Audience
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Audience Filter
              </label>
              <select
                value={formData.target_audience.filter_type}
                onChange={(e) => handleAudienceChange('filter_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Contacts</option>
                <option value="status">Filter by Job Status</option>
                <option value="tags">Filter by Tags</option>
                <option value="custom">Custom Filter</option>
              </select>
            </div>

            {formData.target_audience.filter_type === 'status' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Status
                </label>
                <select
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    handleAudienceChange('job_statuses', values);
                  }}
                >
                  <option value="new_lead">New Lead</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal_sent">Proposal Sent</option>
                  <option value="job_lost">Job Lost</option>
                  <option value="won">Won</option>
                </select>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Estimated Recipients: <span className="font-semibold">{formData.target_audience.estimated_count || '0'}</span>
              </p>
            </div>
          </div>

          {/* Step 4: Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Send Date & Time (Optional - leave blank to send immediately)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_date || ''}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit(false)}
              disabled={!isFormValid() || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Saving...' : 'Save as Draft'}</span>
            </button>

            <button
              onClick={() => handleSubmit(true)}
              disabled={!isFormValid() || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>{isLoading ? 'Sending...' : formData.scheduled_date ? 'Schedule' : 'Send Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignModal;
