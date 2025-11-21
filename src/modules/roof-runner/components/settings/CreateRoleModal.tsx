import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Role, RolePermissions, createRole, updateRole, getDefaultPermissions } from '../../../../shared/store/services/rolesApi';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role?: Role;
  isEdit?: boolean;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  role,
  isEdit = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<RolePermissions>(getDefaultPermissions());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role && isEdit) {
      setName(role.name);
      setDescription(role.description);
      setPermissions(role.permissions);
    } else {
      setName('');
      setDescription('');
      setPermissions(getDefaultPermissions());
    }
  }, [role, isEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      setLoading(true);
      const roleData = {
        name: name.trim(),
        description: description.trim(),
        permissions,
      };

      if (isEdit && role) {
        await updateRole(role.id, roleData);
      } else {
        await createRole(roleData);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (category: keyof RolePermissions, permission: string) => {
    setPermissions((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [permission]: !prev[category][permission as keyof typeof prev[typeof category]],
      },
    }));
  };

  const selectAllInCategory = (category: keyof RolePermissions) => {
    const allSelected = Object.values(permissions[category]).every((v) => v === true);
    const newCategoryPermissions: any = {};
    Object.keys(permissions[category]).forEach((key) => {
      newCategoryPermissions[key] = !allSelected;
    });
    setPermissions((prev) => ({
      ...prev,
      [category]: newCategoryPermissions,
    }));
  };

  const permissionLabels: Record<keyof RolePermissions, { label: string; permissions: Record<string, string> }> = {
    contacts: {
      label: 'Contacts Management',
      permissions: {
        view: 'View contacts',
        create: 'Create contacts',
        edit: 'Edit contacts',
        delete: 'Delete contacts',
        export: 'Export contacts',
      },
    },
    jobs: {
      label: 'Jobs & Projects',
      permissions: {
        view: 'View jobs',
        create: 'Create jobs',
        edit: 'Edit jobs',
        delete: 'Delete jobs',
        manage_status: 'Manage job status',
      },
    },
    financial: {
      label: 'Financial',
      permissions: {
        view_billing: 'View billing',
        manage_billing: 'Manage billing',
        view_payments: 'View payments',
        process_payments: 'Process payments',
        export_data: 'Export financial data',
      },
    },
    staff: {
      label: 'Staff & Roles',
      permissions: {
        view: 'View staff',
        add: 'Add staff',
        edit: 'Edit staff',
        delete: 'Delete staff',
        assign_roles: 'Assign roles',
      },
    },
    system: {
      label: 'System',
      permissions: {
        manage_integrations: 'Manage integrations',
        view_audit_logs: 'View audit logs',
        export_data: 'Export system data',
        manage_brand: 'Manage brand settings',
      },
    },
    communications: {
      label: 'Communications',
      permissions: {
        send_messages: 'Send messages',
        manage_templates: 'Manage email templates',
        view_conversations: 'View conversations',
      },
    },
    marketing: {
      label: 'Marketing',
      permissions: {
        manage_campaigns: 'Manage campaigns',
        view_analytics: 'View analytics',
        manage_automation: 'Manage automation',
      },
    },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Role' : 'Create Role Type'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sales Manager"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this role can do..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Permissions</h3>
              <div className="space-y-6">
                {(Object.keys(permissionLabels) as Array<keyof RolePermissions>).map((category) => {
                  const { label, permissions: categoryPerms } = permissionLabels[category];
                  const allSelected = Object.values(permissions[category]).every((v) => v === true);

                  return (
                    <div key={category} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{label}</h4>
                        <button
                          type="button"
                          onClick={() => selectAllInCategory(category)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {allSelected ? 'Clear All' : 'Select All'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(categoryPerms).map(([key, permLabel]) => (
                          <label
                            key={key}
                            className="flex items-center space-x-3 cursor-pointer group"
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={permissions[category][key as keyof typeof permissions[typeof category]]}
                                onChange={() => togglePermission(category, key)}
                                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700"
                              />
                              {permissions[category][key as keyof typeof permissions[typeof category]] && (
                                <Check className="absolute inset-0 w-5 h-5 text-white pointer-events-none" />
                              )}
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                              {permLabel}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-3 bg-gray-50 dark:bg-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Role' : 'Create Role')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoleModal;
