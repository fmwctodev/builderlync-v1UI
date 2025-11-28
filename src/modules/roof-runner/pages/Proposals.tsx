import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, X, ChevronDown } from 'lucide-react';
import { ProposalsList, TemplatesGrid, SettingsPanel, TabNavigation, TemplateBuilder } from '../components/proposals';
import ProposalEditor from '../components/ProposalEditor';
import { getInvoices, Invoice } from '../../../shared/store/services/invoicesApi';

export default function Proposals() {
  const [activeTab, setActiveTab] = useState('Proposals');
  const [filterStatus, setFilterStatus] = useState('All proposals');
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showNewProposalDropdown, setShowNewProposalDropdown] = useState(false);
  const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showNewProposalModal, setShowNewProposalModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [showProposalEditor, setShowProposalEditor] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [proposalAddress, setProposalAddress] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const result = await getInvoices();
      
      if (result.success) {
        setInvoices(result.data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

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
      case 'paid': return 'Won';
      case 'open': return 'Open';
      case 'sent': return 'Sent';
      case 'draft': return 'Draft';
      case 'overdue': return 'Lost';
      default: return 'Open';
    }
  };

  const proposals = invoices.map(invoice => ({
    id: invoice.doc_number,
    title: invoice.invoice_line_items[0]?.description || 'Invoice',
    subtitle: invoice.customer_name,
    assignedBy: invoice.contacts?.full_name || 'Unknown',
    time: formatTimeAgo(invoice.created_at),
    amount: `$${invoice.total_amount.toFixed(2)}`,
    status: mapStatusToProposalStatus(invoice.status),
    image: '/api/placeholder/300/200'
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
              <div className="text-gray-500 dark:text-gray-400">Loading invoices...</div>
            </div>
          ) : (
            <ProposalsList
              proposals={proposals}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              showFilter={showFilter}
              setShowFilter={setShowFilter}
              viewMode={viewMode}
              setViewMode={setViewMode}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              getStatusColor={getStatusColor}
            />
          )
        )}

        {activeTab === 'Templates' && (
          <TemplatesGrid
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            onCreateTemplate={() => setShowTemplateBuilder(true)}
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
                <input
                  type="text"
                  value={proposalAddress}
                  onChange={(e) => setProposalAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter address and select"
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
                {[
                  'New template',
                  'RFP | Edgewick HOA | Roofing Inspection, Maintenance & Repair Services',
                  'Commercial Roof Repair Template',
                  'Commercial - TPO/PVC',
                  'NEW COMMERCIAL',
                  'Retail Residential - Standing Seam (Snap Lock) - Metal Estimate 24G',
                  'Retail - Multifamily IKO/Dynasty',
                  'Multi Family - Retail (Shingle)',
                  'Insurance Scope Template (IKO Dynasty & Nordic)',
                  'Roofing Labor',
                  'Insurance Restoration Work Authorization',
                  'Service Agreement',
                  'Shingle Coatings'
                ].map((template, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setSelectedTemplateId(template);
                      setShowTemplateModal(false);
                      setShowProposalEditor(true);
                    }}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{template}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Template cover image</div>
                    </div>
                  </div>
                ))}
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

      {showTemplateBuilder && (
        <TemplateBuilder onClose={() => setShowTemplateBuilder(false)} />
      )}

      <ProposalEditor
        isOpen={showProposalEditor}
        onClose={() => {
          setShowProposalEditor(false);
          setSelectedTemplateId(undefined);
        }}
        templateId={selectedTemplateId}
      />
    </div>
  );
}