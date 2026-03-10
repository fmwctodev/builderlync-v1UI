import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Edit2, Trash2, Users } from 'lucide-react';
import { getRoleTemplates, getSuperAdminRoles, deleteRole, countPermissions } from '../../services/settings-roles-service';
import { SuperAdminRoleTemplate, SuperAdminRole } from '../../types/settings';
import { CreateRoleModal } from './CreateRoleModal';
import {
  countSuperAdminPermissions,
  getSuperAdminRoleTemplateBadgeColor
} from '../../constants/superAdminRoleTemplates';

export const RolesManagement: React.FC = () => {
  const [templates, setTemplates] = useState<SuperAdminRoleTemplate[]>([]);
  const [roles, setRoles] = useState<SuperAdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SuperAdminRoleTemplate | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadData = async () => {
    setLoading(true);
    try {
      const templatesRes = await getRoleTemplates();
      if (templatesRes.success && templatesRes.data) {
        setTemplates(templatesRes.data);
      } else {
        setTemplates([]);
      }

      const rolesRes = await getSuperAdminRoles();
      console.log(JSON.stringify(rolesRes, null, 2));
      if (rolesRes.success && rolesRes.data) {
        setRoles(rolesRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setToast({ message: 'Failed to load roles', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template: SuperAdminRoleTemplate) => {
    setSelectedTemplate(template);
    setShowCreateModal(true);
  };

  const handleDeleteRole = async (role: SuperAdminRole) => {
    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return;
    }

    try {
      const response = await deleteRole(role.id);
      if (response.success) {
        setToast({ message: 'Role deleted successfully', type: 'success' });
        loadData();
      } else {
        setToast({ message: response.error || 'Failed to delete role', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      setToast({ message: 'Failed to delete role', type: 'error' });
    }
  };

  const getRoleBadgeColor = (roleName: string): string => {
    if (roleName.toLowerCase().includes('admin')) {
      return 'bg-red-100 text-red-700';
    }
    if (roleName.toLowerCase().includes('support')) {
      return 'bg-red-100 text-red-700';
    }
    if (roleName.toLowerCase().includes('sales')) {
      return 'bg-green-100 text-green-700';
    }
    if (roleName.toLowerCase().includes('developer')) {
      return 'bg-red-100 text-red-700';
    }
    if (roleName.toLowerCase().includes('accounting')) {
      return 'bg-yellow-100 text-yellow-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Sparkles size={20} className="text-red-600" />
            <span>Available Role Templates</span>
          </h3>
          <p className="text-sm text-gray-600">
            Quick-start templates based on common roles. Click to view permissions or create a role from template.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template) => (
            (() => {
              const idealFor = Array.isArray((template as any).ideal_for)
                ? (template as any).ideal_for
                : ['General'];

              return (
            <div
              key={template.id}
              className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200 hover:border-red-300 transition-colors"
            >
              <div className="mb-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSuperAdminRoleTemplateBadgeColor(template.name)}`}>
                  Template
                </span>
              </div>

              <h4 className="text-sm font-semibold text-gray-900 mb-2 break-words">{template.name}</h4>
              <p className="text-xs text-gray-600 mb-3 break-words">{template.description}</p>

              <div className="text-xs text-gray-500 mb-3 break-words">
                <strong>Ideal for:</strong> {idealFor.join(', ')}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                <span>Permissions:</span>
                <span className="font-medium">{countSuperAdminPermissions(template.permissions)}</span>
              </div>

              <button
                onClick={() => handleUseTemplate(template)}
                className="w-full px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
              >
                Use Template
              </button>
            </div>
              );
            })()
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Active Roles</h3>
            <p className="text-sm text-gray-600">
              Roles created for your organization. Assign these to staff members.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setShowCreateModal(true);
            }}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus size={16} />
            <span>Create Role Type</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No active roles yet. Create a role from a template to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 break-words">{role.name}</h3>
                      {!role.is_custom && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSuperAdminRoleTemplateBadgeColor(role.name)}`}>
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3 break-words">{role.description}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Permissions:</span>
                    <span className="font-medium text-gray-900">
                      {countPermissions(role.permissions)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Staff assigned:</span>
                    <span className="font-medium text-gray-900 flex items-center space-x-1">
                      <Users size={14} />
                      <span>{role.staff_count || 0}</span>
                    </span>
                  </div>
                </div>

                {role.is_deletable && (
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleDeleteRole(role)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateRoleModal
          template={selectedTemplate}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
          onSuccess={() => {
            setToast({ message: 'Role created successfully', type: 'success' });
            loadData();
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};
