import { useState } from 'react';
import Header from '../components/opportunities/Header';
import FiltersAndSort from '../components/opportunities/FiltersAndSort';
import KanbanBoard from '../components/opportunities/KanbanBoard';
import OpportunitiesTable from '../components/opportunities/OpportunitiesTable';
import AddOpportunityModal from '../components/opportunities/AddOpportunityModal';
import ViewEditOpportunityModal from '../components/opportunities/ViewEditOpportunityModal';

export default function Opportunities() {
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddOpportunity={() => setShowAddModal(true)}
      />
      <main className="flex-grow p-4">
        <FiltersAndSort />
        {activeTab === 'all' ? (
          <KanbanBoard key={refreshKey} />
        ) : (
          <OpportunitiesTable key={refreshKey} onRowClick={handleRowClick} />
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
    </div>
  );
}