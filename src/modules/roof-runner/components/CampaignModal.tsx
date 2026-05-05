import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, MessageSquare, Calendar, Users, Save, Send, Eye } from 'lucide-react';
import { CampaignType, CampaignFormData, CAMPAIGN_TEMPLATES, Campaign } from '../types/campaigns';
import { campaignsApi } from '../../../shared/services/campaignsApi';
import { useGetPipelinesQuery } from '../../../shared/store/services/pipelinesApi';

interface CampaignModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: CampaignFormData, sendNow: boolean) => Promise<void>;
  initialData?: Partial<CampaignFormData>;
  editingCampaign?: Campaign | null;
}

const CampaignModal: React.FC<CampaignModalProps> = ({ show, onClose, onSave, initialData, editingCampaign }) => {
  const [isLoading, setIsLoading] = useState(false);
  const isSubmitting = useRef(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [recipientData, setRecipientData] = useState<{ count: number; recipients: Array<{ name: string; email?: string; phone?: string }> }>({ count: 0, recipients: [] });
  const [showRecipients, setShowRecipients] = useState(false);

  const [formData, setFormData] = useState<CampaignFormData & { sendImmediately: boolean }>({
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
    sendImmediately: true
  });

  const { data: pipelines, isLoading: isLoadingPipelines } = useGetPipelinesQuery();
  const selectedPipeline = pipelines?.find(p => p.id === formData.target_audience.pipeline_id) || pipelines?.find(p => p.is_default) || pipelines?.[0];
  
  // Use pipeline stages, or fallback if none available
  const dynamicStages = selectedPipeline?.stages?.map(s => ({ 
    value: formData.target_audience.filter_type === 'status' ? s.name : s.id, 
    label: s.name 
  })) || [];

  const fallbackStages = [
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
  ];

  const currentWorkflowStages = dynamicStages.length > 0 ? dynamicStages : 
    (formData.target_audience.filter_type === 'status' ? fallbackStages : []);

  useEffect(() => {
    const fetchInitialEstimate = async (audience: any) => {
      try {
        const estimate = await campaignsApi.getRecipientEstimate({
          filter_type: audience.filter_type,
          job_statuses: audience.filter_type === 'status' ? audience.job_statuses : undefined,
          opportunity_stages: audience.filter_type === 'opportunities' ? audience.opportunity_stages : undefined,
          pipeline_id: audience.pipeline_id,
          job_type: audience.job_type,
          search: audience.search,
          tags: audience.tags,
        });
        setRecipientData(estimate);
      } catch (error) {
        console.error('Error fetching initial recipient estimate:', error);
      }
    };

    if (show) {
      // Reset UI states immediately on show
      setIsLoading(false);
      isSubmitting.current = false;
      setCurrentStep(1);
      setShowRecipients(false);

      if (editingCampaign) {
        // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
        let formattedDate = '';
        if (editingCampaign.scheduled_date) {
          const date = new Date(editingCampaign.scheduled_date);
          formattedDate = date.toISOString().slice(0, 16);
        }

        // Handle stringified JSON from database
        let targetAudience = editingCampaign.target_audience;
        if (typeof targetAudience === 'string') {
          try {
            targetAudience = JSON.parse(targetAudience);
          } catch (e) {
            targetAudience = { filter_type: 'all', estimated_count: 0 };
          }
        }

        let tags = editingCampaign.tags;
        if (typeof tags === 'string') {
          try {
            tags = JSON.parse(tags);
          } catch (e) {
            tags = [];
          }
        }

        const isScheduled = !!editingCampaign.scheduled_date;

        setFormData({
          name: editingCampaign.name,
          type: editingCampaign.type,
          subject: editingCampaign.subject || '',
          from_name: editingCampaign.from_name || '',
          from_email: editingCampaign.from_email || '',
          content: editingCampaign.content,
          target_audience: targetAudience || {
            filter_type: 'all',
            estimated_count: 0,
          },
          tags: Array.isArray(tags) ? tags : [],
          scheduled_date: formattedDate,
          sendImmediately: !isScheduled
        });
        
        // Use existing estimated_count if available to avoid redundant calls
        if (targetAudience && typeof targetAudience === 'object' && 'estimated_count' in targetAudience) {
          setRecipientData({ 
            count: (targetAudience as any).estimated_count || 0, 
            recipients: [] 
          });
        }
      } else {
        // Reset to initial state for new campaign
        setFormData({
          name: '',
          type: 'email',
          subject: '',
          from_name: '',
          from_email: '',
          content: '',
          target_audience: (initialData?.target_audience as any) || {
            filter_type: 'all',
            estimated_count: 0,
          },
          tags: initialData?.tags || [],
          scheduled_date: initialData?.scheduled_date || '',
          sendImmediately: true,
          ...initialData
        });
        setRecipientData({ count: 0, recipients: [] });
      }
    }
  }, [show, editingCampaign, initialData]);

  if (!show) return null;

  const handleTypeChange = (type: CampaignType) => {
    setFormData(prev => ({ ...prev, type }));
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
          estimated_count: 0
        };
        break;
      case 'follow_up':
        targetAudience = {
          filter_type: 'opportunities', 
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
    
    setFormData(prev => ({
      ...prev,
      name: campaignName,
      subject: prev.type === 'email' ? template.email_subject : '',
      content: prev.type === 'email' ? template.email_content : template.sms_content,
      target_audience: targetAudience
    }));
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
        job_statuses: undefined,
        opportunity_stages: undefined,
        pipeline_id: undefined,
        job_type: undefined,
        search: undefined,
        tags: undefined
      };
    }

    // Reset stages when pipeline changes
    if (key === 'pipeline_id') {
      newAudience.job_statuses = [];
      newAudience.opportunity_stages = [];
    }
    
    setFormData(prev => ({
      ...prev,
      target_audience: newAudience,
    }));
    
    // Fetch recipient estimate
    try {
      const estimate = await campaignsApi.getRecipientEstimate({
        filter_type: newAudience.filter_type,
        pipeline_id: newAudience.pipeline_id,
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
    if (isSubmitting.current) return;
    
    isSubmitting.current = true;
    setIsLoading(true);
    try {
      // Determine if we should send now based on the switch and draft status
      const shouldSendNow = !isDraft && formData.sendImmediately;
      
      // Clean target audience data - ensure it's a plain object
      const payload = {
        ...formData,
        target_audience: { ...formData.target_audience }
      };
      // Remove local UI state before sending to API
      delete (payload as any).sendImmediately;

      await onSave(payload as any, shouldSendNow);
      onClose();
    } catch (error) {
      console.error('Error saving campaign:', error);
      isSubmitting.current = false;
      setIsLoading(false);
    } finally {
      // Small delay just to prevent flicker, though unmounting handles it
      setTimeout(() => {
        isSubmitting.current = false;
        setIsLoading(false);
      }, 100);
    }
  };

  const isFormValid = () => {
    if (!formData.name || !formData.content) return false;
    if (formData.type === 'email' && !formData.subject) return false;
    return true;
  };

  const smsSegments = formData.type === 'sms' ? calculateSMSSegments(formData.content) : 0;

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
                  formData.type === 'email'
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                } ${editingCampaign ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Mail className={`h-8 w-8 ${formData.type === 'email' ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${formData.type === 'email' ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    Email Campaign
                  </span>
                </div>
              </button>

              <button
                onClick={() => !editingCampaign && handleTypeChange('sms')}
                disabled={!!editingCampaign}
                data-type="sms"
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  formData.type === 'sms'
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                } ${editingCampaign ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <MessageSquare className={`h-8 w-8 ${formData.type === 'sms' ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${formData.type === 'sms' ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
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
            {formData.type === 'email' && (
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
                {formData.type === 'email' ? 'Email Content' : 'SMS Message'}
              </h3>
              {formData.type === 'sms' && (
                <span className={`text-sm font-medium ${formData.content.length > 160 ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400'}`}>
                  {formData.content.length} characters • {smsSegments} segment{smsSegments !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={formData.type === 'email' ? 12 : 6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                placeholder={formData.type === 'email' ? 'Enter your email content...' : 'Enter your SMS message...'}
              />
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Available Merge Fields</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'first_name', 'full_name', 'email', 'phone', 
                    'property_address', 'job_type', 
                    'inspection_score', 'inspection_grade',
                    'rep_name', 'rep_phone', 'rep_email',
                    'company_name'
                  ].map(field => (
                    <span key={field} className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded text-[10px] font-mono text-gray-600 dark:text-gray-300 shadow-sm whitespace-nowrap">
                      {"{{"}{field}{"}}"}
                    </span>
                  ))}
                </div>
              </div>
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

            {/* Pipeline Selection */}
            {(formData.target_audience.filter_type === 'status' || formData.target_audience.filter_type === 'opportunities') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Workflow / Pipeline
                </label>
                <select
                  value={formData.target_audience.pipeline_id || ''}
                  onChange={(e) => handleAudienceChange('pipeline_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{formData.target_audience.filter_type === 'status' ? 'Default Pipeline' : 'Select Pipeline'}</option>
                  {pipelines?.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.target_audience.filter_type === 'status' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Status {isLoadingPipelines && <span className="text-xs text-gray-400 animate-pulse">(Loading stages...)</span>}
                </label>
                <div className="space-y-2 grid grid-cols-2 gap-x-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {currentWorkflowStages.map((status) => (
                    <label key={status.value} className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
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
                  Opportunity Stages {isLoadingPipelines && <span className="text-xs text-gray-400 animate-pulse">(Loading stages...)</span>}
                </label>
                <div className="space-y-2 grid grid-cols-2 gap-x-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {currentWorkflowStages.map((stage) => (
                    <label key={stage.value} className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
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
                  checked={formData.sendImmediately}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData(prev => ({
                      ...prev,
                      sendImmediately: checked,
                      scheduled_date: checked ? undefined : prev.scheduled_date
                    }));
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
              </label>
            </div>

            {!formData.sendImmediately && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schedule Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  required={!formData.sendImmediately}
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
              disabled={!isFormValid() || isLoading || (!formData.sendImmediately && !formData.scheduled_date)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>{isLoading ? (formData.sendImmediately ? 'Sending...' : 'Scheduling...') : (formData.sendImmediately ? 'Send Now' : 'Schedule')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignModal;