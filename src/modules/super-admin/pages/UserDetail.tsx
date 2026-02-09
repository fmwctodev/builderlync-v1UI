import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Ban, CheckCircle, ExternalLink } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { UserStatusBadge } from '../components/users/UserStatusBadge';
import { ScopeBadge } from '../components/users/ScopeBadge';
import { PermissionBadge } from '../components/users/PermissionBadge';
import { AssignRoleDialog } from '../components/users/AssignRoleDialog';
import { PlatformUser, PermissionLevel } from '../types';
import { getUserById, changeUserStatus, changeUserRole } from '../services/users-service';
import { MODULES } from '../services/roles-service';

export const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const data = await getUserById(userId);
      setUser(data);
    } catch (error) {
      console.error('Failed to load user:', error);
      showToast('Failed to load user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChangeStatus = async () => {
    if (!user) return;

    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'disable';

    if (!window.confirm(`Are you sure you want to ${action} ${user.full_name || user.email}?`)) {
      return;
    }

    try {
      await changeUserStatus(user.id, newStatus);
      await loadUser();
      showToast(`User ${action}d successfully`);
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      showToast(`Failed to ${action} user`, 'error');
    }
  };

  const handleRoleAssigned = async (roleId: string | null) => {
    if (!user) return;

    try {
      await changeUserRole(user.id, roleId);
      await loadUser();
      showToast('Role assigned successfully');
    } catch (error) {
      console.error('Failed to assign role:', error);
      showToast('Failed to assign role', 'error');
    }
  };

  const formatDate = (date?: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
        <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/super-admin/users')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <button
          onClick={() => navigate('/super-admin/users')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Users</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {user.full_name || 'Unnamed User'}
              </h1>
              <UserStatusBadge status={user.status} size="md" />
            </div>
            <p className="text-gray-600">{user.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRoleDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit2 className="w-4 h-4" />
              Change Role
            </button>
            {user.status === 'active' ? (
              <button
                onClick={handleChangeStatus}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                <Ban className="w-4 h-4" />
                Disable User
              </button>
            ) : (
              <button
                onClick={handleChangeStatus}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Activate User
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Profile Information">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-sm text-gray-900 mt-1">{user.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900 mt-1">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <UserStatusBadge status={user.status} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(user.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Login</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(user.last_login_at)}</p>
                </div>
                {user.status === 'invited' && user.invited_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Invited</label>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(user.invited_at)}</p>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Account Information">
              {user.account ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Account Name</label>
                    <p className="text-sm text-gray-900 mt-1">{user.account.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Plan</label>
                    <p className="text-sm text-gray-900 mt-1 capitalize">{user.account.plan}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <p className="text-sm text-gray-900 mt-1 capitalize">{user.account.status}</p>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => navigate(`/super-admin/accounts/${user.account_id}`)}
                      className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Open Account Details
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No account information available</p>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Role & Permissions">
              {user.role ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Current Role</label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-semibold text-gray-900">{user.role.name}</p>
                      <ScopeBadge scope={user.role.scope} size="sm" />
                    </div>
                    {user.role.description && (
                      <p className="text-xs text-gray-600 mt-1">{user.role.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                      Module Permissions
                    </label>
                    <div className="space-y-2">
                      {MODULES.map(module => {
                        const level = (user.role!.permissions[module.key] || 'none') as PermissionLevel;
                        return (
                          <div key={module.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <span className="text-sm text-gray-700">{module.label}</span>
                            <PermissionBadge level={level} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No role assigned</p>
              )}
            </Card>

            <Card title="Security Activity">
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-700">Last Login</p>
                  <p className="text-gray-600 mt-1">{formatDate(user.last_login_at)}</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-700">Account Created</p>
                  <p className="text-gray-600 mt-1">{formatDate(user.created_at)}</p>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Full login history and security events will be available when audit logging is implemented.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AssignRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        user={user}
        onAssigned={handleRoleAssigned}
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
