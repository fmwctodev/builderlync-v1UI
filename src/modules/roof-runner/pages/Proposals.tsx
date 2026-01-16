import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Plus, Search, X, ChevronDown, Download } from 'lucide-react';
import { ProposalsList, TemplatesGrid, SettingsPanel, TabNavigation, TemplateBuilder } from '../components/proposals';
import { templateApi } from '../services/templateApi';
import { proposalsApi } from '../services/proposalsApi';
import GooglePlacesAutocomplete from '../../../shared/components/GooglePlacesAutocomplete';

import { getNearbyJobs, Job } from '../../../shared/store/services/jobsApi';
import { abcSupplyService } from '../services/abcSupplyService';
import { eagleViewService } from '../services/eagleViewService';

export default function Proposals() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';
  const initialTab = (location.state as { activeTab?: string })?.activeTab || 'Proposals';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [filterStatus, setFilterStatus] = useState('All proposals');
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showNewProposalDropdown, setShowNewProposalDropdown] = useState(false);
  const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<'measurement' | 'location' | 'template'>('measurement');
  const [showNewProposalModal, setShowNewProposalModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [proposalAddress, setProposalAddress] = useState('');
  const [proposalLat, setProposalLat] = useState<number | null>(null);
  const [proposalLng, setProposalLng] = useState<number | null>(null);
  const [nearbyJobs, setNearbyJobs] = useState<Job[]>([]);
  const [loadingNearbyJobs, setLoadingNearbyJobs] = useState(false);
  const [attachToJob, setAttachToJob] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedMeasurement, setSelectedMeasurement] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [creatingProposal, setCreatingProposal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProposalId, setDeletingProposalId] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);

  const fetchProposals = async (status?: string) => {
    try {
      setLoading(true);
      const filters = status && status !== 'All proposals' ? { status } : undefined;
      const data = await proposalsApi.getProposals(filters);
      setProposals(data);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals(filterStatus);
  }, [filterStatus]);

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const data = await templateApi.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (showTemplateModal) {
      fetchTemplates();
    }
  }, [showTemplateModal]);

  const fetchMeasurements = async () => {
    try {
      setLoadingMeasurements(true);
      const reports = await eagleViewService.getReports();
      setMeasurements(reports);
    } catch (error) {
      console.error('Error fetching measurements:', error);
      setMeasurements([]);
    } finally {
      setLoadingMeasurements(false);
    }
  };

  useEffect(() => {
    if (showNewProposalModal && currentStep === 'measurement') {
      fetchMeasurements();
    }
  }, [showNewProposalModal, currentStep]);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNewProposalDropdown(false);
      }
    };

    if (showNewProposalDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNewProposalDropdown]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const mapStatusToProposalStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'incomplete': return 'Draft';
      case 'complete': return 'Open';
      case 'sent': return 'Sent';
      case 'signed': return 'Won';
      case 'lost': return 'Lost';
      default: return 'Open';
    }
  };

  const handleDeleteProposal = async () => {
    if (!deletingProposalId) return;

    try {
      await proposalsApi.deleteProposal(Number(deletingProposalId));
      setProposals(proposals.filter(p => p.id !== Number(deletingProposalId)));
      setShowDeleteModal(false);
      setDeletingProposalId(null);
    } catch (error) {
      console.error('Error deleting proposal:', error);
      alert('Failed to delete proposal. Please try again.');
    }
  };

  const handleDuplicateProposal = async (id: string) => {
    try {
      const duplicated = await proposalsApi.duplicateProposal(Number(id));
      await fetchProposals();
      navigate(`${orgPrefix}/proposals/editor/${duplicated.id}`);
    } catch (error) {
      console.error('Error duplicating proposal:', error);
      alert('Failed to duplicate proposal. Please try again.');
    }
  };

  const handleMoveToWon = async (id: string) => {
    try {
      await proposalsApi.updateProposal(Number(id), { status: 'signed' });
      await fetchProposals();
    } catch (error) {
      console.error('Error moving proposal to won:', error);
      alert('Failed to update proposal status. Please try again.');
    }
  };

  const handleMoveToLost = async (id: string) => {
    try {
      await proposalsApi.updateProposal(Number(id), { status: 'lost' });
      await fetchProposals();
    } catch (error) {
      console.error('Error moving proposal to lost:', error);
      alert('Failed to update proposal status. Please try again.');
    }
  };

  const getCoverImage = (sections: any) => {
    return sections?.settings?.coverImage || null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent': return 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300';
      case 'Open': return 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300';
      case 'Won': return 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300';
      case 'Lost': return 'bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-300';
      case 'Draft': return 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const proposalsList = proposals.map(proposal => ({
    id: String(proposal.id),
    title: proposal.title,
    subtitle: proposal.address?.address || 'No address',
    assignedBy: proposal.author?.name || 'Unknown',
    time: formatTimeAgo(proposal.created_at),
    amount: `$${proposal.total?.toFixed(2) || '0.00'}`,
    status: mapStatusToProposalStatus(proposal.status),
    image: getCoverImage(proposal.sections)
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Home</span> / <span className="text-gray-900 dark:text-white">Proposals & Invoices</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proposals & Invoices</h1>
        </div>

        <div>
          <button
            onClick={() => {
              setCurrentStep('measurement');
              setShowNewProposalModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            <Plus size={16} />
            <span>New Proposal</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'Proposals' && (
          loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-gray-500 dark:text-gray-400">Loading proposals...</div>
            </div>
          ) : (
            <ProposalsList
              proposals={proposalsList}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              showFilter={showFilter}
              setShowFilter={setShowFilter}
              viewMode={viewMode}
              setViewMode={setViewMode}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              getStatusColor={getStatusColor}
              onDelete={(id) => {
                setDeletingProposalId(id);
                setShowDeleteModal(true);
              }}
              onDuplicate={handleDuplicateProposal}
              onProposalClick={(id) => navigate(`${orgPrefix}/proposals/editor/${id}`)}
              onMoveToWon={handleMoveToWon}
              onMoveToLost={handleMoveToLost}
            />
          )
        )}

        {activeTab === 'Templates' && (
          <TemplatesGrid
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
        )}

        {activeTab === 'Settings' && <SettingsPanel />}
      </div>

      {showNewProposalModal && currentStep === 'measurement' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">New Proposal</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select measurement report (optional)</p>
              </div>
              <button onClick={() => {
                setShowNewProposalModal(false);
                setSelectedMeasurement(null);
                setProposalAddress('');
                setProposalLat(null);
                setProposalLng(null);
                setNearbyJobs([]);
                setAttachToJob(false);
                setSelectedJobId(null);
                setCurrentStep('measurement');
              }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col p-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search measurement reports"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                {loadingMeasurements ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-gray-500 dark:text-gray-400">Loading measurements...</div>
                  </div>
                ) : measurements.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-gray-500 dark:text-gray-400">No measurement reports found</div>
                  </div>
                ) : (
                  measurements.map((measurement, index) => (
                    <div
                      key={measurement.id || index}
                      className={`flex items-center justify-between p-3 border rounded-md ${selectedMeasurement?.id === measurement.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedMeasurement(measurement)}
                      >
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{measurement.address}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {measurement.reference_id || 'BuilderLync Report'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Created {new Date(measurement.created_at).toLocaleDateString()}</div>
                      </div>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const reportId = measurement.response_data?.ReportIds?.[0];
                          if (!reportId) return;

                          try {
                            const token = localStorage.getItem('token');
                            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

                            const reportResponse = await fetch(
                              `${API_BASE_URL}/eagleview/report?reportId=${reportId}`,
                              {
                                headers: {
                                  Authorization: `Bearer ${token}`
                                }
                              }
                            );

                            const reportData = await reportResponse.json();

                            if (reportData.success && reportData.data?.ReportDownloadLink) {
                              const link = document.createElement('a');
                              link.href = reportData.data.ReportDownloadLink;
                              link.setAttribute('download', `report-${reportId}.pdf`);
                              link.setAttribute('target', '_blank');
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                            } else {
                              alert('Report download link not available.');
                            }
                          } catch (error) {
                            console.error('Error downloading report:', error);
                            alert('Failed to download report. Please try again.');
                          }
                        }}
                        className="ml-3 p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                        title="Download report"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setSelectedMeasurement(null);
                  setCurrentStep('location');
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Create Without Measurement
              </button>
              <button
                onClick={() => {
                  if (selectedMeasurement) {
                    setProposalAddress(selectedMeasurement.address);
                    setProposalLat(selectedMeasurement.order_data?.orderReports?.reportAddresses?.latitude);
                    setProposalLng(selectedMeasurement.order_data?.orderReports?.reportAddresses?.longitude);
                    setShowTemplateModal(true);
                  }
                }}
                disabled={!selectedMeasurement}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewProposalModal && currentStep === 'location' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">New Proposal</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter job location</p>
              </div>
              <button onClick={() => {
                setShowNewProposalModal(false);
                setProposalAddress('');
                setProposalLat(null);
                setProposalLng(null);
                setNearbyJobs([]);
                setAttachToJob(false);
                setSelectedJobId(null);
                setCurrentStep('measurement');
              }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job address <span className="text-red-500">*</span>
                </label>
                <GooglePlacesAutocomplete
                  value={proposalAddress}
                  onChange={async (address, isFromAutocomplete, lat, lng) => {
                    setProposalAddress(address);
                    if (isFromAutocomplete && lat && lng) {
                      setProposalLat(lat);
                      setProposalLng(lng);

                      // Fetch nearby jobs
                      try {
                        setLoadingNearbyJobs(true);
                        const response = await getNearbyJobs(lat, lng, 25);
                        const jobs = response.data.data || [];
                        setNearbyJobs(jobs);
                        if (jobs.length > 0) {
                          setAttachToJob(true);
                        }
                      } catch (error) {
                        console.error('Error fetching nearby jobs:', error);
                        setNearbyJobs([]);
                      } finally {
                        setLoadingNearbyJobs(false);
                      }
                    }
                  }}
                  placeholder="Enter address and select from dropdown"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {proposalAddress && !proposalLat && (
                  <p className="mt-1 text-xs text-orange-600">Please select an address from the dropdown to get coordinates</p>
                )}
              </div>

              {loadingNearbyJobs && (
                <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">Loading nearby jobs...</div>
              )}

              {nearbyJobs.length > 0 && (
                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attachToJob}
                      onChange={(e) => {
                        setAttachToJob(e.target.checked);
                        if (!e.target.checked) setSelectedJobId(null);
                      }}
                      className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Attach to matching job ({nearbyJobs.length} found nearby)
                    </span>
                  </label>

                  {attachToJob && (
                    <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                      {nearbyJobs.map((job) => (
                        <label
                          key={job.id}
                          className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer ${selectedJobId === job.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                          <input
                            type="radio"
                            name="selectedJob"
                            checked={selectedJobId === job.id}
                            onChange={() => setSelectedJobId(job.id!)}
                            className="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white text-sm">{job.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{job.location}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setCurrentStep('measurement')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (!proposalAddress || !proposalLat || !proposalLng) {
                    alert('Please enter and select a valid address from the dropdown');
                    return;
                  }
                  if (attachToJob && !selectedJobId) {
                    alert('Please select a job to attach to');
                    return;
                  }
                  setShowTemplateModal(true);
                }}
                disabled={!proposalAddress || !proposalLat || !proposalLng || (attachToJob && !selectedJobId)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Choose a template</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pick from one of your existing proposal templates to get started</p>
              </div>
              <button onClick={() => {
                setShowTemplateModal(false);
                setSelectedTemplate(null);
                setProposalAddress('');
                setProposalLat(null);
                setProposalLng(null);
                setNearbyJobs([]);
                setAttachToJob(false);
                setSelectedJobId(null);
                setSelectedMeasurement(null);
                setCurrentStep('measurement');
              }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col p-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search templates"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                {creatingProposal && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                    <div className="text-white text-sm">Creating proposal...</div>
                  </div>
                )}
                {loadingTemplates ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-gray-500 dark:text-gray-400">Loading templates...</div>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-gray-500 dark:text-gray-400">No templates found</div>
                  </div>
                ) : (
                  templates.map((template) => (
                    <div
                      key={template.id}
                      className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer ${selectedTemplate?.id === template.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      onClick={() => {
                        setSelectedTemplate(template);
                      }}
                    >
                      {template.content?.settings?.coverImage ? (
                        <img
                          src={template.content.settings.coverImage}
                          alt={template.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-400">No Image</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{template.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {template.summary?.sectionCount || 0} sections, {template.summary?.itemCount || 0} items
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setSelectedTemplate(null);
                  setCurrentStep(selectedMeasurement ? 'measurement' : 'location');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Back
              </button>
              <button
                onClick={async () => {
                  if (!selectedTemplate && selectedMeasurement) {
                    alert('Please select a template when using a measurement report');
                    return;
                  }
                  try {
                    setCreatingProposal(true);

                    // Get address and coordinates
                    const address = proposalAddress || selectedMeasurement?.address;
                    const latitude = proposalLat || selectedMeasurement?.order_data?.orderReports?.reportAddresses?.latitude;
                    const longitude = proposalLng || selectedMeasurement?.order_data?.orderReports?.reportAddresses?.longitude;

                    // Get customer details from selected job if available
                    const selectedJob = nearbyJobs.find(job => job.id === selectedJobId);

                    const proposalData = {
                      ...(selectedTemplate && { template_id: selectedTemplate.id }),
                      title: selectedTemplate?.name || 'New Proposal',
                      address: {
                        address: address,
                        latitude: latitude,
                        longitude: longitude
                      },
                      ...(selectedMeasurement && { report_id: selectedMeasurement.id }),
                      ...(attachToJob && selectedJobId && { job_id: selectedJobId }),
                      ...(selectedJob && {
                        customer_name: selectedJob.customer?.full_name || selectedJob.contactName,
                        customer_email: selectedJob.customer?.email,
                        customer_phone: selectedJob.customer?.phone
                      })
                    };

                    const proposal = await proposalsApi.createProposal(proposalData);
                    setShowTemplateModal(false);
                    setShowNewProposalModal(false);
                    setProposalAddress('');
                    setProposalLat(null);
                    setProposalLng(null);
                    setSelectedTemplate(null);
                    setNearbyJobs([]);
                    setAttachToJob(false);
                    setSelectedJobId(null);
                    setSelectedMeasurement(null);
                    setCurrentStep('measurement');
                    navigate(`${orgPrefix}/proposals/editor/${proposal.id}`);
                  } catch (error) {
                    console.error('Error creating proposal:', error);
                    alert('Failed to create proposal. Please try again.');
                  } finally {
                    setCreatingProposal(false);
                  }
                }}
                disabled={selectedMeasurement && !selectedTemplate}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title={selectedMeasurement && !selectedTemplate ? 'Template is required when measurement is selected' : ''}
              >
                {selectedTemplate ? 'Create Proposal' : 'Create Without Template'}
              </button>
            </div>
          </div>
        </div>
      )
      }

      {
        showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Proposal</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete this proposal? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingProposalId(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProposal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}