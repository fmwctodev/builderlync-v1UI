import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createSuperAdminStaff } from '../../services/staff-service';
import { getRoleTemplates, getSuperAdminRoles, createRoleFromTemplate } from '../../services/settings-roles-service';
import { SuperAdminRoleTemplate, SuperAdminRole } from '../../types/settings';

interface AddStaffModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role_id: '',
    send_invitation: true,
  });
  const [templates, setTemplates] = useState<SuperAdminRoleTemplate[]>([]);
  const [roles, setRoles] = useState<SuperAdminRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRolesAndTemplates();
  }, []);

  const loadRolesAndTemplates = async () => {
    const [templatesRes, rolesRes] = await Promise.all([
      getRoleTemplates(),
      getSuperAdminRoles(),
    ]);

    if (templatesRes.success && templatesRes.data) {
      setTemplates(templatesRes.data);
    }
    if (rolesRes.success && rolesRes.data) {
      setRoles(rolesRes.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let roleId = formData.role_id;

      if (roleId.startsWith('template:')) {
        const templateId = roleId.replace('template:', '');
        const roleResponse = await createRoleFromTemplate(templateId);
        if (roleResponse.success && roleResponse.data) {
          roleId = roleResponse.data.id;
        }
      }

      const response = await createSuperAdminStaff({
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        role_id: roleId,
        send_invitation: formData.send_invitation,
      });

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to create staff member');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Add New Staff Member</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Role
            </label>
            <select
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select a role...</option>
              {roles.length > 0 && (
                <optgroup label="Active Roles">
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Role Templates">
                {templates.map((template) => (
                  <option key={template.id} value={`template:${template.id}`}>
                    {template.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="send_invitation"
              checked={formData.send_invitation}
              onChange={(e) => setFormData({ ...formData, send_invitation: e.target.checked })}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="send_invitation" className="ml-2 block text-sm text-gray-700">
              Send invitation email to new staff member
            </label>
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
              {loading ? 'Adding...' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
