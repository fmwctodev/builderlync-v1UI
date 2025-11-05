import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CreateJobRequest } from '../../../shared/store/services/jobsApi';
import { StaffMember } from '../../../shared/store/services/staffApi';
import TasksTab from './TasksTab';
import CalendarTab from './CalendarTab';
import MeasurementsTab from './MeasurementsTab';
import PDFSignerTab from './PDFSignerTab';
import MaterialOrdersTab from './MaterialOrdersTab';
import WorkOrdersTab from './WorkOrdersTab';
import InvoicesTab from './InvoicesTab';
import JobCostingTab from './JobCostingTab';
import AttachmentsTab from './AttachmentsTab';
import InstantEstimateTab from './InstantEstimateTab';
import IntegrationsTab from './IntegrationsTab';

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: CreateJobRequest;
  setFormData: (data: CreateJobRequest) => void;
  staff: StaffMember[];
  loading: boolean;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  staff,
  loading
}) => {
  const [activeTab, setActiveTab] = useState('Job details');

  if (!isOpen) return null;

  console.log('Staff data in modal:', staff);

  const stages = [
    'Default','New lead', 'Appointment scheduled', 'Appointment run', 'Adjuster Meeting Scheduled',
    'Adjuster Meeting Complete', 'Under Service Agreement/Contin', 'Estimate Received',
    'Proposal sent/presented', 'Proposal follow-up', 'Reinspection', 'Public Adjuster',
    'Proposal signed/Pre-Production', 'Supplementing', 'Pre-production', 'Materials Ordered',
    'Production', 'Post-production', 'Payments/Invoicing', 'Post-job completion follow-up',
    'Job completed', 'Lost', 'Unqualified'
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl mx-4 h-[95vh] shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{formData.location || 'New Job'}</h3>
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
                'Job details', 'Tasks', 'Calendar', 'Measurements', 'Proposals', 'PDF Signer',
                'Material orders', 'Work orders', 'Invoices', 'Job costing',
                'Attachments', 'Instant Estimate', 'Integration'
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === item
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item}
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
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">New</h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>0/1</span>
                        <span>No reports</span>
                        <span>No proposals</span>
                        <span>Updated a minute ago</span>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">Changes auto-saved</p>
                    </div>
                  </div>

                  <form onSubmit={onSubmit} className="space-y-6 pb-20">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assignee(s)</label>
                    <select
                      value={formData.assignees[0] || ''}
                      onChange={(e) => setFormData({...formData, assignees: e.target.value ? [e.target.value] : []})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Unassigned</option>
                      {staff && staff.length > 0 ? staff.map(member => (
                        <option key={member.id} value={`${member.first_name} ${member.last_name}`}>
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
                      onChange={(e) => setFormData({...formData, jobOwner: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select Job Owner</option>
                      {staff && staff.length > 0 ? staff.map(member => (
                        <option key={member.id} value={`${member.first_name} ${member.last_name}`}>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Workflow & stages</label>
                    <div className="space-y-2">
                      <select
                        value={formData.workflowStages}
                        onChange={(e) => setFormData({...formData, workflowStages: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="New lead">New lead</option>
                        {stages.map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Close date</label>
                    <input
                      type="date"
                      value={formData.closeDate}
                      onChange={(e) => setFormData({...formData, closeDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Select"
                    />
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
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Insurance Company</label>
                          <input
                            type="text"
                            value={formData.insuranceCompany}
                            onChange={(e) => setFormData({...formData, insuranceCompany: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
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
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Claim Number</label>
                          <input
                            type="text"
                            value={formData.claimNumber}
                            onChange={(e) => setFormData({...formData, claimNumber: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Loss</label>
                          <input
                            type="date"
                            value={formData.dateOfLoss}
                            onChange={(e) => setFormData({...formData, dateOfLoss: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
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

              {activeTab === 'Tasks' && <TasksTab />}

              {activeTab === 'Calendar' && <CalendarTab />}

              {activeTab === 'Measurements' && <MeasurementsTab />}

              {activeTab === 'PDF Signer' && <PDFSignerTab />}

              {activeTab === 'Material orders' && <MaterialOrdersTab />}

              {activeTab === 'Work orders' && <WorkOrdersTab />}

              {activeTab === 'Invoices' && <InvoicesTab />}

              {activeTab === 'Job costing' && <JobCostingTab />}

              {activeTab === 'Attachments' && <AttachmentsTab />}

              {activeTab === 'Instant Estimate' && <InstantEstimateTab />}

              {activeTab === 'Integration' && <IntegrationsTab />}

              {activeTab !== 'Job details' && activeTab !== 'Tasks' && activeTab !== 'Calendar' && activeTab !== 'Measurements' && activeTab !== 'PDF Signer' && activeTab !== 'Material orders' && activeTab !== 'Work orders' && activeTab !== 'Invoices' && activeTab !== 'Job costing' && activeTab !== 'Attachments' && activeTab !== 'Instant Estimate' && activeTab !== 'Integration' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{activeTab}</h2>
                  <p className="text-gray-600 dark:text-gray-400">Content for {activeTab} will be implemented here.</p>
                </div>
              )}
            </div>

            {/* Fixed Footer - Only show for Job details tab */}
            {activeTab === 'Job details' && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={onSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Job'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;