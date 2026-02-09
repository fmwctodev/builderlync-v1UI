import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { UserFilters } from '../components/users/UserFilters';
import { UsersTable } from '../components/users/UsersTable';
import { AssignRoleDialog } from '../components/users/AssignRoleDialog';
import { PlatformUser } from '../types';
import { getUsers, changeUserStatus, changeUserRole, resendInvite, syncAllUsers } from '../services/users-service';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadUsers();
  }, [searchQuery, statusFilter, roleFilter, accountFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        roleId: roleFilter !== 'all' ? roleFilter : undefined,
        accountId: accountFilter !== 'all' ? accountFilter : undefined,
      });
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChangeRole = (user: PlatformUser) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };

  const handleRoleAssigned = async (roleId: string | null) => {
    if (!selectedUser) return;

    try {
      await changeUserRole(selectedUser.id, roleId);
      await loadUsers();
      showToast('Role assigned successfully');
    } catch (error) {
      console.error('Failed to assign role:', error);
      showToast('Failed to assign role', 'error');
    }
  };

  const handleChangeStatus = async (user: PlatformUser, status: 'active' | 'disabled') => {
    const action = status === 'active' ? 'activate' : 'disable';
    if (!window.confirm(`Are you sure you want to ${action} ${user.full_name || user.email}?`)) {
      return;
    }

    try {
      await changeUserStatus(user.id, status);
      await loadUsers();
      showToast(`User ${action}d successfully`);
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      showToast(`Failed to ${action} user`, 'error');
    }
  };

  const handleResendInvite = async (user: PlatformUser) => {
    try {
      await resendInvite(user.id);
      showToast('Invite resent successfully (email would be sent in production)');
    } catch (error) {
      console.error('Failed to resend invite:', error);
      showToast('Failed to resend invite', 'error');
    }
  };

  const handleSyncUsers = async () => {
    setSyncing(true);
    try {
      const result = await syncAllUsers();

      if (!result.success) {
        throw new Error(result.error || 'Sync failed');
      }

      await loadUsers();

      const message = `Sync complete: ${result.created || 0} created, ${result.updated || 0} updated${result.skipped ? `, ${result.skipped} skipped` : ''}${result.errors ? `, ${result.errors} errors` : ''}`;
      showToast(message);
    } catch (error) {
      console.error('Failed to sync users:', error);
      showToast('Failed to sync users', 'error');
    } finally {
      setSyncing(false);
    }
  };

  if (loading && users.length === 0) {
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
          <UsersIcon className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users & Roles</h1>
            <p className="text-gray-600 mt-1">
              Manage platform users across all accounts
            </p>
          </div>
        </div>
        <button
          onClick={handleSyncUsers}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          title="Sync all organization members to platform users"
        >
          <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Users'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {users.length} users
        </p>
      </div>

      <UserFilters
        search={searchQuery}
        status={statusFilter}
        roleId={roleFilter}
        accountId={accountFilter}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onRoleChange={setRoleFilter}
        onAccountChange={setAccountFilter}
      />

      <Card>
        <UsersTable
          users={users}
          onChangeRole={handleChangeRole}
          onChangeStatus={handleChangeStatus}
          onResendInvite={handleResendInvite}
        />
      </Card>

      {selectedUser && (
        <AssignRoleDialog
          open={roleDialogOpen}
          onOpenChange={setRoleDialogOpen}
          user={selectedUser}
          onAssigned={handleRoleAssigned}
        />
      )}

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
