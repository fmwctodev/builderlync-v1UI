import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { getJobs, createJob, updateJob, deleteJob, getJobCounts, getJobById, Job, CreateJobRequest } from '../../../shared/store/services/jobsApi';
import { getStaff, StaffMember } from '../../../shared/store/services/staffApi';
import { autoCreateTasksForStage } from '../../../shared/store/services/jobTasksApi';
import { useGetPipelinesQuery } from '../../../shared/store/services/pipelinesApi';
import JobsHeader from '../components/JobsHeader';
import JobsTable from '../components/JobsTable';
import JobsBoardView from '../components/JobsBoardView';
import JobsSettings from '../components/JobsSettings';
import FiltersSidebar, { AdvancedFilters } from '../components/FiltersSidebar';
import AddressModal from '../components/AddressModal';
import JobDetailsModal from '../components/JobDetailsModal';
import AddOpportunityModal from '../components/opportunities/AddOpportunityModal';
import Toast from '../components/Toast';
import { hasPermission } from '../../../shared/utils/permissions';

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showAddOpportunityModal, setShowAddOpportunityModal] = useState(false);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [linkedJobData, setLinkedJobData] = useState<Job | null>(null);
  const [jobAddress, setJobAddress] = useState('');
  const [jobCoordinates, setJobCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [jobCounts, setJobCounts] = useState<any>(null);
  const PAGE_SIZE = 50;
  
  const { data: pipelines } = useGetPipelinesQuery();
  const currentPipeline = selectedPipelineId === 'all' 
    ? pipelines?.find(p => p.is_default) 
    : pipelines?.find(p => p.id === parseInt(selectedPipelineId));
  
  const pipelineStages = currentPipeline?.stages || [];

  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    sortBy: 'Last updated (newest)',
    assignees: [],
    stages: [],
    updatedDate: [],
    closeDate: [],
    createdDate: []
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
    pipelineId: null,
    stageId: null,
    closeDate: new Date().toISOString().split('T')[0],
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
    contactName: null,
    tags: []
  });

  const resolveContactId = (job: Job | any): number | null => {
    const id =
      job.contact_id ??
      job.contactId ??
      job.customer_id ??
      job.customerId ??
      job.customer?.id ??
      null;
    return id ? Number(id) : null;
  };

  const resolveContactName = (job: Job | any): string | null => {
    if (job.contactName) return job.contactName;
    if (job.customer) {
      return job.customer.full_name || job.customer.fullName || job.customer.name || job.customer.company || job.customer.email || job.customer.phone || null;
    }
    if (job.contact_name) return job.contact_name;
    return null;
  };

  const formatDateForInput = (dateString: string | undefined | null): string => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  // Map selectedFilter value to the workflowStage API param
  const getWorkflowStageFromFilter = (filter: string): string | undefined => {
    if (filter === 'all') return undefined;
    if (filter === 'active') return undefined; // handled by status param
    if (filter === 'completed') return 'Job Complete';
    if (filter === 'lost') return 'Job Lost';
    
    // For dynamic stages, the filter value is already the stage name
    return filter;
  };

  const fetchJobs = async (page: number = 1) => {
    try {
      setLoading(true);

      const workflowStage = getWorkflowStageFromFilter(selectedFilter);
      const isActiveFilter = selectedFilter === 'active';

      const filters = {
        jobType: (selectedJobType !== 'all' && selectedJobType !== 'instant-estimator') ? selectedJobType : undefined,
        source: selectedJobType === 'instant-estimator' ? 'Instant Estimator' : undefined,
        search: searchQuery || undefined,
        sortBy: advancedFilters.sortBy,
        assignees: advancedFilters.assignees.length > 0 ? advancedFilters.assignees : undefined,
        // If sidebar stages are selected, use those; otherwise use the dropdown filter stage
        stages: advancedFilters.stages.length > 0 ? advancedFilters.stages : undefined,
        workflowStage: advancedFilters.stages.length === 0 ? workflowStage : undefined,
        status: isActiveFilter ? 'active' : undefined,
        pipelineId: selectedPipelineId !== 'all' ? selectedPipelineId : undefined,
        updatedDate: advancedFilters.updatedDate.length > 0 ? advancedFilters.updatedDate : undefined,
        closeDate: advancedFilters.closeDate.length > 0 ? advancedFilters.closeDate : undefined,
        createdDate: advancedFilters.createdDate.length > 0 ? advancedFilters.createdDate : undefined,
      };

      const response = await getJobs(page, PAGE_SIZE, filters);
      const fetchedJobs = response.data.data || [];
      const pagination = response.data.pagination;

      setJobs(fetchedJobs);
      setCurrentPage(pagination.page);
      setTotalJobs(pagination.total);
      setTotalPages(pagination.totalPages);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      setToast({ message: 'Failed to load jobs', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const filters = {
        jobType: (selectedJobType !== 'all' && selectedJobType !== 'instant-estimator') ? selectedJobType : undefined,
        source: selectedJobType === 'instant-estimator' ? 'Instant Estimator' : undefined,
        search: searchQuery || undefined,
        assignees: advancedFilters.assignees.length > 0 ? advancedFilters.assignees : undefined,
        pipelineId: selectedPipelineId !== 'all' ? selectedPipelineId : undefined,
        updatedDate: advancedFilters.updatedDate.length > 0 ? advancedFilters.updatedDate : undefined,
        closeDate: advancedFilters.closeDate.length > 0 ? advancedFilters.closeDate : undefined,
        createdDate: advancedFilters.createdDate.length > 0 ? advancedFilters.createdDate : undefined,
      };

      const response = await getJobCounts(filters);
      setJobCounts(response.data);
    } catch (error) {
      console.error('Error fetching job counts:', error);
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
      const previousStage = viewingJob?.workflowStages;
      const newStage = formData.workflowStages;

      // Set customerId from contactId
      const jobData: CreateJobRequest = {
        ...formData,
        customerId: formData.contactId || null,
        // Ensure numeric fields are properly handled
        jobValue: String(formData.jobValue || '0'),
        claimAmount: Number(formData.claimAmount) || 0,
        deductible: Number(formData.deductible) || 0,
        // Ensure assignees is an array of numbers
        assignees: formData.assignees.filter(id => id && !isNaN(Number(id))).map(id => Number(id)),
      };

      if (viewingJob) {
        await updateJob(viewingJob.id!, jobData);

        if (previousStage !== newStage && viewingJob.id) {
          /*
          try {
            const createdTasks = await autoCreateTasksForStage(viewingJob.id, newStage);
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
          */
          setModalMessage({ message: 'Job updated successfully!', type: 'success' });
        } else {
          setModalMessage({ message: 'Job updated successfully!', type: 'success' });
        }

        // Refresh the viewing job data
        const updatedJobsResponse = await getJobs(1, 100);
        const updatedJob = updatedJobsResponse.data.data.find(j => j.id === viewingJob.id);
        if (updatedJob) {
          setViewingJob(updatedJob);
        }
      } else {
        const response = await createJob(jobData);
        const newJob = response.data;
        const newJobId = newJob.id;

        if (newJobId) {
          /*
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
          */
          setModalMessage({ message: 'Job created successfully!', type: 'success' });

          // Set the newly created job as viewingJob so tabs can access it
          setViewingJob(newJob);
        } else {
          setModalMessage({ message: 'Job created successfully!', type: 'success' });
        }
      }

      // Refresh jobs list
      fetchJobs(currentPage);
      fetchCounts();
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
      fetchJobs(currentPage);
      fetchCounts();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete job';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleEdit = (job: Job) => {
    const contactId = resolveContactId(job);
    const contactName = resolveContactName(job);
    setViewingJob(job);
    setFormData({
      name: job.name,
      location: job.location,
      customerId: job.customer_id || job.customerId || null,
      assignees: job.assignees,
      jobOwner: job.job_owner || job.jobOwner || null,
      workflowStages: job.workflow_stages || job.workflowStages,
      closeDate: formatDateForInput(job.close_date || job.closeDate),
      jobValue: String(job.job_value || job.jobValue || ''),
      source: job.source,
      details: job.details,
      insuranceEnabled: job.insurance_enabled || job.insuranceEnabled || false,
      insuranceCompany: job.insurance_company || job.insuranceCompany || '',
      policyAccountNumber: job.policy_account_number || job.policyAccountNumber || '',
      claimNumber: job.claim_number || job.claimNumber || '',
      dateOfLoss: formatDateForInput(job.date_of_loss || job.dateOfLoss),
      typeOfDamage: job.type_of_damage || job.typeOfDamage || '',
      claimAmount: Number(job.claim_amount || job.claimAmount || 0),
      deductible: job.deductible || 0,
      claimDetails: job.claim_details || job.claimDetails || '',
      createdBy: job.created_by || job.createdBy || null,
      editedBy: job.edited_by || job.editedBy || null,
      jobType: job.jobType || 'residential',
      contactId,
      contactName,
      tags: job.tags || [],
      pipelineId: job.pipelineId || job.pipeline_id || null,
      stageId: job.stageId || job.stage_id || null,
    });
    setShowJobDetails(true);
  };

  const handleView = (job: Job) => {
    const contactId = resolveContactId(job);
    const contactName = resolveContactName(job);
    setViewingJob(job);
    setFormData({
      name: job.name,
      location: job.location,
      customerId: job.customer_id || job.customerId || null,
      assignees: job.assignees,
      jobOwner: job.job_owner || job.jobOwner || null,
      workflowStages: job.workflow_stages || job.workflowStages,
      closeDate: formatDateForInput(job.close_date || job.closeDate),
      jobValue: String(job.job_value || job.jobValue || ''),
      source: job.source,
      details: job.details,
      insuranceEnabled: job.insurance_enabled || job.insuranceEnabled || false,
      insuranceCompany: job.insurance_company || job.insuranceCompany || '',
      policyAccountNumber: job.policy_account_number || job.policyAccountNumber || '',
      claimNumber: job.claim_number || job.claimNumber || '',
      dateOfLoss: formatDateForInput(job.date_of_loss || job.dateOfLoss),
      typeOfDamage: job.type_of_damage || job.typeOfDamage || '',
      claimAmount: Number(job.claim_amount || job.claimAmount || 0),
      deductible: job.deductible || 0,
      claimDetails: job.claim_details || job.claimDetails || '',
      createdBy: job.created_by || job.createdBy || null,
      editedBy: job.edited_by || job.editedBy || null,
      jobType: job.jobType || 'residential',
      contactId,
      contactName,
      tags: job.tags || []
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
      closeDate: new Date().toISOString().split('T')[0],
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
      contactName: null,
      tags: [],
      pipelineId: null,
      stageId: null
    });
  };

  useEffect(() => {
    if (location.state?.createFromOpportunity && location.state?.opportunityData) {
      const opp = location.state.opportunityData;
      setFormData({
        ...formData,
        name: opp.opportunity_name,
        location: opp.property_address || '',
        jobValue: String(opp.value || ''),
        source: opp.source || '',
        jobType: 'residential',
        contactName: opp.contacts?.[0]?.contact_name || null,
        opportunity_id: opp.id,
      });
      setShowJobDetails(true);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.createFromContact && location.state?.contactData) {
      const contact = location.state.contactData;
      setFormData({
        ...formData,
        contactId: Number(contact.id),
        contactName: contact.fullName,
        location: contact.address || '',
        name: contact.address || contact.fullName || 'New Job',
      });
      if (contact.address) {
        setJobAddress(contact.address);
      }
      setShowAddressModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  // Handle direct job modal opening via query params
  useEffect(() => {
    const jobIdParam = searchParams.get('jobId');
    if (jobIdParam) {
      const fetchAndOpenJob = async () => {
        try {
          const response = await getJobById(Number(jobIdParam));
          if (response?.data) {
            handleView(response.data);
            
            // Remove the jobId from the URL so it doesn't reopen on refresh
            searchParams.delete('jobId');
            setSearchParams(searchParams, { replace: true });
          }
        } catch (error) {
          console.error('Failed to open job from URL:', error);
        }
      };
      fetchAndOpenJob();
    }
  }, [searchParams]);

  useEffect(() => {
    fetchJobs(1);
    fetchStaff();
    fetchCounts();
  }, []);

  useEffect(() => {
    // Refresh staff when opening job details so "Me" label reflects latest profile updates.
    if (showJobDetails) {
      fetchStaff();
    }
  }, [showJobDetails]);

  useEffect(() => {
    setCurrentPage(1);
    fetchJobs(1);
    fetchCounts();
  }, [selectedJobType, selectedFilter, searchQuery, advancedFilters, selectedPipelineId]);

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



  const handleCreateOpportunity = (job: Job) => {
    setLinkedJobData(job);
    setShowAddOpportunityModal(true);
    setShowJobDetails(false);
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
        totalJobs={totalJobs}
        jobCounts={jobCounts}
        pipelineStages={pipelineStages}
        pipelines={pipelines}
        selectedPipelineId={selectedPipelineId}
        setSelectedPipelineId={setSelectedPipelineId}
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
                      // Ensure jobValue is a valid numeric string, default to '0'
                      jobValue: String(job.jobValue || job.job_value || '0'),
                      // Ensure numeric fields are numbers or null
                      claimAmount: Number(job.claimAmount || job.claim_amount || 0),
                      deductible: Number(job.deductible || 0),
                      latitude: job.latitude ? Number(job.latitude) : undefined,
                      longitude: job.longitude ? Number(job.longitude) : undefined
                    } as CreateJobRequest);
                    fetchJobs(currentPage);
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
              currentPage={currentPage}
              totalPages={totalPages}
              totalJobs={totalJobs}
              pageSize={PAGE_SIZE}
              onPageChange={(page) => fetchJobs(page)}
            />
          )}

          {activeView === 'settings' && (hasPermission('jobs', 'view') || hasPermission('jobs', 'manage') || hasPermission('projects', 'view') || hasPermission('projects', 'manage')) && <JobsSettings />}
        </div>

        <FiltersSidebar
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onFiltersChange={setAdvancedFilters}
          currentFilters={advancedFilters}
          pipelineStages={pipelineStages}
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
        modalMessage={modalMessage}
        setModalMessage={setModalMessage}
        onCreateOpportunity={handleCreateOpportunity}
      />

      <AddOpportunityModal
        isOpen={showAddOpportunityModal}
        onClose={() => {
          setShowAddOpportunityModal(false);
          setLinkedJobData(null);
        }}
        onSuccess={() => {
          setShowAddOpportunityModal(false);
          setLinkedJobData(null);
        }}
        linkedJobData={linkedJobData}
      />

    </div>
  );
};

export default Jobs;
