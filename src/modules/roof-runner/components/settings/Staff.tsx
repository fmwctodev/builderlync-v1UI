import React, { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { AddEditStaffModal, DeleteConfirmModal } from '../StaffModals';

interface StaffProps {
  userRole?: string;
}

const Staff: React.FC<StaffProps> = ({ userRole = 'Owner' }) => {
  const canManageStaff = userRole === 'Owner' || userRole === 'Admin';
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const { getStaff } = await import('../../../../shared/store/services/staffApi');
      const response = await getStaff(1, 50);
      setStaff(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      setToast({ message: 'Failed to load staff members', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (member: any) => {
    try {
      const { createStaff } = await import('../../../../shared/store/services/staffApi');
      await createStaff({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        extension: member.extension,
        password: member.password || 'defaultPassword123',
        image: member.image
      });
      setToast({ message: 'Staff member added successfully!', type: 'success' });
      setShowAddModal(false);
      fetchStaff();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to add staff member';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  React.useEffect(() => {
    fetchStaff();
  }, []);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Staff Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage team members and their roles</p>
        </div>
        {canManageStaff && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <Plus size={16} />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      {!canManageStaff && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <p className="text-yellow-800 dark:text-yellow-200">Only owners and admins can manage staff.</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No staff members found
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {member.first_name} {member.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{member.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className={`text-primary-600 hover:underline text-sm mr-2 dark:text-primary-400 ${!canManageStaff ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        Edit
                      </button>
                      <button className={`text-red-600 hover:underline text-sm dark:text-red-400 ${!canManageStaff ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditStaffModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddMember}
      />
    </div>
  );
};

export default Staff;