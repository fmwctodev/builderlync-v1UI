import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { RolesTable } from '../components/users/RolesTable';
import { RoleEditorDrawer } from '../components/users/RoleEditorDrawer';
import { Role } from '../types';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  duplicateRole,
  getRoleUserCount,
} from '../services/roles-service';

export const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [scopeFilter, setScopeFilter] = useState<'all' | 'global' | 'account'>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadRoles();
  }, [scopeFilter]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await getRoles({ scope: scopeFilter });
      setRoles(data);

      const counts: Record<string, number> = {};
      for (const role of data) {
        counts[role.id] = await getRoleUserCount(role.id);
      }
      setUserCounts(counts);
    } catch (error) {
      console.error('Failed to load roles:', error);
      showToast('Failed to load roles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = () => {
    setSelectedRole(null);
    setDrawerOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setDrawerOpen(true);
  };

  const handleSave = async (roleData: any) => {
    try {
      if (selectedRole) {
        await updateRole(selectedRole.id, roleData);
        showToast('Role updated successfully');
      } else {
        await createRole(roleData);
        showToast('Role created successfully');
      }
      await loadRoles();
    } catch (error) {
      console.error('Failed to save role:', error);
      showToast('Failed to save role', 'error');
      throw error;
    }
  };

  const handleDuplicate = async (role: Role) => {
    try {
      await duplicateRole(role.id);
      await loadRoles();
      showToast('Role duplicated successfully');
    } catch (error) {
      console.error('Failed to duplicate role:', error);
      showToast('Failed to duplicate role', 'error');
    }
  };

  const handleDelete = async (role: Role) => {
    const userCount = userCounts[role.id] || 0;

    if (userCount > 0) {
      showToast(`Cannot delete role: ${userCount} user(s) are assigned to this role`, 'error');
      return;
    }

    if (role.is_default) {
      showToast('Cannot delete a default role', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return;
    }

    try {
      await deleteRole(role.id);
      await loadRoles();
      showToast('Role deleted successfully');
    } catch (error) {
      console.error('Failed to delete role:', error);
      showToast('Failed to delete role', 'error');
    }
  };

  const filteredRoles = roles;

  if (loading && roles.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600 mt-1">
              Create and manage role templates and permissions
            </p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          <Plus className="w-5 h-5" />
          Create Role
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setScopeFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              scopeFilter === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setScopeFilter('global')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              scopeFilter === 'global'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Global Only
          </button>
          <button
            onClick={() => setScopeFilter('account')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              scopeFilter === 'account'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Account-Specific
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Showing {filteredRoles.length} role{filteredRoles.length !== 1 ? 's' : ''}
        </p>
      </div>

      <Card>
        {filteredRoles.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
            <p className="text-gray-600 mb-4">
              {scopeFilter === 'all'
                ? 'Create your first role to get started'
                : `No ${scopeFilter} roles found`}
            </p>
            {scopeFilter === 'all' && (
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Create Role
              </button>
            )}
          </div>
        ) : (
          <RolesTable
            roles={filteredRoles}
            userCounts={userCounts}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        )}
      </Card>

      <RoleEditorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        role={selectedRole}
        onSave={handleSave}
      />

      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-right ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};
