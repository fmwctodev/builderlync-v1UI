import React, { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { CompanyList } from '../components/ContactProfile/CompanyList';
import { AddCompanyModal } from '../components/ContactProfile/Modals/AddCompanyModal';

const Companies: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCompanyAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Building2 className="w-8 h-8 text-primary-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </button>
      </div>

      <CompanyList refreshTrigger={refreshKey} />

      <AddCompanyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCompanyAdded}
      />
    </div>
  );
};

export default Companies;