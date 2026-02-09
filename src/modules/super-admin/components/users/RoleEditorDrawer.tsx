import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { PermissionsMatrixEditor } from './PermissionsMatrixEditor';
import { Role, RoleScope, RolePermissions } from '../../types';
import { DEFAULT_PERMISSIONS } from '../../services/roles-service';

interface RoleEditorDrawerProps {
  open: boolean;
  onClose: () => void;
  role?: Role | null;
  onSave: (roleData: any) => Promise<void>;
}

export const RoleEditorDrawer: React.FC<RoleEditorDrawerProps> = ({
  open,
  onClose,
  role,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scope: 'global' as RoleScope,
    account_id: null as string | null,
    is_default: false,
    permissions: { ...DEFAULT_PERMISSIONS } as RolePermissions,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (role) {
        setFormData({
          name: role.name,
          description: role.description || '',
          scope: role.scope,
          account_id: role.account_id || null,
          is_default: role.is_default,
          permissions: role.permissions,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          scope: 'global',
          account_id: null,
          is_default: false,
          permissions: { ...DEFAULT_PERMISSIONS },
        });
      }
      setErrors({});
    }
  }, [open, role]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }

    if (formData.scope === 'account' && !formData.account_id) {
      newErrors.account_id = 'Account is required for account-scoped roles';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save role:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {role ? 'Edit Role' : 'Create New Role'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {role ? 'Update role details and permissions' : 'Define a new role template with permissions'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Input
            label="Role Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            placeholder="e.g., Project Manager"
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what this role can do..."
            rows={3}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scope
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="global"
                  checked={formData.scope === 'global'}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value as RoleScope })}
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">Global Template</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="account"
                  checked={formData.scope === 'account'}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value as RoleScope })}
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">Account-Specific</span>
              </label>
            </div>
            {formData.scope === 'global' && (
              <p className="text-xs text-gray-500 mt-1">
                Available to all accounts as a template
              </p>
            )}
            {formData.scope === 'account' && (
              <p className="text-xs text-gray-500 mt-1">
                Custom role for a specific account (account selection not yet implemented)
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
            />
            <label htmlFor="is_default" className="text-sm text-gray-700">
              Set as default role for new users
            </label>
          </div>

          <PermissionsMatrixEditor
            permissions={formData.permissions}
            onChange={(permissions) => setFormData({ ...formData, permissions })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : role ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
