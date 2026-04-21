import React, { useState, useEffect } from 'react';
import { X, Mail, MessageSquare, Calendar, Users, Save, Send, Eye } from 'lucide-react';
import { CampaignType, CampaignFormData, CAMPAIGN_TEMPLATES, Campaign } from '../types/campaigns';
import { campaignsApi } from '../../../shared/services/campaignsApi';

interface CampaignModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: CampaignFormData, sendNow: boolean) => Promise<void>;
  initialData?: Partial<CampaignFormData>;
  editingCampaign?: Campaign | null;
}

const CampaignModal: React.FC<CampaignModalProps> = ({ show, onClose, onSave, initialData, editingCampaign }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignType, setCampaignType] = useState<CampaignType>('email');

  const [sendImmediately, setSendImmediately] = useState(true);
  const [recipientData, setRecipientData] = useState<{ count: number; recipients: Array<{ name: string; email?: string; phone?: string }> }>({ count: 0, recipients: [] });
  const [showRecipients, setShowRecipients] = useState(false);

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
    const fetchInitialEstimate = async (audience: any) => {
      try {
        const estimate = await campaignsApi.getRecipientEstimate({
          filter_type: audience.filter_type,
          job_statuses: audience.filter_type === 'status' ? audience.job_statuses : undefined,
          opportunity_stages: audience.filter_type === 'opportunities' ? audience.opportunity_stages : undefined,
          tags: audience.tags,
        });
        setRecipientData(estimate);
      } catch (error) {
        console.error('Error fetching initial recipient estimate:', error);
      }
    };

    if (show) {
      if (editingCampaign) {
        // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
        let formattedDate = '';
        if (editingCampaign.scheduled_date) {
          const date = new Date(editingCampaign.scheduled_date);
          formattedDate = date.toISOString().slice(0, 16);
        }

        setFormData({
          name: editingCampaign.name,
          type: editingCampaign.type,
          subject: editingCampaign.subject || '',
          from_name: editingCampaign.from_name || '',
          from_email: editingCampaign.from_email || '',
          content: editingCampaign.content,
          target_audience: editingCampaign.target_audience || {
            filter_type: 'all',
            estimated_count: 0,
          },
          tags: editingCampaign.tags || [],
          scheduled_date: formattedDate,
        });
        setCampaignType(editingCampaign.type);
        setSendImmediately(!editingCampaign.scheduled_date);
        
        if (editingCampaign.target_audience) {
          fetchInitialEstimate(editingCampaign.target_audience);
        }
      } else {
        setFormData({
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
        setCampaignType('email');
        setSendImmediately(true);
        setRecipientData({ count: 0, recipients: [] });
      }
    }
  }, [show, editingCampaign]);

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
    
    // Set predefined settings based on template
    let targetAudience = { ...formData.target_audience };
    let campaignName = template.name;
    
    // Configure audience based on template type
    switch (templateKey) {
      case 'database_reactivation':
        targetAudience = {
          filter_type: 'opportunities',
          opportunity_stages: ['lost'],
          estimated_count: 0
        };
        break;
      case 'follow_up':
        targetAudience = {
          filter_type: 'opportunities', 
          opportunity_stages: ['open'],
          estimated_count: 0
        };
        break;
      case 'proposal_followup':
        targetAudience = {
          filter_type: 'status',
          job_statuses: ['Proposal Sent'],
          estimated_count: 0
        };
        break;
      default:
        targetAudience = {
          filter_type: 'all',
          estimated_count: 0
        };
    }
    
    setFormData({
      ...formData,
      name: campaignName,
      subject: campaignType === 'email' ? template.email_subject : '',
      content: campaignType === 'email' ? template.email_content : template.sms_content,
      target_audience: targetAudience
    });
  };

  const handleAudienceChange = async (key: string, value: any) => {
    let newAudience = {
      ...formData.target_audience,
      [key]: value,
    };
    
    // Clear other filter arrays when changing filter_type
    if (key === 'filter_type') {
      newAudience = {
        filter_type: value,
        estimated_count: 0,
        // Clear all filter arrays
        job_statuses: undefined,
        opportunity_stages: undefined,
        tags: undefined
      };
    }
    
    setFormData({
      ...formData,
      target_audience: newAudience,
    });
    
    // Fetch recipient estimate
    try {
      const estimate = await campaignsApi.getRecipientEstimate({
        filter_type: newAudience.filter_type,
        job_statuses: newAudience.filter_type === 'status' ? newAudience.job_statuses : undefined,
        opportunity_stages: newAudience.filter_type === 'opportunities' ? newAudience.opportunity_stages : undefined,
        tags: newAudience.tags,
      });
      setRecipientData(estimate);
      setFormData(prev => ({
        ...prev,
        target_audience: {
          ...prev.target_audience,
          estimated_count: estimate.count
        }
      }));
    } catch (error) {
      console.error('Error fetching recipient estimate:', error);
      // Set default values on error
      setRecipientData({ count: 0, recipients: [] });
      setFormData(prev => ({
        ...prev,
        target_audience: {
          ...prev.target_audience,
          estimated_count: 0
        }
      }));
    }
  };

  const calculateSMSSegments = (text: string): number => {
    const length = text.length;
    if (length === 0) return 0;
    if (length <= 160) return 1;
    return Math.ceil(length / 153);
  };

  const handleSubmit = async (isDraft: boolean) => {
    setIsLoading(true);
    try {
      // Determine if we should send now based on the switch and draft status
      const shouldSendNow = !isDraft && sendImmediately;
      await onSave(formData, shouldSendNow);
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
            {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
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
                onClick={() => !editingCampaign && handleTypeChange('email')}
                disabled={!!editingCampaign}
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  campaignType === 'email'
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                } ${editingCampaign ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Mail className={`h-8 w-8 ${campaignType === 'email' ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${campaignType === 'email' ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    Email Campaign
                  </span>
                </div>
              </button>

              <button
                onClick={() => !editingCampaign && handleTypeChange('sms')}
                disabled={!!editingCampaign}
                data-type="sms"
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  campaignType === 'sms'
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                } ${editingCampaign ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <MessageSquare className={`h-8 w-8 ${campaignType === 'sms' ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${campaignType === 'sms' ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    SMS Campaign
                  </span>
                </div>
              </button>
            </div>

            {/* Built-in Template Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Use Template (Optional)
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                onChange={(e) => {
                  const templateKey = e.target.value as keyof typeof CAMPAIGN_TEMPLATES;
                  if (templateKey) {
                    handleTemplateSelect(templateKey);
                  }
                }}
              >
                <option value="">Start from scratch</option>
                <option value="database_reactivation">Database Reactivation - Target closed lost jobs</option>
                <option value="follow_up">Follow-up Sequence - Target new jobs</option>
                <option value="proposal_followup">Proposal Follow-up - Target proposal sent jobs</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Templates automatically configure campaign type, content, and target audience
              </p>
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
                <option value="status">By Job Status</option>
                <option value="opportunities">By Opportunities Status</option>
              </select>
            </div>

            {formData.target_audience.filter_type === 'status' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Status
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'Inspection/Estimate Booked', label: 'Inspection/Estimate Booked' },
                    { value: 'Inspection/Estimate Complete', label: 'Inspection/Estimate Complete' },
                    { value: 'Proposal Drafted', label: 'Proposal Drafted' },
                    { value: 'Proposal Sent', label: 'Proposal Sent' },
                    { value: 'Proposal Accepted', label: 'Proposal Accepted' },
                    { value: 'Job Lost', label: 'Job Lost' },
                    { value: 'Job Won', label: 'Job Won' },
                    { value: 'Under Contract', label: 'Under Contract' },
                    { value: 'Invoice Sent', label: 'Invoice Sent' },
                    { value: 'Invoice Paid', label: 'Invoice Paid' },
                    { value: 'Job Scheduled', label: 'Job Scheduled' },
                    { value: 'Materials Ordered', label: 'Materials Ordered' },
                    { value: 'Job Started', label: 'Job Started' },
                    { value: 'Job Complete', label: 'Job Complete' }
                  ].map((status) => (
                    <label key={status.value} className="flex items-center">
                      <input
                        type="checkbox"
                        value={status.value}
                        checked={formData.target_audience.job_statuses?.includes(status.value) || false}
                        onChange={(e) => {
                          const currentStatuses = formData.target_audience.job_statuses || [];
                          const newStatuses = e.target.checked
                            ? [...currentStatuses, status.value]
                            : currentStatuses.filter(s => s !== status.value);
                          handleAudienceChange('job_statuses', newStatuses);
                        }}
                        className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formData.target_audience.filter_type === 'opportunities' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Opportunities Status
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'open', label: 'Open' },
                    { value: 'won', label: 'Won' },
                    { value: 'lost', label: 'Lost' },
                    { value: 'abandoned', label: 'Abandoned' }
                  ].map((stage) => (
                    <label key={stage.value} className="flex items-center">
                      <input
                        type="checkbox"
                        value={stage.value}
                        checked={formData.target_audience.opportunity_stages?.includes(stage.value) || false}
                        onChange={(e) => {
                          const currentStages = formData.target_audience.opportunity_stages || [];
                          const newStages = e.target.checked
                            ? [...currentStages, stage.value]
                            : currentStages.filter(s => s !== stage.value);
                          handleAudienceChange('opportunity_stages', newStages);
                        }}
                        className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{stage.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                {recipientData.count > 0 && (
                  <button
                    onClick={() => setShowRecipients(!showRecipients)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <Eye size={14} />
                    {showRecipients ? 'Hide' : 'View'} Recipients
                  </button>
                )}
              </div>
              
              {showRecipients && recipientData.recipients.length > 0 && (
                <div className="mt-3 max-h-40 overflow-y-auto border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="space-y-2">
                    {recipientData.recipients.slice(0, 10).map((recipient, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-900 dark:text-white">{recipient.name}</span>
                        <div className="flex gap-2 text-gray-500 dark:text-gray-400">
                          {recipient.email && <span>{recipient.email}</span>}
                          {recipient.phone && <span>{recipient.phone}</span>}
                        </div>
                      </div>
                    ))}
                    {recipientData.recipients.length > 10 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                        ... and {recipientData.recipients.length - 10} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div> */}
          </div>

          {/* Step 4: Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </h3>

            {/* Send Immediately Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Send Immediately</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Campaign will be sent right away when you click Send</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendImmediately}
                  onChange={(e) => {
                    setSendImmediately(e.target.checked);
                    if (e.target.checked) {
                      setFormData({ ...formData, scheduled_date: undefined });
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
              </label>
            </div>

            {!sendImmediately && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schedule Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_date || ''}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  required={!sendImmediately}
                />
              </div>
            )}
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
              onClick={() => handleSubmit(true)}
              disabled={!isFormValid() || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Saving...' : 'Save as Draft'}</span>
            </button>

            <button
              onClick={() => handleSubmit(false)}
              disabled={!isFormValid() || isLoading || (!sendImmediately && !formData.scheduled_date)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>{isLoading ? (sendImmediately ? 'Sending...' : 'Scheduling...') : (sendImmediately ? 'Send Now' : 'Schedule')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignModal;