import { useState, useEffect } from 'react';
import { X, User, Building2 } from 'lucide-react';
import { embeddedPipelinesService } from '../../services/embeddedPipelinesService';
import { opportunitiesApi } from '../../services/opportunitiesApi';
import type { PipelineWithStages, OpportunityFormData, OpportunityStatus, JobType } from '../../types/opportunities';
import { OPPORTUNITY_SOURCES, JOB_TYPES } from '../../types/opportunities';
import { getEmbeddedPipelineId, EMBEDDED_PIPELINE_COLORS, EMBEDDED_PIPELINE_ICONS } from '../../constants/embeddedPipelines';
import PropertyAddressInput from './PropertyAddressInput';

interface AddOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultJobType?: JobType;
}

export default function AddOpportunityModal({ isOpen, onClose, onSuccess, defaultJobType = 'Commercial' }: AddOpportunityModalProps) {
  const [activeTab, setActiveTab] = useState<'opportunity' | 'contact'>('contact');
  const [selectedJobType, setSelectedJobType] = useState<JobType>(defaultJobType);
  const [pipeline, setPipeline] = useState<PipelineWithStages | null>(null);
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
    property_country: 'United States',
    property_latitude: undefined,
    property_longitude: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setSelectedJobType(defaultJobType);
      loadPipeline(defaultJobType);
    }
  }, [isOpen, defaultJobType]);

  useEffect(() => {
    if (isOpen && selectedJobType) {
      loadPipeline(selectedJobType);
    }
  }, [selectedJobType]);

  const loadPipeline = async (jobType: JobType) => {
    try {
      const data = await embeddedPipelinesService.getEmbeddedPipelineByJobType(jobType);
      setPipeline(data);

      if (data) {
        setFormData(prev => ({
          ...prev,
          pipeline_id: data.id,
          stage_id: data.stages[0]?.id || '',
        }));
      }
    } catch (error) {
      console.error('Error loading pipeline:', error);
    }
  };

  const stages = pipeline?.stages || [];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.opportunity_name.trim()) {
      newErrors.opportunity_name = 'Opportunity name is required';
    }

    if (!formData.pipeline_id) {
      newErrors.pipeline_id = 'Pipeline is required';
    }

    if (!formData.stage_id) {
      newErrors.stage_id = 'Stage is required';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await opportunitiesApi.createOpportunity(formData);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating opportunity:', error);
      alert('Failed to create opportunity. Please try again.');
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
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'contact'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Contact details
            </button>
            <button
              onClick={() => setActiveTab('opportunity')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'opportunity'
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
                  propertyCountry={formData.property_country || 'United States'}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Type <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-4">
                  {JOB_TYPES.map((type) => {
                    const Icon = EMBEDDED_PIPELINE_ICONS[type];
                    const color = EMBEDDED_PIPELINE_COLORS[type];
                    return (
                      <label
                        key={type}
                        className={`flex-1 flex items-center space-x-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedJobType === type
                            ? 'border-current shadow-md'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        style={
                          selectedJobType === type
                            ? {
                                borderColor: color,
                                backgroundColor: `${color}15`,
                                color: color,
                              }
                            : {}
                        }
                      >
                        <input
                          type="radio"
                          name="jobType"
                          value={type}
                          checked={selectedJobType === type}
                          onChange={(e) => setSelectedJobType(e.target.value as JobType)}
                          className="sr-only"
                        />
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stage
                </label>
                <select
                  value={formData.stage_id}
                  onChange={(e) => setFormData({ ...formData, stage_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={!formData.pipeline_id}
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
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Followers
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Add Followers</option>
                  </select>
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
    </div>
  );
}
