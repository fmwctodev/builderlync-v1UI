import React, { useState } from 'react';
import { Users, Shield } from 'lucide-react';
import Staff from './Staff';
import Roles from './Roles';

interface StaffManagementProps {
  userRole?: string;
  initialTab?: 'staff' | 'roles';
}

const StaffManagement: React.FC<StaffManagementProps> = ({ userRole = 'Owner', initialTab = 'staff' }) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'roles'>(initialTab);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'staff'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users size={16} />
              <span>My Staff</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'roles'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Shield size={16} />
              <span>Roles</span>
            </div>
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'staff' && <Staff userRole={userRole} />}
        {activeTab === 'roles' && <Roles userRole={userRole} />}
      </div>
    </div>
  );
};

export default StaffManagement;
