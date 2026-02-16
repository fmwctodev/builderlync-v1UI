import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OpportunitiesHeader from '../components/opportunities/OpportunitiesHeader';
import FiltersAndSort from '../components/opportunities/FiltersAndSort';
import KanbanBoard from '../components/opportunities/KanbanBoard';
import OpportunitiesTable from '../components/opportunities/OpportunitiesTable';
import AddOpportunityModal from '../components/opportunities/AddOpportunityModal';
import ViewEditOpportunityModal from '../components/opportunities/ViewEditOpportunityModal';
import PipelinesList from '../components/opportunities/PipelinesList';
import CreatePipelineModal from '../components/opportunities/CreatePipelineModal';
import EditPipelineModal from '../components/opportunities/EditPipelineModal';
import type { OpportunityWithDetails } from '../types/opportunities';

export default function Opportunities() {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';
  const [activeView, setActiveView] = useState<'opportunities' | 'pipelines'>('opportunities');
  const [internalView, setInternalView] = useState<'board' | 'list' | 'settings'>('board');
  const [activeTab, setActiveTab] = useState<string>('opportunities');

  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>('default');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [showCreatePipelineModal, setShowCreatePipelineModal] = useState(false);
  const [showEditPipelineModal, setShowEditPipelineModal] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Removed embedded pipelines service call
  }, []);

  const handleOpportunityAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleRowClick = (opportunityId: string) => {
    setSelectedOpportunityId(opportunityId);
    setShowViewEditModal(true);
  };

  const handleModalClose = () => {
    setShowViewEditModal(false);
    setSelectedOpportunityId(null);
  };

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDelete = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePipelineCreated = () => {
    setRefreshKey(prev => prev + 1);
    // Reload pipelines in header
    window.dispatchEvent(new Event('reload-pipelines'));
  };

  const handlePipelineUpdated = () => {
    setRefreshKey(prev => prev + 1);
    // Reload pipelines in header
    window.dispatchEvent(new Event('reload-pipelines'));
  };

  const handlePipelineDeleted = () => {
    setRefreshKey(prev => prev + 1);
    // Reload pipelines in header and reset selection
    setSelectedPipelineId('default');
    window.dispatchEvent(new Event('reload-pipelines'));
  };

  const handleEditPipeline = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    setShowEditPipelineModal(true);
  };

  const handleClosePipelineModal = () => {
    setShowEditPipelineModal(false);
    setSelectedPipelineId(null);
  };

  const handleCreateJob = (opportunity: OpportunityWithDetails) => {
    // Navigate to jobs page with opportunity data
    navigate(`${orgPrefix}/jobs`, {
      state: {
        createFromOpportunity: true,
        opportunityData: opportunity
      }
    });
    setShowViewEditModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <OpportunitiesHeader
        selectedPipelineId={selectedPipelineId}
        setSelectedPipelineId={setSelectedPipelineId}
        onAddOpportunity={() => setShowAddModal(true)}
        activeView={activeView}
        onViewChange={setActiveView}
        onAddPipeline={() => setShowCreatePipelineModal(true)}
        internalView={internalView}
        onInternalViewChange={setInternalView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main className="flex-grow p-4">
        {activeView === 'opportunities' ? (
          <>
            {internalView === 'board' && (
              <KanbanBoard key={refreshKey} selectedPipelineId={selectedPipelineId} />
            )}
            {internalView === 'list' && (
              <>
                <FiltersAndSort />
                <OpportunitiesTable
                  key={refreshKey}
                  onRowClick={handleRowClick}
                  selectedPipelineId={selectedPipelineId}
                />
              </>
            )}
            {internalView === 'settings' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Opportunities Settings</h2>
                <p className="text-gray-600 dark:text-gray-400">Settings panel coming soon...</p>
              </div>
            )}
          </>
        ) : (
          <PipelinesList
            onEdit={handleEditPipeline}
            onDelete={handlePipelineDeleted}
            refreshKey={refreshKey}
          />
        )}
      </main>

      <AddOpportunityModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleOpportunityAdded}
        defaultJobType="Commercial"
        selectedPipelineId={selectedPipelineId}
      />

      <ViewEditOpportunityModal
        isOpen={showViewEditModal}
        opportunityId={selectedOpportunityId}
        onClose={handleModalClose}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onCreateJob={handleCreateJob}
      />

      <CreatePipelineModal
        isOpen={showCreatePipelineModal}
        onClose={() => setShowCreatePipelineModal(false)}
        onSuccess={handlePipelineCreated}
      />

      <EditPipelineModal
        isOpen={showEditPipelineModal}
        pipelineId={selectedPipelineId}
        onClose={handleClosePipelineModal}
        onSuccess={handlePipelineUpdated}
      />
    </div>
  );
}