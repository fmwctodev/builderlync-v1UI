import { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { opportunitiesApi } from '../../services/opportunitiesApi';
import type { PipelineWithStages, OpportunityFormData, OpportunityStatus, JobType } from '../../types/opportunities';
import { OPPORTUNITY_SOURCES, JOB_TYPES } from '../../types/opportunities';
import PropertyAddressInput from './PropertyAddressInput';
import Toast from '../../../../shared/components/Toast';
import { getErrorMessage } from '../../../../shared/utils/errorHandler';

import { getAllActiveStaff, StaffMember } from '../../../../shared/store/services/staffApi';
import { getJobs, Job } from '../../../../shared/store/services/jobsApi';

interface AddOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultJobType?: JobType;
  selectedPipelineId?: string | null;
  linkedJobData?: any | null;
}

export default function AddOpportunityModal({ isOpen, onClose, onSuccess, defaultJobType = 'Commercial', selectedPipelineId, linkedJobData }: AddOpportunityModalProps) {
  const [activeTab, setActiveTab] = useState<'opportunity' | 'contact'>(linkedJobData ? 'opportunity' : 'contact');
  const [selectedJobType, setSelectedJobType] = useState<JobType>(defaultJobType);
  const [pipeline, setPipeline] = useState<PipelineWithStages | null>(null);
  const [users, setUsers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OpportunityFormData>({
    opportunity_name: '',
    pipeline_id: '',
    stage_id: '',
    status: 'open',
    value: 0,
    owner_id: undefined,
    business_name: '',
    source: '',
    tags: [],
    appointment_time: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    follower_ids: [],
    property_address: '',
    property_city: '',
    property_state: '',
    property_zip: '',
    property_country: '',
    property_latitude: undefined,
    property_longitude: undefined,
    job_id: null
  });

  useEffect(() => {
    if (isOpen && linkedJobData) {
      setFormData(prev => ({
        ...prev,
        opportunity_name: linkedJobData.name || linkedJobData.location || '',
        contact_name: linkedJobData.customer?.full_name || linkedJobData.contactName || '',
        contact_email: linkedJobData.customer?.email || '',
        contact_phone: linkedJobData.customer?.phone || '',
        property_address: linkedJobData.location || '',
        job_id: linkedJobData.id,
        value: typeof linkedJobData.jobValue === 'number' ? linkedJobData.jobValue : parseFloat(linkedJobData.jobValue) || 0,
        source: linkedJobData.source || '',
      }));
      if (linkedJobData.jobType) {
        const type = linkedJobData.jobType.charAt(0).toUpperCase() + linkedJobData.jobType.slice(1);
        if (JOB_TYPES.includes(type as JobType)) {
          setSelectedJobType(type as JobType);
        }
      }
      setJobSearch(linkedJobData.name || linkedJobData.location || '');
    }
  }, [isOpen, linkedJobData]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [jobSearch, setJobSearch] = useState('');
  const [matchingJobs, setMatchingJobs] = useState<Job[]>([]);
  const [showJobList, setShowJobList] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (jobSearch.length > 2) {
        try {
          const response = await getJobs(1, 10, { search: jobSearch });
          setMatchingJobs(response.data.data || []);
          setShowJobList(true);
        } catch (error) {
          console.error('Error searching jobs:', error);
        }
      } else {
        setMatchingJobs([]);
        setShowJobList(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [jobSearch]);

  const handleSelectJob = (job: Job) => {
    setFormData(prev => ({
      ...prev,
      opportunity_name: job.name || job.location || '',
      contact_name: job.customer?.full_name || job.contactName || '',
      contact_email: job.customer?.email || '',
      contact_phone: job.customer?.phone || '',
      property_address: job.location || '',
      job_id: job.id,
      value: typeof job.jobValue === 'number' ? job.jobValue : parseFloat(job.jobValue) || 0,
      source: job.source || '',
    }));
    if (job.jobType) {
      const type = job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1);
      if (JOB_TYPES.includes(type as JobType)) {
        setSelectedJobType(type as JobType);
      }
    }
    setJobSearch(job.name || job.location || '');
    setShowJobList(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadPipelineFromSelection();
      loadUsers();
    }
  }, [isOpen, selectedPipelineId]);

  const loadUsers = async () => {
    try {
      const staffList = await getAllActiveStaff();
      setUsers(staffList);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const loadPipelineFromSelection = async () => {
    try {
      if (selectedPipelineId && selectedPipelineId !== 'default') {
        // Load the selected pipeline
        const pipelinesApi = (await import('../../services/pipelinesApi')).pipelinesApi;
        const pipelineData = await pipelinesApi.getPipelineById(selectedPipelineId);

        if (pipelineData) {
          setPipeline(pipelineData);
          setFormData(prev => ({
            ...prev,
            pipeline_id: pipelineData.id,
            stage_id: pipelineData.stages?.[0]?.id || '', // Set to first stage
          }));
        }
      } else {
        // Default selected - fetch actual default pipeline from API
        const pipelinesApi = (await import('../../services/pipelinesApi')).pipelinesApi;
        try {
          const defaultPipeline = await pipelinesApi.getOrCreateDefaultPipeline();
          if (defaultPipeline) {
            setPipeline(defaultPipeline);
            setFormData(prev => ({
              ...prev,
              pipeline_id: defaultPipeline.id,
              stage_id: defaultPipeline.stages?.[0]?.id || '', // First stage
            }));
          } else {
            throw new Error("No default pipeline returned");
          }
        } catch (err) {
          console.error("Failed to fetch default pipeline, falling back to local default", err);
          // Fallback (only if API fails completely)
          const defaultStages = [
            { id: 'default-1', name: 'New Lead', order_position: 0, color: '#dc2626' },
            { id: 'default-2', name: 'Follow-Up 1', order_position: 1, color: '#2563eb' },
            { id: 'default-3', name: 'Follow-Up 2', order_position: 2, color: '#eab308' },
            { id: 'default-4', name: 'Follow-Up 3', order_position: 3, color: '#16a34a' },
            { id: 'default-5', name: 'Long Term Follow Up', order_position: 4, color: '#9333ea' },
            { id: 'default-6', name: 'In Convo', order_position: 5, color: '#10b981' },
          ];
          setPipeline({ id: 'default', name: 'Default', stages: defaultStages } as any);
          setFormData(prev => ({
            ...prev,
            pipeline_id: '', // Still no ID if API fails, but better than crashing
            stage_id: 'default-1',
          }));
        }
      }
    } catch (error) {
      console.error('Error loading pipeline:', error);
      setPipeline(null);
      setFormData(prev => ({
        ...prev,
        pipeline_id: '',
        stage_id: '',
      }));
    }
  };

  const stages = pipeline?.stages || [];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.opportunity_name.trim()) {
      newErrors.opportunity_name = 'Opportunity name is required';
    }

    if (!formData.stage_id) {
      newErrors.stage_id = 'Stage is required';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // If there are errors in opportunity specific fields, tell the user
      if (newErrors.opportunity_name || newErrors.stage_id) {
        setToast({ message: 'Please complete the Opportunity Details section.', type: 'error' });
        // Optionally switch to the opportunity tab to show the errors
        setActiveTab('opportunity');
      } else if (newErrors.contact_email) {
        setToast({ message: 'Please fix the errors in Contact details.', type: 'error' });
        setActiveTab('contact');
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await opportunitiesApi.createOpportunity(formData);
      setToast({ message: 'Opportunity created successfully!', type: 'success' });

      // Delay closing to show toast
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error creating opportunity:', error);
      setToast({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      opportunity_name: '',
      pipeline_id: '',
      stage_id: '',
      status: 'open',
      value: 0,
      owner_id: undefined,
      business_name: '',
      source: '',
      tags: [],
      appointment_time: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      follower_ids: [],
      property_address: '',
      property_city: '',
      property_state: '',
      property_zip: '',
      property_country: 'United States',
      property_latitude: undefined,
      property_longitude: undefined,
    });
    setErrors({});
    setActiveTab('contact');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Add new opportunity</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create new opportunity by filling in details and selecting a contact
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'contact'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              Contact details
            </button>
            <button
              onClick={() => setActiveTab('opportunity')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'opportunity'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              Opportunity Details
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'contact' ? (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contact details</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Primary Contact Name
                </label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="Enter Contact name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Primary Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="Enter Email"
                  className={`w-full px-3 py-2 border ${errors.contact_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
                {errors.contact_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Primary Phone
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="Enter Phone"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <PropertyAddressInput
                  propertyAddress={formData.property_address || ''}
                  propertyCity={formData.property_city || ''}
                  propertyState={formData.property_state || ''}
                  propertyZip={formData.property_zip || ''}
                  propertyCountry={formData.property_country || ''}
                  onAddressChange={(field, value) => {
                    setFormData({ ...formData, [field]: value });
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link to Job (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    placeholder="Search jobs by address or name..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {showJobList && matchingJobs.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {matchingJobs.map(job => (
                        <button
                          key={job.id}
                          onClick={() => handleSelectJob(job)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col border-b border-gray-50 dark:border-gray-700 last:border-0"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">{job.location}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {job.customer?.full_name || job.contactName || 'No customer'} • ${job.jobValue}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Opportunity Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.opportunity_name}
                  onChange={(e) => setFormData({ ...formData, opportunity_name: e.target.value })}
                  placeholder="Enter opportunity name"
                  className={`w-full px-3 py-2 border ${errors.opportunity_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
                {errors.opportunity_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.opportunity_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Type <span className="text-red-600">*</span>
                </label>
                <select
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value as JobType)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose job type</option>
                  {JOB_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stage
                </label>
                <select
                  value={formData.stage_id}
                  onChange={(e) => setFormData({ ...formData, stage_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={!pipeline || stages.length === 0} // Enable if pipeline is loaded and has stages
                >
                  <option value="">Choose stage</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as OpportunityStatus })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="open">Open</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                    <option value="abandoned">Abandoned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Opportunity Value
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Owner
                  </label>
                  <select
                    value={formData.owner_id || ''}
                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Unassigned</option>
                    {users.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.first_name} {member.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Followers
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      onChange={(e) => {
                        const userId = e.target.value;
                        if (userId && !formData.follower_ids?.includes(userId)) {
                          setFormData(prev => ({
                            ...prev,
                            follower_ids: [...(prev.follower_ids || []), userId]
                          }));
                        }
                        e.target.value = ''; // Reset select after selection
                      }}
                    >
                      <option value="">Add Follower</option>
                      {users.map((member) => (
                        <option
                          key={member.id}
                          value={member.id}
                          disabled={formData.follower_ids?.includes(String(member.id))}
                        >
                          {member.first_name} {member.last_name}
                        </option>
                      ))}
                    </select>

                    {/* Display selected followers as tags */}
                    {formData.follower_ids && formData.follower_ids.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.follower_ids.map(id => {
                          const user = users.find(u => String(u.id) === String(id));
                          return user ? (
                            <span key={id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {user.first_name} {user.last_name}
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  follower_ids: prev.follower_ids?.filter(fid => fid !== id)
                                }))}
                                className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                              >
                                &times;
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="Enter Business Name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Opportunity Source
                  </label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="Enter Source"
                    list="sources"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <datalist id="sources">
                    {OPPORTUNITY_SOURCES.map((source) => (
                      <option key={source} value={source} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="Add tags"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-blue-400 transition-colors"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
