import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { opportunitiesApi } from '../../services/opportunitiesApi';
import { pipelinesApi } from '../../services/pipelinesApi';
import type { OpportunityWithDetails, OpportunityFormData, PipelineWithStages, OpportunityStatus } from '../../types/opportunities';
import { OPPORTUNITY_SOURCES } from '../../types/opportunities';
import OpportunityAppointmentTab from './OpportunityAppointmentTab';
import OpportunityTasksTab from './OpportunityTasksTab';
import OpportunityNotesTab from './OpportunityNotesTab';
import OpportunityPaymentsTab from './OpportunityPaymentsTab';
import OpportunityAssociatedObjectsTab from './OpportunityAssociatedObjectsTab';

interface ViewEditOpportunityModalProps {
  isOpen: boolean;
  opportunityId: string | null;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

type SidebarSection =
  | 'opportunity-details'
  | 'book-appointment'
  | 'tasks'
  | 'notes'
  | 'payments'
  | 'associated-objects';

export default function ViewEditOpportunityModal({
  isOpen,
  opportunityId,
  onClose,
  onUpdate,
  onDelete,
}: ViewEditOpportunityModalProps) {
  const [activeSection, setActiveSection] = useState<SidebarSection>('opportunity-details');
  const [opportunity, setOpportunity] = useState<OpportunityWithDetails | null>(null);
  const [pipelines, setPipelines] = useState<PipelineWithStages[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hideEmptyFields, setHideEmptyFields] = useState(false);
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
  });
  const [originalData, setOriginalData] = useState<OpportunityFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && opportunityId) {
      loadOpportunityData();
      loadPipelines();
    }
  }, [isOpen, opportunityId]);

  const loadOpportunityData = async () => {
    if (!opportunityId) return;

    try {
      setLoading(true);
      const data = await opportunitiesApi.getOpportunityById(opportunityId);

      if (!data) {
        throw new Error('Opportunity not found');
      }

      setOpportunity(data);

      const primaryContact = data.contacts?.find(c => c.is_primary) || data.contacts?.[0];
      const formValues: OpportunityFormData = {
        opportunity_name: data.opportunity_name,
        pipeline_id: data.pipeline_id,
        stage_id: data.stage_id,
        status: data.status,
        value: data.value,
        owner_id: data.owner_id,
        business_name: data.business_name || '',
        source: data.source || '',
        tags: data.tags || [],
        appointment_time: data.appointment_time || '',
        contact_name: primaryContact?.contact_name || '',
        contact_email: primaryContact?.contact_email || '',
        contact_phone: primaryContact?.contact_phone || '',
        follower_ids: data.followers?.map(f => f.user_id) || [],
      };

      setFormData(formValues);
      setOriginalData(formValues);
    } catch (error) {
      console.error('Error loading opportunity:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to load opportunity details: ${errorMessage}`);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const loadPipelines = async () => {
    try {
      const data = await pipelinesApi.getPipelines();
      setPipelines(data);
    } catch (error) {
      console.error('Error loading pipelines:', error);
    }
  };

  const selectedPipeline = pipelines.find(p => p.id === formData.pipeline_id);
  const stages = selectedPipeline?.stages || [];

  const handlePipelineChange = (pipeline_id: string) => {
    const pipeline = pipelines.find(p => p.id === pipeline_id);
    setFormData(prev => ({
      ...prev,
      pipeline_id,
      stage_id: pipeline?.stages[0]?.id || prev.stage_id,
    }));
  };

  const hasUnsavedChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.opportunity_name.trim()) {
      newErrors.opportunity_name = 'Opportunity name is required';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm() || !opportunityId) return;

    setSaving(true);
    try {
      await opportunitiesApi.updateOpportunity(opportunityId, formData);

      if (opportunity?.contacts?.[0]) {
        const primaryContact = opportunity.contacts[0];
        if (formData.contact_name || formData.contact_email || formData.contact_phone) {
        }
      }

      onUpdate();
      alert('Opportunity updated successfully!');
      handleClose();
    } catch (error) {
      console.error('Error updating opportunity:', error);
      alert('Failed to update opportunity. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!opportunityId) return;

    try {
      await opportunitiesApi.deleteOpportunity(opportunityId);
      onDelete();
      alert('Opportunity deleted successfully');
      setShowDeleteConfirm(false);
      handleClose();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      alert('Failed to delete opportunity. Please try again.');
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return;
      }
    }

    setOpportunity(null);
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
    });
    setOriginalData(null);
    setErrors({});
    setActiveSection('opportunity-details');
    setShowDeleteConfirm(false);
    onClose();
  };

  const removeFollower = async (userId: string) => {
    if (!opportunityId) return;

    try {
      await opportunitiesApi.removeFollower(opportunityId, userId);
      setFormData(prev => ({
        ...prev,
        follower_ids: prev.follower_ids?.filter(id => id !== userId) || [],
      }));
    } catch (error) {
      console.error('Error removing follower:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Edit "{formData.opportunity_name || 'Opportunity'}"
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add and edit opportunity details, tasks, notes and appointments.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <nav className="p-4 space-y-1">
                <button
                  onClick={() => setActiveSection('opportunity-details')}
                  className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                    activeSection === 'opportunity-details'
                      ? 'bg-primary-50 dark:bg-primary-900 text-blue-700 dark:text-primary-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Opportunity Details
                </button>
                <button
                  onClick={() => setActiveSection('book-appointment')}
                  className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                    activeSection === 'book-appointment'
                      ? 'bg-primary-50 dark:bg-primary-900 text-blue-700 dark:text-primary-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Book/Update Appointment
                </button>
                <button
                  onClick={() => setActiveSection('tasks')}
                  className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                    activeSection === 'tasks'
                      ? 'bg-primary-50 dark:bg-primary-900 text-blue-700 dark:text-primary-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => setActiveSection('notes')}
                  className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                    activeSection === 'notes'
                      ? 'bg-primary-50 dark:bg-primary-900 text-blue-700 dark:text-primary-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Notes
                </button>
                <button
                  onClick={() => setActiveSection('payments')}
                  className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                    activeSection === 'payments'
                      ? 'bg-primary-50 dark:bg-primary-900 text-blue-700 dark:text-primary-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Payments
                </button>
                <button
                  onClick={() => setActiveSection('associated-objects')}
                  className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                    activeSection === 'associated-objects'
                      ? 'bg-primary-50 dark:bg-primary-900 text-blue-700 dark:text-primary-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Associated Objects
                </button>
              </nav>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-600 dark:text-gray-400">Loading opportunity...</div>
                </div>
              ) : activeSection === 'opportunity-details' ? (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact details</h3>
                      <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <input
                          type="checkbox"
                          checked={hideEmptyFields}
                          onChange={(e) => setHideEmptyFields(e.target.checked)}
                          className="mr-2"
                        />
                        Hide Empty Fields
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Primary Contact Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.contact_name}
                          onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                          placeholder="Enter contact name"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Primary Email
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={formData.contact_email}
                            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                            placeholder="Enter email"
                            className={`w-full px-3 py-2 border ${errors.contact_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                          />
                        </div>
                        {errors.contact_email && (
                          <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Primary Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.contact_phone}
                          onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                          placeholder="Enter phone"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Opportunity Details</h3>

                    <div className="space-y-4">
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

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Pipeline
                          </label>
                          <select
                            value={formData.pipeline_id}
                            onChange={(e) => handlePipelineChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            {pipelines.map((pipeline) => (
                              <option key={pipeline.id} value={pipeline.id}>
                                {pipeline.name}
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
                          >
                            {stages.map((stage) => (
                              <option key={stage.id} value={stage.id}>
                                {stage.name}
                              </option>
                            ))}
                          </select>
                        </div>
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
                          <div className="flex flex-wrap gap-2">
                            {formData.follower_ids?.map((followerId) => (
                              <span
                                key={followerId}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-blue-200"
                              >
                                Follower
                                <button
                                  onClick={() => removeFollower(followerId)}
                                  className="ml-2 hover:text-primary-600 dark:hover:text-blue-400"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
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
                            list="sources-edit"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <datalist id="sources-edit">
                            {OPPORTUNITY_SOURCES.map((source) => (
                              <option key={source} value={source} />
                            ))}
                          </datalist>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Appointment Time
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.appointment_time}
                          onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeSection === 'book-appointment' ? (
                <OpportunityAppointmentTab opportunityId={opportunityId!} />
              ) : activeSection === 'tasks' ? (
                <OpportunityTasksTab opportunityId={opportunityId!} />
              ) : activeSection === 'notes' ? (
                <OpportunityNotesTab opportunityId={opportunityId!} />
              ) : activeSection === 'payments' ? (
                <OpportunityPaymentsTab opportunityId={opportunityId!} opportunityValue={formData.value} />
              ) : activeSection === 'associated-objects' ? (
                <OpportunityAssociatedObjectsTab opportunityId={opportunityId!} />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-600 dark:text-gray-400">Section not implemented</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Created on: {opportunity?.created_at ? new Date(opportunity.created_at).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  title="Delete opportunity"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving || !hasUnsavedChanges()}
                  className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Opportunity
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this opportunity? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
