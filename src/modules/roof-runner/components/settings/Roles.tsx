import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Check, X, AlertTriangle } from 'lucide-react';
import { Role, getRoles, deleteRole } from '../../../../shared/store/services/rolesApi';
import CreateRoleModal from './CreateRoleModal';

interface RolesProps {
  userRole?: string;
}

const Roles: React.FC<RolesProps> = ({ userRole = 'Owner' }) => {
  const canManageRoles = userRole === 'Owner';
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await getRoles();
      if (response.success) {
        setRoles(response.data || mockRoles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles(mockRoles);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    fetchRoles();
    setShowCreateModal(false);
    setToast({ message: 'Role created successfully!', type: 'success' });
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const handleUpdateRole = () => {
    fetchRoles();
    setShowEditModal(false);
    setSelectedRole(null);
    setToast({ message: 'Role updated successfully!', type: 'success' });
  };

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      await deleteRole(selectedRole.id);
      setToast({ message: 'Role deleted successfully!', type: 'success' });
      setShowDeleteModal(false);
      setSelectedRole(null);
      fetchRoles();
    } catch (error) {
      setToast({ message: 'Failed to delete role', type: 'error' });
    }
  };

  const countPermissions = (permissions: any): number => {
    let count = 0;
    Object.values(permissions).forEach((category: any) => {
      Object.values(category).forEach((value) => {
        if (value === true) count++;
      });
    });
    return count;
  };

  const getRoleBadgeColor = (roleName: string): string => {
    switch (roleName.toLowerCase()) {
      case 'owner':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'admin':
        return 'bg-primary-100 text-blue-700 dark:bg-primary-900/20 dark:text-primary-400';
      case 'user':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-primary-100 text-primary-700 dark:bg-purple-900/20 dark:text-purple-400';
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Roles & Permissions</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage user roles and access levels</p>
        </div>

        {canManageRoles && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus size={16} />
            <span>Create Role Type</span>
          </button>
        )}
      </div>

      {!canManageRoles && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <p className="text-yellow-800 dark:text-yellow-200">Only account owners can manage roles and permissions.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{role.name}</h3>
                    {role.is_default && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(role.name)}`}>
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{role.description}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Permissions:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {countPermissions(role.permissions)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Staff assigned:</span>
                  <span className="font-medium text-gray-900 dark:text-white flex items-center space-x-1">
                    <Users size={14} />
                    <span>{role.staff_count || 0}</span>
                  </span>
                </div>
              </div>

              {canManageRoles && (
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleEditRole(role)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  {role.is_deletable && (
                    <button
                      onClick={() => handleDeleteClick(role)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateRoleModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateRole}
        />
      )}

      {showEditModal && selectedRole && (
        <CreateRoleModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRole(null);
          }}
          onSuccess={handleUpdateRole}
          role={selectedRole}
          isEdit={true}
        />
      )}

      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Role</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the role "<strong>{selectedRole.name}</strong>"?
              {selectedRole.staff_count && selectedRole.staff_count > 0 && (
                <span className="block mt-2 text-yellow-600 dark:text-yellow-400">
                  Warning: {selectedRole.staff_count} staff member(s) are assigned to this role.
                </span>
              )}
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRole(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRole}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Owner',
    description: 'Full system access with all permissions',
    permissions: {
      contacts: { view: true, create: true, edit: true, delete: true, export: true },
      jobs: { view: true, create: true, edit: true, delete: true, manage_status: true },
      financial: { view_billing: true, manage_billing: true, view_payments: true, process_payments: true, export_data: true },
      staff: { view: true, add: true, edit: true, delete: true, assign_roles: true },
      system: { manage_integrations: true, view_audit_logs: true, export_data: true, manage_brand: true },
      communications: { send_messages: true, manage_templates: true, view_conversations: true },
      marketing: { manage_campaigns: true, view_analytics: true, manage_automation: true },
    },
    is_default: true,
    is_deletable: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    staff_count: 1,
  },
  {
    id: '2',
    name: 'Admin',
    description: 'Manage contacts, jobs, and staff',
    permissions: {
      contacts: { view: true, create: true, edit: true, delete: true, export: false },
      jobs: { view: true, create: true, edit: true, delete: true, manage_status: true },
      financial: { view_billing: false, manage_billing: false, view_payments: true, process_payments: false, export_data: false },
      staff: { view: true, add: true, edit: true, delete: false, assign_roles: false },
      system: { manage_integrations: false, view_audit_logs: false, export_data: false, manage_brand: false },
      communications: { send_messages: true, manage_templates: true, view_conversations: true },
      marketing: { manage_campaigns: true, view_analytics: true, manage_automation: true },
    },
    is_default: true,
    is_deletable: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    staff_count: 3,
  },
  {
    id: '3',
    name: 'User',
    description: 'View contacts, create jobs, and send messages',
    permissions: {
      contacts: { view: true, create: true, edit: false, delete: false, export: false },
      jobs: { view: true, create: true, edit: false, delete: false, manage_status: false },
      financial: { view_billing: false, manage_billing: false, view_payments: false, process_payments: false, export_data: false },
      staff: { view: false, add: false, edit: false, delete: false, assign_roles: false },
      system: { manage_integrations: false, view_audit_logs: false, export_data: false, manage_brand: false },
      communications: { send_messages: true, manage_templates: false, view_conversations: true },
      marketing: { manage_campaigns: false, view_analytics: false, manage_automation: false },
    },
    is_default: true,
    is_deletable: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    staff_count: 5,
  },
];

export default Roles;
