import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getJobs, createJob, updateJob, deleteJob, Job, CreateJobRequest } from '../../../shared/store/services/jobsApi';
import { getStaff, StaffMember } from '../../../shared/store/services/staffApi';
import { autoCreateTasksForStage } from '../../../shared/store/services/jobTasksApi';
import JobsHeader from '../components/JobsHeader';
import JobsTable from '../components/JobsTable';
import JobsBoardView from '../components/JobsBoardView';
import JobsSettings from '../components/JobsSettings';
import FiltersSidebar, { AdvancedFilters } from '../components/FiltersSidebar';
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
  const [jobCoordinates, setJobCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    sortBy: 'Last updated (newest)',
    assignees: [],
    stages: [],
    updatedDate: [],
    closeDate: []
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modalMessage, setModalMessage] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<CreateJobRequest>({
    name: '',
    location: '',
    customerId: null,
    assignees: [],
    jobOwner: null,
    workflowStages: 'New lead',
    closeDate: '',
    jobValue: '',
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
    createdBy: null,
    editedBy: null,
    jobType: 'residential',
    contactId: null,
    contactName: null
  });

  const resolveContactId = (job: Job): number | null => {
    const id =
      job.contact_id ??
      job.contactId ??
      job.customer?.id ??
      job.customer_id ??
      job.customerId ??
      null;
    return id ? Number(id) : null;
  };

  const resolveContactName = (job: Job): string | null => {
    return (
      job.contactName ||
      job.customer?.full_name ||
      job.customer?.fullName ||
      job.customer?.name ||
      job.customer?.company ||
      job.customer?.email ||
      job.customer?.phone ||
      null
    );
  };

  const fetchJobs = async (page: number = 1) => {
    try {
      setLoading(true);

      const filters = {
        jobType: selectedJobType !== 'all' ? selectedJobType : undefined,
        search: searchQuery || undefined,
        sortBy: advancedFilters.sortBy,
        assignees: advancedFilters.assignees.length > 0 ? advancedFilters.assignees : undefined,
        stages: advancedFilters.stages.length > 0 ? advancedFilters.stages : undefined,
        updatedDate: advancedFilters.updatedDate.length > 0 ? advancedFilters.updatedDate : undefined,
        closeDate: advancedFilters.closeDate.length > 0 ? advancedFilters.closeDate : undefined
      };

      const response = await getJobs(page, 100, filters);
      const fetchedJobs = response.data.data || [];
      setAllJobs(fetchedJobs);
      setJobs(fetchedJobs);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      setToast({ message: 'Failed to load jobs', type: 'error' });
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

    if (!formData.contactId) {
      setToast({ message: 'Please select a customer or lead before saving', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const previousStage = editingJob?.workflowStages;
      const newStage = formData.workflowStages;

      // Set customerId from contactId
      const jobData = {
        ...formData,
        customerId: formData.contactId || null,
        customer_id: formData.contactId || null,
        // Ensure numeric fields are properly handled
        jobValue: formData.jobValue || NaN,
        claimAmount: Number(formData.claimAmount) || 0,
        deductible: Number(formData.deductible) || 0,
        // Ensure assignees is an array of numbers
        assignees: formData.assignees.filter(id => id && !isNaN(Number(id))).map(id => Number(id)),
        // Ensure editedBy is a number
        editedBy: Number(formData.editedBy) || undefined
      };

      if (editingJob) {
        await updateJob(editingJob.id!, jobData);

        if (previousStage !== newStage && editingJob.id) {
          try {
            const createdTasks = await autoCreateTasksForStage(editingJob.id, newStage);
            if (createdTasks.length > 0) {
              setModalMessage({
                message: `Job updated! ${createdTasks.length} task(s) auto-created for ${newStage} stage`,
                type: 'success'
              });
            } else {
              setModalMessage({ message: 'Job updated successfully!', type: 'success' });
            }
          } catch (taskError) {
            console.error('Error auto-creating tasks:', taskError);
            setModalMessage({ message: 'Job updated, but some tasks could not be created', type: 'success' });
          }
        } else {
          setModalMessage({ message: 'Job updated successfully!', type: 'success' });
        }

        // Refresh the viewing job data
        const updatedJobsResponse = await getJobs(1, 100);
        const updatedJob = updatedJobsResponse.data.data.find(j => j.id === editingJob.id);
        if (updatedJob) {
          setViewingJob(updatedJob);
          setEditingJob(updatedJob);
        }
      } else {
        const response = await createJob(jobData);
        const newJob = response.data;
        const newJobId = newJob.id;

        if (newJobId) {
          try {
            const createdTasks = await autoCreateTasksForStage(newJobId, newStage);
            if (createdTasks.length > 0) {
              setModalMessage({
                message: `Job created! ${createdTasks.length} task(s) auto-created for ${newStage} stage`,
                type: 'success'
              });
            } else {
              setModalMessage({ message: 'Job created successfully!', type: 'success' });
            }
          } catch (taskError) {
            console.error('Error auto-creating tasks:', taskError);
            setModalMessage({ message: 'Job created successfully!', type: 'success' });
          }

          // Set the newly created job as viewingJob so tabs can access it
          setViewingJob(newJob);
          setEditingJob(newJob);
        } else {
          setModalMessage({ message: 'Job created successfully!', type: 'success' });
        }
      }

      // Refresh jobs list
      fetchJobs();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save job';
      setModalMessage({ message: errorMessage, type: 'error' });
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
    const contactId = resolveContactId(job);
    const contactName = resolveContactName(job);
    setViewingJob(job);
    setEditingJob(job);
    setFormData({
      name: job.name,
      location: job.location,
      customerId: job.customer_id || job.customerId || null,
      assignees: job.assignees,
      jobOwner: job.job_owner || job.jobOwner || null,
      workflowStages: job.workflow_stages || job.workflowStages,
      closeDate: job.close_date || job.closeDate,
      jobValue: String(job.job_value || job.jobValue || ''),
      source: job.source,
      details: job.details,
      insuranceEnabled: job.insurance_enabled || job.insuranceEnabled || false,
      insuranceCompany: job.insurance_company || job.insuranceCompany || '',
      policyAccountNumber: job.policy_account_number || job.policyAccountNumber || '',
      claimNumber: job.claim_number || job.claimNumber || '',
      dateOfLoss: job.date_of_loss || job.dateOfLoss || '',
      typeOfDamage: job.type_of_damage || job.typeOfDamage || '',
      claimAmount: Number(job.claim_amount || job.claimAmount || 0),
      deductible: job.deductible || 0,
      claimDetails: job.claim_details || job.claimDetails || '',
      createdBy: job.created_by || job.createdBy || null,
      editedBy: job.edited_by || job.editedBy || null,
      jobType: job.jobType || 'residential',
      contactId,
      contactName
    });
    setShowJobDetails(true);
  };

  const handleView = (job: Job) => {
    const contactId = resolveContactId(job);
    const contactName = resolveContactName(job);
    setViewingJob(job);
    setEditingJob(job);
    setFormData({
      name: job.name,
      location: job.location,
      customerId: job.customer_id || job.customerId || null,
      assignees: job.assignees,
      jobOwner: job.job_owner || job.jobOwner || null,
      workflowStages: job.workflow_stages || job.workflowStages,
      closeDate: job.close_date || job.closeDate,
      jobValue: String(job.job_value || job.jobValue || ''),
      source: job.source,
      details: job.details,
      insuranceEnabled: job.insurance_enabled || job.insuranceEnabled || false,
      insuranceCompany: job.insurance_company || job.insuranceCompany || '',
      policyAccountNumber: job.policy_account_number || job.policyAccountNumber || '',
      claimNumber: job.claim_number || job.claimNumber || '',
      dateOfLoss: job.date_of_loss || job.dateOfLoss || '',
      typeOfDamage: job.type_of_damage || job.typeOfDamage || '',
      claimAmount: Number(job.claim_amount || job.claimAmount || 0),
      deductible: job.deductible || 0,
      claimDetails: job.claim_details || job.claimDetails || '',
      createdBy: job.created_by || job.createdBy || null,
      editedBy: job.edited_by || job.editedBy || null,
      jobType: job.jobType || 'residential',
      contactId,
      contactName
    });
    setShowJobDetails(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      customerId: null,
      assignees: [],
      jobOwner: null,
      workflowStages: 'New lead',
      closeDate: '',
      jobValue: '',
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
      createdBy: null,
      editedBy: null,
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
    fetchJobs();
  }, [selectedJobType, selectedFilter, searchQuery, advancedFilters]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleNewReport = () => {
    navigate(`${orgPrefix}/measurements`);
  };

  const handleNewCustomer = () => {
    navigate(`${orgPrefix}/contacts`);
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
        jobs={jobs}
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
                    const { id, ...jobUpdateData } = job;
                    await updateJob(jobId, {
                      ...jobUpdateData,
                      workflowStages: newStage,
                      editedBy: 1,
                      // Ensure jobValue is a string to match CreateJobRequest type
                      jobValue: String(job.jobValue || job.job_value || '')
                    } as CreateJobRequest);
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

          {activeView === 'settings' && hasPermission('jobs', 'manage') && <JobsSettings />}
        </div>

        <FiltersSidebar
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onFiltersChange={setAdvancedFilters}
          currentFilters={advancedFilters}
        />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
            setJobCoordinates({ lat, lng });
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
          setModalMessage(null);
        }}
        onSubmit={handleSubmit}
        onDelete={viewingJob ? () => handleDelete(viewingJob.id!) : undefined}
        formData={formData}
        setFormData={setFormData}
        staff={staff}
        loading={loading}
        viewingJob={viewingJob}
        editingJob={editingJob}
        modalMessage={modalMessage}
        setModalMessage={setModalMessage}
      />

    </div>
  );
};

export default Jobs;
