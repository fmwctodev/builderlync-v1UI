import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, X, Grid, List, Settings, ChevronDown, Eye, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { getJobs, createJob, updateJob, deleteJob, getJobById, Job, CreateJobRequest } from '../../../shared/store/services/jobsApi';
import { getStaff, StaffMember } from '../../../shared/store/services/staffApi';

const Jobs: React.FC = () => {
  const [activeView, setActiveView] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [jobAddress, setJobAddress] = useState('');
  const [jobCards, setJobCards] = useState<{[key: string]: any[]}>({});
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      setToast({ message: 'Failed to load jobs', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await getStaff(1, 100);
      setStaff(response.data.data || []);
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

  const assignees = [
    'Anchor Dwyer', 'Austin Queen', 'Avery Zhao', 'Brendan Mullins', 'Chris Debayle',
    'Dorian Mendivil', 'Erin Haws', 'Ethan Lintz', 'Garrett Jones', 'Giulia Johnson',
    'Hayley Parks', 'JEFFREY JONES', 'Jacob Cox', 'Jake Webb', 'James Wolfgang Kuntz',
    'Joey G', 'Kirk White', 'Lexus Oliver', 'Luis Torres', 'Nicholas Wnukowski',
    'Nick X', 'Ralph Nevarez', 'Ray Aguilus', 'Richard Endruschat', 'Sean Richard',
    'Vijender Singh', 'Willy Hill'
  ];

  const stages = [
    'New lead', 'Appointment scheduled', 'Appointment run', 'Adjuster Meeting Scheduled',
    'Adjuster Meeting Complete', 'Under Service Agreement/Contin', 'Estimate Received',
    'Proposal sent/presented', 'Proposal follow-up', 'Reinspection', 'Public Adjuster',
    'Proposal signed/Pre-Production', 'Supplementing', 'Pre-production', 'Materials Ordered',
    'Production', 'Post-production', 'Payments/Invoicing', 'Post-job completion follow-up',
    'Job completed', 'Lost', 'Unqualified'
  ];

  const leadSources = [
    'Unassigned', 'Antonio', 'Billboard/Print Ad', 'CAI', 'Call Center', 'Call In',
    'Chive', 'Clive', 'Customer referral', 'DEMO - IE', 'Door', 'Door hanger',
    'Door knocking', 'Existing Relationship', 'Facebook', 'Goodwin', 'Google',
    'GutterMaxx', 'Home Advisor', 'Instagram', 'Insurance Agent Referral', 'Light',
    'Mailer', 'Nadine', 'Omar', 'Realestate referral', 'Referral - Kammie', 'REI',
    'Repeat Customer', 'Roof Engine', 'The Roofing Broker', 'Thumbtack', 'Torus',
    'Website', 'Website - IE', 'Yard Sign', 'Yelp'
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
            <button
              onClick={() => setShowAddressModal(true)}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Job</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-6 mb-4">
            <button
              onClick={() => setActiveView('board')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeView === 'board'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Board View</span>
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeView === 'list'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setActiveView('settings')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeView === 'settings'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="w-96 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full pl-10"
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="input min-w-[200px]"
            >
              <option value="default">Default</option>
              <option value="awaiting">Awaiting Adjuster Inspection</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'board' && (
            <div className="h-full p-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <div className="flex gap-4 min-w-max">
                {[
                  { name: 'New lead', count: 527, value: '$1.00' },
                  { name: 'Appointment scheduled', count: 3, value: '$227,296.61' },
                  { name: 'Appointment run', count: 122, value: '$40,200.00' },
                  { name: 'Adjuster Meeting Scheduled', count: 12, value: '$0.00' },
                  { name: 'Adjuster Meeting Complete', count: 19, value: '$96,800.00' },
                  { name: 'Under Service Agreement/Contin', count: 1, value: '$0.00' },
                  { name: 'Estimate Received', count: 1, value: '$0.00' },
                  { name: 'Proposal sent/presented', count: 217, value: '$12,063,204.78' },
                  { name: 'Proposal follow-up', count: 5, value: '$0.00' },
                  { name: 'Reinspection', count: 14, value: '$0.00' },
                  { name: 'Public Adjuster', count: 15, value: '$70,455.70' },
                  { name: 'Proposal signed/Pre-Production', count: 30, value: '$547,944.40' },
                  { name: 'Supplementing', count: 3, value: '$23,050.70' },
                  { name: 'Pre-production', count: 2, value: '$63,110.40' },
                  { name: 'Materials Ordered', count: 0, value: '$0.00' },
                  { name: 'Production', count: 7, value: '$636,082.27' },
                  { name: 'Post-production', count: 5, value: '$73,562.72' },
                  { name: 'Payments/Invoicing', count: 23, value: '$395,942.78' },
                  { name: 'Post-job completion follow-up', count: 0, value: '$0.00' },
                  { name: 'Job completed', count: 220, value: '$3,278,832.60' },
                  { name: 'Lost', count: 102, value: '$283,592.26' },
                  { name: 'Unqualified', count: 121, value: '$137,250.00' }
                ].map((column, index) => (
                  <div key={column.name} className="w-80 flex-shrink-0">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                      {/* Column Header */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{column.name}</h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">({column.count})</span>
                          <span className="font-medium text-green-600 dark:text-green-400">{column.value}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">🏠 Default</span>
                          <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">🧰 Awaiting Adjuster Inspection</span>
                        </div>
                      </div>
                      
                      {/* Cards Container */}
                      <div 
                        className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent min-h-[200px]"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const cardData = e.dataTransfer.getData('text/plain');
                          if (cardData) {
                            const { cardId, sourceColumn } = JSON.parse(cardData);
                            if (sourceColumn !== column.name) {
                              // Move card from source to target column
                              setJobCards(prev => {
                                const newCards = { ...prev };
                                const cardToMove = newCards[sourceColumn].find(card => card.id === cardId);
                                if (cardToMove) {
                                  newCards[sourceColumn] = newCards[sourceColumn].filter(card => card.id !== cardId);
                                  newCards[column.name] = [...newCards[column.name], cardToMove];
                                }
                                return newCards;
                              });
                            }
                            setDraggedCard(null);
                          }
                        }}
                      >
                        {/* Job Cards */}
                        {(jobCards[column.name] || []).map((card) => (
                          <div
                            key={card.id}
                            draggable
                            className={`bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-move hover:shadow-md transition-all duration-200 ${
                              draggedCard === card.id ? 'opacity-50 scale-95' : ''
                            }`}
                            onDragStart={(e) => {
                              const dragData = JSON.stringify({ cardId: card.id, sourceColumn: column.name });
                              e.dataTransfer.setData('text/plain', dragData);
                              setDraggedCard(card.id);
                            }}
                            onDragEnd={() => setDraggedCard(null)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">{card.jobNumber}</h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">2d ago</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{card.address}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">{card.value}</span>
                              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                {card.assignee}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* View All Button */}
                        {(jobCards[column.name]?.length || 0) === 0 && (
                          <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                            Drop cards here
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeView === 'list' && (
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {[
                          'Last updated', 'Time in stage', 'Address', 'Contact', 'Value',
                          'Workflow', 'Stage', 'Close date', 'Lead source', 'Assignees',
                          'Job owner', 'Tasks', 'Reports', 'Proposals', 'Actions'
                        ].map(header => (
                          <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {loading ? (
                        <tr>
                          <td colSpan={15} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            Loading jobs...
                          </td>
                        </tr>
                      ) : jobs.length === 0 ? (
                        <tr>
                          <td colSpan={15} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            No jobs found
                          </td>
                        </tr>
                      ) : (
                        jobs.map((job) => (
                          <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">-</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{job.location}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{job.name}</td>
                            <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                              ${job.jobValue?.toLocaleString() || '0'}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                🏠 {job.workflowStages}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{job.workflowStages}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                              {job.closeDate ? new Date(job.closeDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{job.source || 'N/A'}</td>
                            <td className="px-4 py-3">
                              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                {job.jobOwner ? job.jobOwner.charAt(0).toUpperCase() : 'U'}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{job.jobOwner || 'Unassigned'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">0</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">0</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">0</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(job)}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(job.id!)}
                                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {activeView === 'settings' && (
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-6 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Job settings</h2>
                <p className="text-gray-600 dark:text-gray-400">All your job specific settings are listed below</p>
              </div>

              {/* Workflows & Stages */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Workflows & stages</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">A job moves through various stages before it is completed. Stages are grouped together inside workflows, which are listed below and can be customized.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🏠</span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Default</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>1448 jobs</span>
                          <span>22 stages</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 hover:shadow-sm border border-gray-200 dark:border-gray-600">Manage</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🧰</span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Awaiting Adjuster Inspection</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>1 job</span>
                          <span>22 stages</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 hover:shadow-sm border border-gray-200 dark:border-gray-600">Manage</button>
                  </div>
                </div>
                
                <button className="mt-6 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create a workflow</span>
                </button>
              </div>

              {/* Lead Sources */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lead sources</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Jobs are attributed to various lead sources which can be customized</p>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 hover:shadow-sm border border-gray-200 dark:border-gray-600">Manage sources</button>
              </div>

              {/* Cards */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cards</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Customize the look and layout of your team's job cards</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address Card */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">1 Western Road, Houston, Texas</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rebecca Smith</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Address</p>
                  </div>
                  
                  {/* Customer Name Card */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Rebecca Smith</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">1 Western Road, Houston, Texas</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Customer name</p>
                  </div>
                </div>
              </div>

              {/* Default Folders */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Default folders</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Default folders will automatically appear in every new job to keep your attachments organized. You can add up to 20.</p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-900 dark:text-white">Claims Documents</span>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-900 dark:text-white">Labor Invoice</span>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-900 dark:text-white">Material Invoices</span>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New folder</span>
                </button>
              </div>

              {/* Job Costing Access */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Job costing access</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">By default job costing is only accessible to managers (and higher roles), to make it available to everyone in your team, please uncheck the box</p>
                
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <span className="text-gray-900 dark:text-white">Only managers</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Filters Sidebar */}
        {showFilters && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Sort</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Filters */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected filters</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">None</p>
            </div>

            {/* Sort By */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort by</h4>
              <div className="space-y-2">
                {[
                  'Last updated (newest)', 'Last updated (oldest)', 'Created date (newest)',
                  'Created date (oldest)', 'Close date (newest)', 'Close date (oldest)',
                  'Address (alphabetical)', 'Value (higher)', 'Value (lower)',
                  'Time in stage (newest)', 'Time in stage (oldest)'
                ].map(option => (
                  <label key={option} className="flex items-center">
                    <input type="radio" name="sort" className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Assignees & Job Owner */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Assignees & Job owner</h4>
              <div className="flex space-x-2 mb-3">
                <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select all</button>
                <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select none</button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {assignees.map(assignee => (
                  <label key={assignee} className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{assignee}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stages */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Stages</h4>
              <div className="flex space-x-2 mb-3">
                <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select all</button>
                <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select none</button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">2 workflows hidden</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm">🏠 Default</span>
                  <span className="text-sm">🧰 Awaiting Adjuster Inspection</span>
                </div>
                {stages.map(stage => (
                  <label key={stage} className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{stage}</span>
                    <span className="ml-auto text-xs">🏠 🧰</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Updated Date */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Updated date</h4>
              <div className="space-y-2">
                {[
                  'Today', 'Last 7 days', 'Last 4 weeks', 'Last 3 months',
                  'Last 6 months', 'Last 12 months', 'Month to date',
                  'Quarter to date', 'Year to date'
                ].map(option => (
                  <label key={option} className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Close Date */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Close date</h4>
              <div className="space-y-2">
                {[
                  'Last 7 days', 'Last 4 weeks', 'Last 3 months', 'Last 6 months',
                  'Last 12 months', 'Month to date', 'Quarter to date', 'Year to date'
                ].map(option => (
                  <label key={option} className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Lead Sources */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Lead sources</h4>
              <div className="flex space-x-2 mb-3">
                <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select all</button>
                <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select none</button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Unassigned</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Jobs that have no lead source</p>
                  </div>
                </label>
                {leadSources.slice(1).map(source => (
                  <label key={source} className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{source}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Address Input Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">New job</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Job address</p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={jobAddress}
                  onChange={(e) => setJobAddress(e.target.value)}
                  placeholder="Enter address and select"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => {
                      if (jobAddress.trim()) {
                        setFormData({...formData, location: jobAddress, name: jobAddress});
                        setShowAddressModal(false);
                        setShowJobDetails(true);
                      }
                    }}
                    disabled={!jobAddress.trim()}
                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    Continue
                  </button>
                  
                  <div className="text-gray-400 dark:text-gray-500 text-sm">or</div>
                  
                  <button
                    onClick={() => {
                      setShowAddressModal(false);
                      setShowJobDetails(true);
                    }}
                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    Create from CompanyCam
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowAddressModal(false);
                  setJobAddress('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {showJobDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl mx-4 max-h-[95vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex h-full">
              {/* Left Sidebar */}
              <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{formData.location || 'New Job'}</h3>
                    <button
                      onClick={() => {
                        setShowJobDetails(false);
                        resetForm();
                        setJobAddress('');
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Job details</p>
                </div>
                
                <div className="p-4 space-y-2">
                  {[
                    'Tasks', 'Calendar', 'Measurements', 'Proposals', 'PDF Signer',
                    'Material orders', 'Work orders', 'Invoices', 'Job costing',
                    'Attachments', 'Instant Estimate', 'Integration'
                  ].map((item) => (
                    <button
                      key={item}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 overflow-y-auto">
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
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                    setShowJobDetails(false);
                  }} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assignee(s)</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <option>Unassigned</option>
                          {staff.map(member => (
                            <option key={member.id} value={`${member.first_name} ${member.last_name}`}>
                              {member.first_name} {member.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job owner</label>
                        <select
                          value={formData.jobOwner}
                          onChange={(e) => setFormData({...formData, jobOwner: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Vijender Singh</option>
                          {staff.map(member => (
                            <option key={member.id} value={`${member.first_name} ${member.last_name}`}>
                              {member.first_name} {member.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Workflow & stages</label>
                        <div className="space-y-2">
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option>Default</option>
                          </select>
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
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.insuranceEnabled}
                          onChange={(e) => setFormData({...formData, insuranceEnabled: e.target.checked})}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Insurance</span>
                      </label>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => {
                          setShowJobDetails(false);
                          resetForm();
                          setJobAddress('');
                        }}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                      >
                        {loading ? 'Creating...' : 'Create Job'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingJob ? 'Edit Job' : 'Create New Job'}
                </h3>
                <button
                  onClick={() => {
                    setShowJobModal(false);
                    setEditingJob(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Owner</label>
                    <select
                      value={formData.jobOwner}
                      onChange={(e) => setFormData({...formData, jobOwner: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="">Select job owner</option>
                      {staff.map(member => (
                        <option key={member.id} value={`${member.first_name} ${member.last_name}`}>
                          {member.first_name} {member.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Value</label>
                    <input
                      type="number"
                      value={formData.jobValue}
                      onChange={(e) => setFormData({...formData, jobValue: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Close Date</label>
                    <input
                      type="date"
                      value={formData.closeDate}
                      onChange={(e) => setFormData({...formData, closeDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Details</label>
                  <textarea
                    value={formData.details}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJobModal(false);
                      setEditingJob(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New Job Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New</h3>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Job</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This will create a card on the CRM board</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Report</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get a measurement report in hours</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Proposal</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Convert reports into customer proposals</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Customer</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add new contacts to Roofr</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;