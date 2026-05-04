import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield } from 'lucide-react';
import { StaffManagement } from './StaffManagement';
import { RolesManagement } from './RolesManagement';

interface SuperAdminStaffManagementProps {
  initialTab?: 'staff' | 'roles';
}

export const SuperAdminStaffManagement: React.FC<SuperAdminStaffManagementProps> = ({ initialTab = 'staff' }) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'roles'>(initialTab);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => navigate('/super-admin/settings/staff')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'staff'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users size={16} />
              <span>My Staff</span>
            </div>
          </button>
          <button
            onClick={() => navigate('/super-admin/settings/roles')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'roles'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
        {activeTab === 'staff' && <StaffManagement />}
        {activeTab === 'roles' && <RolesManagement />}
      </div>
    </div>
  );
};
