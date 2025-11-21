import { useState } from 'react';
import Header from '../components/opportunities/Header';
import FiltersAndSort from '../components/opportunities/FiltersAndSort';
import KanbanBoard from '../components/opportunities/KanbanBoard';
import OpportunitiesTable from '../components/opportunities/OpportunitiesTable';
import AddOpportunityModal from '../components/opportunities/AddOpportunityModal';
import ViewEditOpportunityModal from '../components/opportunities/ViewEditOpportunityModal';
import PipelinesList from '../components/opportunities/PipelinesList';
import CreatePipelineModal from '../components/opportunities/CreatePipelineModal';
import EditPipelineModal from '../components/opportunities/EditPipelineModal';

export default function Opportunities() {
  const [activeTab, setActiveTab] = useState('all');
  const [activeView, setActiveView] = useState<'opportunities' | 'pipelines'>('opportunities');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [showCreatePipelineModal, setShowCreatePipelineModal] = useState(false);
  const [showEditPipelineModal, setShowEditPipelineModal] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
  };

  const handlePipelineUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePipelineDeleted = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleEditPipeline = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    setShowEditPipelineModal(true);
  };

  const handleClosePipelineModal = () => {
    setShowEditPipelineModal(false);
    setSelectedPipelineId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddOpportunity={() => setShowAddModal(true)}
        activeView={activeView}
        onViewChange={setActiveView}
        onAddPipeline={() => setShowCreatePipelineModal(true)}
      />
      <main className="flex-grow p-4">
        {activeView === 'opportunities' ? (
          <>
            <FiltersAndSort />
            {activeTab === 'all' ? (
              <KanbanBoard key={refreshKey} />
            ) : (
              <OpportunitiesTable key={refreshKey} onRowClick={handleRowClick} />
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
      />

      <ViewEditOpportunityModal
        isOpen={showViewEditModal}
        opportunityId={selectedOpportunityId}
        onClose={handleModalClose}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
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