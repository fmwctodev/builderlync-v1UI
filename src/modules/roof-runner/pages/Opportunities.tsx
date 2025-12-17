import { useState, useEffect } from 'react';
import OpportunitiesHeader from '../components/opportunities/OpportunitiesHeader';
import FiltersAndSort from '../components/opportunities/FiltersAndSort';
import KanbanBoard from '../components/opportunities/KanbanBoard';
import OpportunitiesTable from '../components/opportunities/OpportunitiesTable';
import AddOpportunityModal from '../components/opportunities/AddOpportunityModal';
import ViewEditOpportunityModal from '../components/opportunities/ViewEditOpportunityModal';
import PipelinesList from '../components/opportunities/PipelinesList';
import CreatePipelineModal from '../components/opportunities/CreatePipelineModal';
import EditPipelineModal from '../components/opportunities/EditPipelineModal';
import { embeddedPipelinesService } from '../services/embeddedPipelinesService';
import type { JobType } from '../types/opportunities';

export default function Opportunities() {
  const [activeTab, setActiveTab] = useState('all');
  const [activeView, setActiveView] = useState<'opportunities' | 'pipelines'>('opportunities');
  const [internalView, setInternalView] = useState<'board' | 'list' | 'settings'>('board');
  const [selectedJobType, setSelectedJobType] = useState<JobType | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [showCreatePipelineModal, setShowCreatePipelineModal] = useState(false);
  const [showEditPipelineModal, setShowEditPipelineModal] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    embeddedPipelinesService.ensureEmbeddedPipelinesExist();
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
      <OpportunitiesHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedJobType={selectedJobType}
        setSelectedJobType={setSelectedJobType}
        onAddOpportunity={() => setShowAddModal(true)}
        activeView={activeView}
        onViewChange={setActiveView}
        onAddPipeline={() => setShowCreatePipelineModal(true)}
        internalView={internalView}
        onInternalViewChange={setInternalView}
      />
      <main className="flex-grow p-4">
        {activeView === 'opportunities' ? (
          <>
            {internalView === 'board' && (
              <KanbanBoard key={refreshKey} selectedJobType={selectedJobType} />
            )}
            {internalView === 'list' && (
              <>
                <FiltersAndSort />
                <OpportunitiesTable key={refreshKey} selectedJobType={selectedJobType} onRowClick={handleRowClick} />
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
        defaultJobType={selectedJobType === 'all' ? 'Commercial' : selectedJobType}
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