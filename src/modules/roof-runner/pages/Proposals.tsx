import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, X, ChevronDown } from 'lucide-react';
import { ProposalsList, TemplatesGrid, SettingsPanel, TabNavigation, TemplateBuilder } from '../components/proposals';
import { templateApi } from '../services/templateApi';
import { proposalsApi } from '../services/proposalsApi';
import GooglePlacesAutocomplete from '../../../shared/components/GooglePlacesAutocomplete';

export default function Proposals() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTab = (location.state as { activeTab?: string })?.activeTab || 'Proposals';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [filterStatus, setFilterStatus] = useState('All proposals');
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showNewProposalDropdown, setShowNewProposalDropdown] = useState(false);
  const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showNewProposalModal, setShowNewProposalModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [proposalAddress, setProposalAddress] = useState('');
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [creatingProposal, setCreatingProposal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProposalId, setDeletingProposalId] = useState<string | null>(null);

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
      navigate(`/proposals/editor/${duplicated.id}`);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Home</span> / <span className="text-gray-900 dark:text-white">Proposals & Invoices</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proposals & Invoices</h1>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNewProposalDropdown(!showNewProposalDropdown)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            <Plus size={16} />
            <span>New Proposal</span>
            <ChevronDown size={16} />
          </button>

          {showNewProposalDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowNewProposalDropdown(false);
                    setShowNewProposalModal(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  Create From Scratch
                </button>
                <button
                  onClick={() => {
                    setShowNewProposalDropdown(false);
                    setShowMeasurementsModal(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  Create From Report
                </button>
                <button
                  onClick={() => {
                    setShowNewProposalDropdown(false);
                    setShowTemplateModal(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  Create From Template
                </button>
              </div>
            </div>
          )}
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
              onProposalClick={(id) => navigate(`/proposals/editor/${id}`)}
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

      {showMeasurementsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Measurements</h3>
              <button onClick={() => setShowMeasurementsModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select the measurement you would like to use for this proposal
              </p>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search all measurement reports"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                {[
                  { address: '1907 Morrow Street, Austin, Texas, United States', version: '1/1', date: 'Oct. 08, 2025' },
                  { address: '7925 Tusman Drive, Austin, Texas, United States', version: '1/1', date: 'Oct. 07, 2025' },
                  { address: '3339 Hancock Drive, Austin, Texas, United States', version: '1/1', date: 'Oct. 06, 2025' },
                  { address: '7807 Lonesome Dove Cove, Austin, Texas, United States', version: '1/1', date: 'Oct. 04, 2025' },
                  { address: '11315 Drumellan Street, Austin, Texas, United States', version: '1/1', date: 'Oct. 03, 2025' },
                  { address: '7901 Havenwood Drive, Austin, Texas, United States', version: '1/1', date: 'Oct. 03, 2025' },
                  { address: '4701 Camacho Street, Austin, Texas, United States', version: '1/1', date: 'Oct. 02, 2025' },
                  { address: '2125 Independence Drive, Austin, Texas, United States', version: '1/1', date: 'Sept. 29, 2025' },
                  { address: '7920 Rockwood Lane, Austin, Texas, United States', version: '8/8', date: 'Sept. 29, 2025', latest: true },
                  { address: '7920 Rockwood Lane, Austin, Texas, United States', version: '7/8', date: 'Sept. 29, 2025' },
                ].map((measurement, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{measurement.address}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {measurement.version} BuilderLync Report{measurement.latest ? ' - Latest' : ''}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Completed {measurement.date}</div>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">Download</button>
                  </div>
                ))}
              </div>

            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { setShowMeasurementsModal(false); setShowNewProposalModal(true); }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Create without measurement
              </button>
              <button
                onClick={() => { setShowMeasurementsModal(false); setShowNewProposalModal(true); }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Create Proposal
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewProposalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">New proposal</h3>
              <button onClick={() => setShowNewProposalModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job address
                </label>
                <GooglePlacesAutocomplete
                  value={proposalAddress}
                  onChange={(address) => setProposalAddress(address)}
                  placeholder="Enter address and select"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { setShowNewProposalModal(false); setShowTemplateModal(true); }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Continue
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
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
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
                      className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={async () => {
                        try {
                          setCreatingProposal(true);
                          const proposal = await proposalsApi.createProposal({
                            template_id: template.id,
                            title: template.name,
                            address: {
                              address: proposalAddress,
                            },
                          });
                          setShowTemplateModal(false);
                          navigate(`/proposals/editor/${proposal.id}`);
                        } catch (error) {
                          console.error('Error creating proposal:', error);
                          alert('Failed to create proposal. Please try again.');
                        } finally {
                          setCreatingProposal(false);
                        }
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
              <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                Create without template
              </button>
              <button 
                onClick={() => {
                  setShowTemplateModal(false);
                  setShowProposalEditor(true);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Use this template
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
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
      )}
    </div>
  );
}