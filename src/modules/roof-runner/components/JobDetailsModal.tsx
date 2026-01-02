import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { CreateJobRequest, Job } from '../../../shared/store/services/jobsApi';
import { StaffMember } from '../../../shared/store/services/staffApi';
import ContactSearchDropdown from './ContactSearchDropdown';
import QuickCreateContactModal from './QuickCreateContactModal';
import ViewContactModal from './ViewContactModal';
import EditContactModal from './EditContactModal';
import TasksTab from './TasksTab';
import CalendarTab from './CalendarTab';
import MeasurementsTab from './MeasurementsTab';
import ProposalsTab from './ProposalsTab';
import ProposalEditor from './ProposalEditor';
import MaterialOrdersTab from './MaterialOrdersTab';
import InvoicesTab from './InvoicesTab';
import JobCostingTab from './JobCostingTab';
import AttachmentsTab from './AttachmentsTab';
import InstantEstimateTab from './InstantEstimateTab';

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: () => void;
  formData: CreateJobRequest;
  setFormData: (data: CreateJobRequest) => void;
  staff: StaffMember[];
  loading: boolean;
  viewingJob?: Job | null;
  editingJob?: Job | null;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  formData,
  setFormData,
  staff,
  loading,
  viewingJob,
  editingJob
}) => {
  const [activeTab, setActiveTab] = useState('Job details');
  const [showProposalEditor, setShowProposalEditor] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [showCreateContactModal, setShowCreateContactModal] = useState(false);
  const [showViewContactModal, setShowViewContactModal] = useState(false);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [contactError, setContactError] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.contactId) {
      errors.contactId = 'Customer/Lead is required';
      setContactError(true);
    }

    if (!formData.jobType) {
      errors.jobType = 'Job Type is required';
    }

    if (!formData.workflowStages) {
      errors.workflowStages = 'Job Stage is required';
    }

    if (!formData.closeDate) {
      errors.closeDate = 'Date is required';
    }

    if (formData.insuranceEnabled) {
      if (!formData.insuranceCompany?.trim()) {
        errors.insuranceCompany = 'Insurance Company is required';
      }
      if (!formData.claimNumber?.trim()) {
        errors.claimNumber = 'Claim Number is required';
      }
      if (!formData.dateOfLoss) {
        errors.dateOfLoss = 'Date of Loss is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  if (!isOpen) return null;

  console.log('Staff data in modal:', staff);
  console.log('Staff length:', staff?.length);
  console.log('Staff sample:', staff?.[0]);

  const stages = [
    'Inspection/Estimate Booked',
    'Inspection/Estimate Complete',
    'Proposal Drafted',
    'Proposal Sent',
    'Proposal Accepted',
    'Job Lost',
    'Job Won',
    'Under Contract',
    'Invoice Sent',
    'Invoice Paid',
    'Job Scheduled',
    'Materials Ordered',
    'Job Started',
    'Job Complete'
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl mx-4 h-[95vh] shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{formData.location || 'New Job'}</h3>
                  {viewingJob && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Job #{viewingJob.id}</span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto flex-1">
              {[
                'Job details', 'Tasks', 'Calendar', 'Measurements', 'Proposals',
                'Material orders', 'Invoices', 'Job Cost',
                'Attachments', 'Instant Estimate'
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors relative ${
                    activeTab === item
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : item === 'Instant Estimate'
                      ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item}</span>
                    {item === 'Instant Estimate' && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'Job details' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {viewingJob ? `Job #${viewingJob.id}` : 'New Job'}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>0/1</span>
                        <span>No reports</span>
                        <span>No proposals</span>
                        {viewingJob && viewingJob.updatedAt && (
                          <span>Updated {new Date(viewingJob.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">Changes auto-saved</p>
                    </div>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-6 pb-20">
                {/* Job Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="jobType"
                        value="residential"
                        checked={formData.jobType === 'residential'}
                        onChange={(e) => setFormData({...formData, jobType: e.target.value as 'residential' | 'commercial' | 'insurance'})}
                        className="w-4 h-4 text-primary-600 focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Residential</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="jobType"
                        value="commercial"
                        checked={formData.jobType === 'commercial'}
                        onChange={(e) => setFormData({...formData, jobType: e.target.value as 'residential' | 'commercial' | 'insurance'})}
                        className="w-4 h-4 text-primary-600 focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Commercial</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="jobType"
                        value="insurance"
                        checked={formData.jobType === 'insurance'}
                        onChange={(e) => setFormData({...formData, jobType: e.target.value as 'residential' | 'commercial' | 'insurance'})}
                        className="w-4 h-4 text-primary-600 focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Insurance</span>
                    </label>
                  </div>
                  {validationErrors.jobType && (
                    <p className="mt-1 text-xs text-red-500">{validationErrors.jobType}</p>
                  )}
                </div>

                {/* Customer/Lead Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Customer/Lead <span className="text-red-500">*</span>
                  </label>
                  <ContactSearchDropdown
                    selectedContact={formData.contactId && formData.contactName ? {
                      id: formData.contactId.toString(),
                      name: formData.contactName
                    } : null}
                    onSelectContact={(contact) => {
                      setFormData({
                        ...formData,
                        contactId: contact ? Number(contact.id) : null,
                        contactName: contact ? contact.name : null
                      });
                      setContactError(false);
                    }}
                    required
                    hasError={contactError}
                    onCreateNew={() => setShowCreateContactModal(true)}
                    onViewProfile={(contactId) => setShowViewContactModal(true)}
                    onEditContact={(contactId) => setShowEditContactModal(true)}
                  />
                  {contactError && (
                    <p className="mt-1 text-xs text-red-500">Please select a customer or lead</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assignee(s)</label>
                    <select
                      value={formData.assignees[0] || ''}
                      onChange={(e) => setFormData({...formData, assignees: e.target.value ? [Number(e.target.value)] : []})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Unassigned</option>
                      {staff && staff.length > 0 ? staff.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.first_name} {member.last_name}
                        </option>
                      )) : (
                        <option disabled>Loading staff...</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job owner</label>
                    <select
                      value={formData.jobOwner}
                      onChange={(e) => setFormData({...formData, jobOwner: e.target.value ? Number(e.target.value) : ''})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select Job Owner</option>
                      {staff && staff.length > 0 ? staff.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.first_name} {member.last_name}
                        </option>
                      )) : (
                        <option disabled>Loading staff...</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Stage <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <select
                        value={formData.workflowStages}
                        onChange={(e) => setFormData({...formData, workflowStages: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {stages.map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                      {validationErrors.workflowStages && (
                        <p className="mt-1 text-xs text-red-500">{validationErrors.workflowStages}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.closeDate}
                      onChange={(e) => setFormData({...formData, closeDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Select"
                    />
                    {validationErrors.closeDate && (
                      <p className="mt-1 text-xs text-red-500">{validationErrors.closeDate}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job value</label>
                    <input
                      type="number"
                      value={formData.jobValue}
                      onChange={(e) => setFormData({...formData, jobValue: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source</label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Start typing to add new or select..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Details</label>
                  <textarea
                    value={formData.details}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Frequently referenced info (gate codes, material selection, parking, etc.)"
                  />
                </div>

                <div>
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={formData.insuranceEnabled}
                      onChange={(e) => setFormData({...formData, insuranceEnabled: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Insurance</span>
                  </label>

                  {formData.insuranceEnabled && (
                    <div className="space-y-4 pl-6 border-l-2 border-gray-200 dark:border-gray-600">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Insurance Company <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.insuranceCompany}
                            onChange={(e) => setFormData({...formData, insuranceCompany: e.target.value})}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                              validationErrors.insuranceCompany ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                          {validationErrors.insuranceCompany && (
                            <p className="mt-1 text-xs text-red-500">{validationErrors.insuranceCompany}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Policy Account Number</label>
                          <input
                            type="text"
                            value={formData.policyAccountNumber}
                            onChange={(e) => setFormData({...formData, policyAccountNumber: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Claim Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.claimNumber}
                            onChange={(e) => setFormData({...formData, claimNumber: e.target.value})}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                              validationErrors.claimNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                          {validationErrors.claimNumber && (
                            <p className="mt-1 text-xs text-red-500">{validationErrors.claimNumber}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date of Loss <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={formData.dateOfLoss}
                            onChange={(e) => setFormData({...formData, dateOfLoss: e.target.value})}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                              validationErrors.dateOfLoss ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                          {validationErrors.dateOfLoss && (
                            <p className="mt-1 text-xs text-red-500">{validationErrors.dateOfLoss}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type of Damage</label>
                          <input
                            type="text"
                            value={formData.typeOfDamage}
                            onChange={(e) => setFormData({...formData, typeOfDamage: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Claim Amount</label>
                          <input
                            type="number"
                            value={formData.claimAmount}
                            onChange={(e) => setFormData({...formData, claimAmount: Number(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deductible</label>
                          <input
                            type="number"
                            value={formData.deductible}
                            onChange={(e) => setFormData({...formData, deductible: Number(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Claim Details</label>
                        <textarea
                          value={formData.claimDetails}
                          onChange={(e) => setFormData({...formData, claimDetails: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Additional claim information..."
                        />
                      </div>
                    </div>
                  )}
                </div>


                  </form>
                </div>
              )}

              {activeTab === 'Tasks' && viewingJob && (
                <TasksTab
                  jobId={viewingJob.id!}
                  currentStage={formData.workflowStages}
                />
              )}

              {activeTab === 'Calendar' && (
                <CalendarTab
                  jobId={viewingJob?.id}
                  jobData={viewingJob || undefined}
                  staff={staff}
                />
              )}

              {activeTab === 'Measurements' && <MeasurementsTab />}

              {activeTab === 'Proposals' && (
                <ProposalsTab
                  jobId={viewingJob?.id}
                  onOpenProposalEditor={(templateId) => {
                    setSelectedTemplateId(templateId);
                    setShowProposalEditor(true);
                  }}
                />
              )}

              {activeTab === 'Material orders' && <MaterialOrdersTab />}

              {activeTab === 'Invoices' && <InvoicesTab />}

              {activeTab === 'Job Cost' && <JobCostingTab />}

              {activeTab === 'Attachments' && <AttachmentsTab />}

              {activeTab === 'Instant Estimate' && (
                <InstantEstimateTab
                  jobId={viewingJob?.id}
                  jobAddress={viewingJob?.location}
                />
              )}

              {activeTab !== 'Job details' && activeTab !== 'Tasks' && activeTab !== 'Calendar' && activeTab !== 'Measurements' && activeTab !== 'Proposals' && activeTab !== 'Material orders' && activeTab !== 'Invoices' && activeTab !== 'Job Cost' && activeTab !== 'Attachments' && activeTab !== 'Instant Estimate' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{activeTab}</h2>
                  <p className="text-gray-600 dark:text-gray-400">Content for {activeTab} will be implemented here.</p>
                </div>
              )}
            </div>

            {/* Fixed Footer - Only show for Job details tab */}
            {activeTab === 'Job details' && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center">
                  {viewingJob && onDelete ? (
                    <button
                      type="button"
                      onClick={onDelete}
                      className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Job</span>
                    </button>
                  ) : (
                    <div></div>
                  )}
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={handleFormSubmit}
                      disabled={loading}
                      className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                    >
                      {loading ? (viewingJob ? 'Updating...' : 'Creating...') : (viewingJob ? 'Update Job' : 'Create Job')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProposalEditor
        isOpen={showProposalEditor}
        onClose={() => {
          setShowProposalEditor(false);
          setSelectedTemplateId(undefined);
        }}
        templateId={selectedTemplateId}
      />

      <QuickCreateContactModal
        isOpen={showCreateContactModal}
        onClose={() => setShowCreateContactModal(false)}
        onContactCreated={(contact) => {
          setFormData({
            ...formData,
            contactId: Number(contact.id),
            contactName: contact.name
          });
          setContactError(false);
          setShowCreateContactModal(false);
        }}
      />

      <ViewContactModal
        isOpen={showViewContactModal}
        onClose={() => setShowViewContactModal(false)}
        contactId={formData.contactId?.toString() || null}
      />

      <EditContactModal
        isOpen={showEditContactModal}
        onClose={() => setShowEditContactModal(false)}
        contactId={formData.contactId?.toString() || null}
        onContactUpdated={(contact) => {
          setFormData({
            ...formData,
            contactId: Number(contact.id),
            contactName: contact.name
          });
          setShowEditContactModal(false);
        }}
      />
    </div>
  );
};

export default JobDetailsModal;