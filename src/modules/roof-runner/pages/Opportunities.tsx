import { useState } from 'react';
import Header from '../components/opportunities/Header';
import FiltersAndSort from '../components/opportunities/FiltersAndSort';
import KanbanBoard from '../components/opportunities/KanbanBoard';
import OpportunitiesTable from '../components/opportunities/OpportunitiesTable';

export default function Opportunities() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-grow p-4">
        <FiltersAndSort />
        {activeTab === 'all' ? <KanbanBoard /> : <OpportunitiesTable />}
      </main>
    </div>
  );
}