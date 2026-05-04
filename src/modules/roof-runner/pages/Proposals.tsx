import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronDown, Sparkles, Download } from 'lucide-react';
import { ProposalsList, TemplatesGrid, SettingsPanel, TabNavigation, TemplateBuilder } from '../components/proposals';
import ProposalEditor from '../components/ProposalEditor';
import {
  PageContainer, PageHeader, Section, Button, Modal, Input, Field,
} from '../../../shared/components/ui';

export default function Proposals() {
  const navigate = useNavigate();
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

  const proposals = [
    {
      id: '001',
      title: 'Roof Replacement - Johnson Residence',
      subtitle: '123 Main St, Anytown, ST 12345',
      assignedBy: 'Mike Johnson',
      time: '2 hours ago',
      amount: '$15,250',
      status: 'Sent',
      image: '/api/placeholder/300/200'
    },
    {
      id: '002',
      title: 'Commercial Roof Repair',
      subtitle: '456 Oak Ave, Business District',
      assignedBy: 'Sarah Wilson',
      time: '1 day ago',
      amount: '$8,750',
      status: 'Open',
      image: '/api/placeholder/300/200'
    },
    {
      id: '003',
      title: 'Residential Shingle Replacement',
      subtitle: '789 Pine St, Residential Area',
      assignedBy: 'John Smith',
      time: '3 days ago',
      amount: '$12,500',
      status: 'Won',
      image: '/api/placeholder/300/200'
    }
  ];

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
    <PageContainer>
      <PageHeader
        eyebrow="Workspace"
        title="Proposals"
        actions={
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="primary"
              leadingIcon={<Plus />}
              trailingIcon={<ChevronDown />}
              onClick={() => setShowNewProposalDropdown(!showNewProposalDropdown)}
            >
              New Proposal
            </Button>

            {showNewProposalDropdown && (
              <div className="absolute right-0 mt-2 w-60 z-30 rounded-studio-3 bg-surface-1 dark:bg-surface-d-1 border border-edge-soft dark:border-edge-d-soft shadow-s2 overflow-hidden">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowNewProposalDropdown(false);
                      setShowNewProposalModal(true);
                    }}
                    className="w-full text-left px-3 h-10 studio-text-body hover:bg-surface-2 dark:hover:bg-surface-d-2 transition-colors duration-fast"
                  >
                    Create from scratch
                  </button>
                  <button
                    onClick={() => {
                      setShowNewProposalDropdown(false);
                      setShowMeasurementsModal(true);
                    }}
                    className="w-full text-left px-3 h-10 studio-text-body hover:bg-surface-2 dark:hover:bg-surface-d-2 transition-colors duration-fast"
                  >
                    Create from report
                  </button>
                  <button
                    onClick={() => {
                      setShowNewProposalDropdown(false);
                      setShowTemplateModal(true);
                    }}
                    className="w-full text-left px-3 h-10 studio-text-body hover:bg-surface-2 dark:hover:bg-surface-d-2 transition-colors duration-fast"
                  >
                    Create from template
                  </button>
                  <div className="border-t border-edge-soft dark:border-edge-d-soft my-1" />
                  <button
                    onClick={() => {
                      setShowNewProposalDropdown(false);
                      navigate('ai-generate');
                    }}
                    className="w-full text-left px-3 h-10 studio-text-body text-signal-500 hover:bg-signal-50 dark:hover:bg-signal-500/10 transition-colors duration-fast flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                  </button>
                </div>
              </div>
            )}
          </div>
        }
      />

      <Section className="rounded-studio-3 bg-surface-1 dark:bg-surface-d-1 border border-edge-soft dark:border-edge-d-soft shadow-s1">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'Proposals' && (
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
        )}

        {activeTab === 'Templates' && (
          <TemplatesGrid
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            onCreateTemplate={() => setShowTemplateBuilder(true)}
          />
        )}

        {activeTab === 'Settings' && <SettingsPanel />}
      </Section>

      <Modal
        open={showMeasurementsModal}
        onClose={() => setShowMeasurementsModal(false)}
        title="Measurements"
        description="Select the measurement you would like to use for this proposal"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => { setShowMeasurementsModal(false); setShowNewProposalModal(true); }}
            >
              Create without measurement
            </Button>
            <Button
              variant="primary"
              onClick={() => { setShowMeasurementsModal(false); setShowTemplateModal(true); }}
            >
              Use this measurement
            </Button>
          </>
        }
      >
        <div className="flex-1 flex flex-col gap-4 max-h-[60vh]">
          <Input leadingIcon={<Search />} placeholder="Search all measurement reports" />

          <div className="flex-1 overflow-y-auto scrollbar-studio space-y-2 min-h-0 -mx-1 px-1">
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
              <div key={index} className="flex items-center justify-between gap-3 p-3 rounded-studio-2 border border-edge-soft dark:border-edge-d-soft hover:bg-surface-2 dark:hover:bg-surface-d-2 cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="studio-text-body-strong truncate">{measurement.address}</div>
                  <div className="studio-text-caption text-ink-3 dark:text-ink-d-3 mt-0.5">
                    {measurement.version} BuilderLync Report{measurement.latest ? ' · Latest' : ''}
                  </div>
                  <div className="studio-text-caption text-ink-3 dark:text-ink-d-3">Completed {measurement.date}</div>
                </div>
                <Button variant="quiet" size="sm" leadingIcon={<Download />}>Download</Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={showNewProposalModal}
        onClose={() => setShowNewProposalModal(false)}
        title="New proposal"
        size="md"
        footer={
          <Button
            variant="primary"
            fullWidth
            onClick={() => { setShowNewProposalModal(false); setShowTemplateModal(true); }}
          >
            Continue
          </Button>
        }
      >
        <Field label="Job address">
          {(props) => (
            <Input
              {...props}
              value={proposalAddress}
              onChange={(e) => setProposalAddress(e.target.value)}
              placeholder="Enter address and select"
            />
          )}
        </Field>
      </Modal>

      <Modal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Choose a template"
        description="Pick from one of your existing proposal templates to get started"
        size="lg"
        footer={
          <>
            <Button variant="secondary">Create without template</Button>
            <Button
              variant="primary"
              onClick={() => { setShowTemplateModal(false); setShowProposalEditor(true); }}
            >
              Use this template
            </Button>
          </>
        }
      >
        <div className="flex-1 flex flex-col gap-4 max-h-[60vh]">
          <Input leadingIcon={<Search />} placeholder="Search templates" />

          <div className="flex-1 overflow-y-auto scrollbar-studio space-y-2 min-h-0 -mx-1 px-1">
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
              <button
                key={index}
                type="button"
                className="w-full flex items-center justify-between gap-3 p-3 rounded-studio-2 border border-edge-soft dark:border-edge-d-soft hover:bg-surface-2 dark:hover:bg-surface-d-2 transition-colors duration-fast text-left"
                onClick={() => {
                  setSelectedTemplateId(template);
                  setShowTemplateModal(false);
                  setShowProposalEditor(true);
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="studio-text-body-strong truncate">{template}</div>
                  <div className="studio-text-caption text-ink-3 dark:text-ink-d-3 mt-0.5">Template cover image</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

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
    </PageContainer>
  );
}