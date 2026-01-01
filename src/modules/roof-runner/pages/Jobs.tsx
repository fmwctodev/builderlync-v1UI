import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getJobs, createJob, updateJob, deleteJob, Job, CreateJobRequest } from '../../../shared/store/services/jobsApi';
import { getStaff, StaffMember } from '../../../shared/store/services/staffApi';
import { autoCreateTasksForStage } from '../../../shared/store/services/jobTasksApi';
import JobsHeader from '../components/JobsHeader';
import JobsTable from '../components/JobsTable';
import JobsBoardView from '../components/JobsBoardView';
import JobsSettings from '../components/JobsSettings';
import FiltersSidebar from '../components/FiltersSidebar';
import AddressModal from '../components/AddressModal';
import JobDetailsModal from '../components/JobDetailsModal';
import Toast from '../components/Toast';
import { hasPermission } from '../../../shared/utils/permissions';

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';
  const [activeView, setActiveView] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [jobAddress, setJobAddress] = useState('');
  const [jobCoordinates, setJobCoordinates] = useState<{lat: number; lng: number} | null>(null);

  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('default');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
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
    createdBy: '',
    createdByName: 'Current User',
    editedBy: '',
    editedByName: 'Current User',
    jobType: 'residential',
    contactId: null,
    contactName: null
  });

  const fetchJobs = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getJobs(page, 10);
      const fetchedJobs = response.data.data || [];
      setAllJobs(fetchedJobs);
      filterJobsByType(fetchedJobs, selectedJobType);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      const errorMessage = error.message || 'Failed to load jobs';
      if (errorMessage.includes('Supabase client not initialized')) {
        setToast({
          message: 'Database connection error. Please refresh the page or contact support.',
          type: 'error'
        });
      } else {
        setToast({ message: errorMessage, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const filterJobsByType = (jobsList: Job[], type: string) => {
    if (type === 'all') {
      setJobs(jobsList);
    } else {
      const filtered = jobsList.filter(job => job.jobType === type);
      setJobs(filtered);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await getStaff(1, 100);
      setStaff(response.data || []);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      setStaff([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.contactId || !formData.contactName) {
      setToast({ message: 'Please select a customer or lead before saving', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const previousStage = editingJob?.workflowStages;
      const newStage = formData.workflowStages;

      if (editingJob) {
        await updateJob(editingJob.id!, formData);

        if (previousStage !== newStage && editingJob.id) {
          try {
            const createdTasks = await autoCreateTasksForStage(editingJob.id, newStage);
            if (createdTasks.length > 0) {
              setToast({
                message: `Job updated! ${createdTasks.length} task(s) auto-created for ${newStage} stage`,
                type: 'success'
              });
            } else {
              setToast({ message: 'Job updated successfully!', type: 'success' });
            }
          } catch (taskError) {
            console.error('Error auto-creating tasks:', taskError);
            setToast({ message: 'Job updated, but some tasks could not be created', type: 'success' });
          }
        } else {
          setToast({ message: 'Job updated successfully!', type: 'success' });
        }
      } else {
        const response = await createJob(formData);
        const newJobId = response.data.id;

        if (newJobId) {
          try {
            const createdTasks = await autoCreateTasksForStage(newJobId, newStage);
            if (createdTasks.length > 0) {
              setToast({
                message: `Job created! ${createdTasks.length} task(s) auto-created for ${newStage} stage`,
                type: 'success'
              });
            } else {
              setToast({ message: 'Job created successfully!', type: 'success' });
            }
          } catch (taskError) {
            console.error('Error auto-creating tasks:', taskError);
            setToast({ message: 'Job created successfully!', type: 'success' });
          }
        } else {
          setToast({ message: 'Job created successfully!', type: 'success' });
        }
      }

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
    setViewingJob(job);
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
      insuranceEnabled: job.insuranceEnabled || false,
      insuranceCompany: job.insuranceCompany || '',
      policyAccountNumber: job.policyAccountNumber || '',
      claimNumber: job.claimNumber || '',
      dateOfLoss: job.dateOfLoss || '',
      typeOfDamage: job.typeOfDamage || '',
      claimAmount: job.claimAmount || 0,
      deductible: job.deductible || 0,
      claimDetails: job.claimDetails || '',
      createdBy: job.createdBy,
      createdByName: job.createdByName,
      editedBy: 1,
      editedByName: 'Current User',
      jobType: job.jobType || 'residential',
      contactId: job.contactId || null,
      contactName: job.contactName || null
    });
    setShowJobDetails(true);
  };

  const handleView = (job: Job) => {
    setViewingJob(job);
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
      insuranceEnabled: job.insuranceEnabled || false,
      insuranceCompany: job.insuranceCompany || '',
      policyAccountNumber: job.policyAccountNumber || '',
      claimNumber: job.claimNumber || '',
      dateOfLoss: job.dateOfLoss || '',
      typeOfDamage: job.typeOfDamage || '',
      claimAmount: job.claimAmount || 0,
      deductible: job.deductible || 0,
      claimDetails: job.claimDetails || '',
      createdBy: job.createdBy,
      createdByName: job.createdByName,
      editedBy: 1,
      editedByName: 'Current User',
      jobType: job.jobType || 'residential',
      contactId: job.contactId || null,
      contactName: job.contactName || null
    });
    setShowJobDetails(true);
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
      createdBy: '',
      createdByName: 'Current User',
      editedBy: '',
      editedByName: 'Current User',
      jobType: 'residential',
      contactId: null,
      contactName: null
    });
  };

  useEffect(() => {
    fetchJobs();
    fetchStaff();
  }, []);

  useEffect(() => {
    filterJobsByType(allJobs, selectedJobType);
  }, [selectedJobType]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleNewReport = () => {
    navigate(`${orgPrefix}/roof-runner/measurements`);
  };

  const handleNewCustomer = () => {
    navigate(`${orgPrefix}/roof-runner/contacts`);
  };



  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <JobsHeader
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        selectedJobType={selectedJobType}
        setSelectedJobType={setSelectedJobType}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onNewJob={() => setShowAddressModal(true)}
        onNewReport={handleNewReport}
        onNewCustomer={handleNewCustomer}
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
                    await updateJob(jobId, { ...job, workflowStages: newStage, editedBy: 1, editedByName: job.editedByName ?? 'Current User' });
                    fetchJobs();
                  }
                } catch (error) {
                  console.error('Error updating job stage:', error);
                }
              }}
              onCardClick={handleView}
            />
          )}

          {activeView === 'list' && (
            <JobsTable
              jobs={jobs}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {activeView === 'settings' && (hasPermission('jobs', 'manage') || hasPermission('projects', 'manage')) && <JobsSettings />}
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
            setFormData({
              ...formData, 
              location: jobAddress, 
              name: jobAddress,
              latitude: jobCoordinates?.lat,
              longitude: jobCoordinates?.lng
            });
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
          setViewingJob(null);
          setEditingJob(null);
          resetForm();
          setJobAddress('');
          setJobCoordinates(null);
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
          setShowJobDetails(false);
        }}
        onDelete={viewingJob ? () => handleDelete(viewingJob.id!) : undefined}
        formData={formData}
        setFormData={setFormData}
        staff={staff}
        loading={loading}
        viewingJob={viewingJob}
        editingJob={editingJob}
      />

    </div>
  );
};

export default Jobs;