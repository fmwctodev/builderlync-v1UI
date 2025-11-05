import React, { useState, useEffect } from 'react';
import { getJobs, createJob, updateJob, deleteJob, Job, CreateJobRequest } from '../../../shared/store/services/jobsApi';
import { getStaff, StaffMember } from '../../../shared/store/services/staffApi';
import JobsHeader from '../components/JobsHeader';
import JobsTable from '../components/JobsTable';
import JobsBoardView from '../components/JobsBoardView';
import JobsSettings from '../components/JobsSettings';
import FiltersSidebar from '../components/FiltersSidebar';
import JobModal from '../components/JobModal';
import AddressModal from '../components/AddressModal';
import JobDetailsModal from '../components/JobDetailsModal';
import Toast from '../components/Toast';

const Jobs: React.FC = () => {
  const [activeView, setActiveView] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [jobAddress, setJobAddress] = useState('');
  const [jobCoordinates, setJobCoordinates] = useState<{lat: number; lng: number} | null>(null);

  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  const [formData, setFormData] = useState<CreateJobRequest>({
    name: '',
    location: '',
    assignees: [],
    jobOwner: '',
    workflowStages: 'New lead',
    closeDate: '',
    jobValue: 0,
    source: '',
    details: '',
    insuranceEnabled: false,
    insuranceCompany: '',
    policyAccountNumber: '',
    claimNumber: '',
    dateOfLoss: '',
    typeOfDamage: '',
    claimAmount: 0,
    deductible: 0,
    claimDetails: '',
    createdBy: 1,
    createdByName: 'Current User',
    editedBy: 1,
    editedByName: 'Current User'
  });

  const fetchJobs = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getJobs(page, 10);
      setJobs(response.data.data || []);

    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      setToast({ message: 'Failed to load jobs', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response:any = await getStaff(1, 100);
      setStaff(response.data || []);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingJob) {
        await updateJob(editingJob.id!, formData);
        setToast({ message: 'Job updated successfully!', type: 'success' });
      } else {
        await createJob(formData);
        setToast({ message: 'Job created successfully!', type: 'success' });
      }
      setShowJobModal(false);
      setShowJobDetails(false);
      setEditingJob(null);
      resetForm();
      setJobAddress('');
      fetchJobs();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save job';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await deleteJob(id);
      setToast({ message: 'Job deleted successfully!', type: 'success' });
      fetchJobs();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete job';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      name: job.name,
      location: job.location,
      assignees: job.assignees,
      jobOwner: job.jobOwner,
      workflowStages: job.workflowStages,
      closeDate: job.closeDate,
      jobValue: job.jobValue,
      source: job.source,
      details: job.details,
      insuranceEnabled: job.insuranceEnabled,
      insuranceCompany: job.insuranceCompany,
      policyAccountNumber: job.policyAccountNumber,
      claimNumber: job.claimNumber,
      dateOfLoss: job.dateOfLoss,
      typeOfDamage: job.typeOfDamage,
      claimAmount: job.claimAmount,
      deductible: job.deductible,
      claimDetails: job.claimDetails,
      createdBy: job.createdBy,
      createdByName: job.createdByName,
      editedBy: 1,
      editedByName: 'Current User'
    });
    setShowJobModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      assignees: [],
      jobOwner: '',
      workflowStages: 'New lead',
      closeDate: '',
      jobValue: 0,
      source: '',
      details: '',
      insuranceEnabled: false,
      insuranceCompany: '',
      policyAccountNumber: '',
      claimNumber: '',
      dateOfLoss: '',
      typeOfDamage: '',
      claimAmount: 0,
      deductible: 0,
      claimDetails: '',
      createdBy: 1,
      createdByName: 'Current User',
      editedBy: 1,
      editedByName: 'Current User'
    });
  };

  useEffect(() => {
    fetchJobs();
    fetchStaff();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);



  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <JobsHeader
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onNewJob={() => setShowAddressModal(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {activeView === 'board' && (
            <JobsBoardView
              jobs={jobs}
              draggedCard={draggedCard}
              setDraggedCard={setDraggedCard}
              onUpdateJobStage={async (jobId: number, newStage: string) => {
                try {
                  const job = jobs.find(j => j.id === jobId);
                  if (job) {
                    await updateJob(jobId, { ...job, workflowStages: newStage });
                    fetchJobs();
                  }
                } catch (error) {
                  console.error('Error updating job stage:', error);
                }
              }}
            />
          )}

          {activeView === 'list' && (
            <JobsTable
              jobs={jobs}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {activeView === 'settings' && <JobsSettings />}
        </div>

        <FiltersSidebar
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
        />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setJobAddress('');
          setJobCoordinates(null);
        }}
        jobAddress={jobAddress}
        setJobAddress={(address: string, lat?: number, lng?: number) => {
          setJobAddress(address);
          if (lat && lng) {
            setJobCoordinates({lat, lng});
          }
        }}
        onContinue={() => {
          if (jobAddress.trim()) {
            setFormData({...formData, location: jobAddress, name: jobAddress});
            setShowAddressModal(false);
            setShowJobDetails(true);
          }
        }}
        onCreateFromCompanyCam={() => {
          setShowAddressModal(false);
          setShowJobDetails(true);
        }}
      />

      <JobDetailsModal
        isOpen={showJobDetails}
        onClose={() => {
          setShowJobDetails(false);
          resetForm();
          setJobAddress('');
          setJobCoordinates(null);
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
          setShowJobDetails(false);
        }}
        formData={formData}
        setFormData={setFormData}
        staff={staff}
        loading={loading}
      />

      <JobModal
        isOpen={showJobModal}
        onClose={() => {
          setShowJobModal(false);
          setEditingJob(null);
          resetForm();
        }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        staff={staff}
        editingJob={editingJob}
        loading={loading}
      />


    </div>
  );
};

export default Jobs;