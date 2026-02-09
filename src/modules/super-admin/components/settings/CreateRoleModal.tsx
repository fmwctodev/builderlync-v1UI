import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createRole, createRoleFromTemplate } from '../../services/settings-roles-service';
import { SuperAdminRoleTemplate, SuperAdminPermissions } from '../../types/settings';

interface CreateRoleModalProps {
  template: SuperAdminRoleTemplate | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ template, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (template) {
        const response = await createRoleFromTemplate(template.id, formData.name);
        if (!response.success) {
          throw new Error(response.error);
        }
      } else {
        const defaultPermissions: SuperAdminPermissions = {
          overview: { view: false, export: false },
          accounts: { view: false, create: false, edit: false, delete: false, manage_billing: false, suspend: false },
          users: { view: false, create: false, edit: false, delete: false, manage_roles: false, impersonate: false },
          billing: { view: false, edit_plans: false, process_payments: false, refunds: false, export: false },
          usage: { view: false, edit_limits: false, export: false },
          features: { view: false, toggle_flags: false, manage_overrides: false },
          integrations: { view: false, manage: false, view_health: false, test_connections: false },
          security: { view_audit: false, manage_permissions: false, view_sessions: false, force_logout: false },
          support: { view: false, create: false, edit: false, close: false, assign: false, manage_feedback: false },
          system: { view_health: false, manage_settings: false, view_logs: false, deploy: false },
          settings: { view: false, manage_staff: false, manage_roles: false, system_config: false },
        };

        const response = await createRole({
          name: formData.name,
          description: formData.description,
          permissions: defaultPermissions,
          is_custom: true,
        });

        if (!response.success) {
          throw new Error(response.error);
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {template ? `Create Role from "${template.name}"` : 'Create Custom Role'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {template && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                This role will be created with all permissions from the "{template.name}" template.
                You can customize the permissions after creation.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="e.g., Senior Support Specialist"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Describe the responsibilities and access level for this role..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
