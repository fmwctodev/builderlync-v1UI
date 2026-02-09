import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from '../ui/Dialog';
import { Select } from '../ui/Select';
import { PlatformUser, Role } from '../../types';
import { getGlobalRoles } from '../../services/roles-service';
import { ScopeBadge } from './ScopeBadge';

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: PlatformUser;
  onAssigned: (roleId: string | null) => Promise<void>;
}

export const AssignRoleDialog: React.FC<AssignRoleDialogProps> = ({
  open,
  onOpenChange,
  user,
  onAssigned,
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadRoles();
      setSelectedRoleId(user.role_id || null);
    }
  }, [open, user]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await getGlobalRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onAssigned(selectedRoleId);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to assign role:', error);
    } finally {
      setSaving(false);
    }
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <div>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Assign a role to {user.full_name || user.email}
          </DialogDescription>
        </div>
      </DialogHeader>

      <DialogContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <select
                value={selectedRoleId || ''}
                onChange={(e) => setSelectedRoleId(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">No Role</option>
                <optgroup label="Global Roles">
                  {roles
                    .filter(r => r.scope === 'global')
                    .map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                        {role.is_default ? ' (Default)' : ''}
                      </option>
                    ))}
                </optgroup>
                {roles.some(r => r.scope === 'account') && (
                  <optgroup label="Account-Specific Roles">
                    {roles
                      .filter(r => r.scope === 'account')
                      .map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>
            </div>

            {selectedRole && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedRole.name}
                  </span>
                  <ScopeBadge scope={selectedRole.scope} size="sm" />
                </div>
                {selectedRole.description && (
                  <p className="text-sm text-gray-600">{selectedRole.description}</p>
                )}
                {selectedRole.is_default && (
                  <p className="text-xs text-gray-500">This is the default role for new users</p>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>

      <DialogFooter>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          disabled={saving || loading}
        >
          {saving ? 'Assigning...' : 'Assign Role'}
        </button>
      </DialogFooter>
    </Dialog>
  );
};
