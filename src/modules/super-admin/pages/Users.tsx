import React, { useEffect, useMemo, useState } from 'react';
import {
  Users as UsersIcon,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  CheckCircle,
  Mail,
  RefreshCw,
  Edit2,
  X,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  userType: 'user' | 'staff' | 'admin';
  isVerified: boolean;
  isBlocked: boolean;
  status?: 'active' | 'invited' | 'disabled';
  createdAt: string;
  lastActiveAt?: string | null;
  companyName: string | null;
  companySlug: string | null;
  parentId: number | null;
  roleId: string | number | null;
  parent: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    companyName: string | null;
  } | null;
  role: {
    id: string | number;
    name: string;
    description: string | null;
  } | null;
}

interface RoleOption {
  id: string | number;
  name: string;
  description?: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const Users: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'user' | 'staff' | 'admin'>('user');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'invited' | 'disabled'>('all');
  const [accountFilter, setAccountFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionUserId, setActionUserId] = useState<number | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resolveStatus = (user: User): 'active' | 'invited' | 'disabled' => {
    if (user.status) return user.status;
    if (user.isBlocked) return 'disabled';
    if (!user.isVerified) return 'invited';
    return 'active';
  };

  const getUserTypeBadge = (type: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      user: 'bg-blue-100 text-blue-800',
      staff: 'bg-green-100 text-green-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      invited: 'bg-yellow-100 text-yellow-800',
      disabled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const fetchUsers = async (page: number = 1) => {
    setLoading(true);
    setError('');

    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        setError('Not authenticated');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.append('search', search);
      if (userTypeFilter !== 'all') params.append('userType', userTypeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/admin/users?${params}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || 'Failed to fetch users');
        return;
      }

      setUsers(result.data.data);
      setPagination(result.data.pagination);
    } catch (err: any) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    setRoleLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        setRoleOptions([]);
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/roles`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const result = await response.json();
      const roles = result?.data?.data || result?.data || [];
      setRoleOptions(Array.isArray(roles) ? roles : []);
    } catch (err) {
      setRoleOptions([]);
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [userTypeFilter, statusFilter, search, accountFilter]);

  useEffect(() => {
    if (userTypeFilter !== 'staff') {
      setRoleFilter('');
    }
  }, [userTypeFilter]);

  useEffect(() => {
    if (userTypeFilter === 'staff' && roleOptions.length === 0) {
      loadRoles();
    }
  }, [userTypeFilter, roleOptions.length]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleStatusChange = async (user: User, status: 'active' | 'disabled') => {
    setActionUserId(user.id);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/admin/users/${user.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.message || 'Failed to update user status');
        return;
      }

      setUsers(users.map(u => u.id === user.id ? { ...u, status } : u));
      showToast(`User ${status === 'disabled' ? 'disabled' : 'activated'} successfully`);
    } catch (err: any) {
      setError('Failed to update user status');
    } finally {
      setActionUserId(null);
    }
  };

  const handleResendInvite = async (user: User) => {
    setActionUserId(user.id);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/admin/users/${user.id}/resend-invite`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.message || 'Failed to resend invite');
        return;
      }
      showToast('Invite resent successfully');
    } catch (err: any) {
      setError('Failed to resend invite');
    } finally {
      setActionUserId(null);
    }
  };

  const openRoleModal = async (user: User) => {
    setRoleModalUser(user);
    setSelectedRoleId(user.role?.id ? String(user.role.id) : '');
    setRoleModalOpen(true);
    if (roleOptions.length === 0) {
      await loadRoles();
    }
  };

  const handleRoleChange = async () => {
    if (!roleModalUser) return;
    setRoleLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/admin/users/${roleModalUser.id}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ roleId: selectedRoleId || null }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.message || 'Failed to update user role');
        return;
      }

      const newRole = roleOptions.find(r => String(r.id) === selectedRoleId) || null;
      setUsers(users.map(u => u.id === roleModalUser.id ? {
        ...u,
        roleId: selectedRoleId || null,
        role: newRole ? { id: newRole.id, name: newRole.name, description: newRole.description || null } : null
      } : u));

      showToast('Role updated successfully');
      setRoleModalOpen(false);
    } catch (err: any) {
      setError('Failed to update user role');
    } finally {
      setRoleLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (roleFilter) {
      filtered = filtered.filter(u => u.role?.id ? String(u.role.id) === roleFilter : false);
    }
    if (accountFilter.trim()) {
      const match = accountFilter.trim().toLowerCase();
      filtered = filtered.filter(u => {
        const companyName = (u.companyName || '').toLowerCase();
        const companySlug = (u.companySlug || '').toLowerCase();
        return companyName.includes(match) || companySlug.includes(match);
      });
    }
    return filtered;
  }, [users, roleFilter, accountFilter]);

  const userTypeTabs: Array<{ value: 'user' | 'staff' | 'admin'; label: string }> = [
    { value: 'user', label: 'Users' },
    { value: 'staff', label: 'Staff' },
    { value: 'admin', label: 'Admins' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <UsersIcon className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          </div>
          <p className="text-gray-600">Manage all users in the system</p>
        </div>
        <button
          disabled
          title="Sync endpoint not available yet"
          className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg flex items-center gap-2 cursor-not-allowed"
        >
          <RefreshCw className="w-4 h-4" />
          Sync Users
        </button>
      </div>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        {userTypeTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setUserTypeFilter(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              userTypeFilter === tab.value
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="disabled">Disabled</option>
            </select>

            {userTypeFilter === 'staff' && (
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              >
                <option value="">All Roles</option>
                {roleOptions.map((role) => (
                  <option key={role.id} value={String(role.id)}>
                    {role.name}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              placeholder="Account (company name or slug)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Filter className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center p-12">
            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    {userTypeFilter === 'staff' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const status = resolveStatus(user);
                    const companyName = user.userType === 'staff' && user.parent
                      ? user.parent.companyName || '-'
                      : user.companyName || '-';
                    const companySlug = user.companySlug;
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-red-600 font-semibold">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="mt-1">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserTypeBadge(
                                    user.userType
                                  )}`}
                                >
                                  {user.userType}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        {userTypeFilter === 'staff' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {user.role?.name || 'No Role'}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {companySlug ? (
                            <Link
                              to={`/super-admin/accounts/${companySlug}`}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              {companyName}
                            </Link>
                          ) : (
                            <div className="text-sm text-gray-900">{companyName}</div>
                          )}
                          {companySlug && (
                            <div className="text-xs text-gray-500">{companySlug}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/super-admin/users/${user.id}`)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              title="View Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/super-admin/users/${user.id}/import`)}
                              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                              title="Import Data"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/super-admin/users/${user.id}/import/custom-jobs`)}
                              className="text-amber-600 hover:text-amber-800 flex items-center gap-1"
                              title="Import Custom Jobs"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                            </button>
                            {user.userType === 'staff' && (
                              <button
                                onClick={() => openRoleModal(user)}
                                className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                                title="Change Role"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleStatusChange(user, status === 'disabled' ? 'active' : 'disabled')}
                              disabled={actionUserId === user.id}
                              className={`flex items-center gap-1 ${
                                status === 'disabled'
                                  ? 'text-green-600 hover:text-green-800'
                                  : 'text-red-600 hover:text-red-800'
                              } disabled:opacity-50`}
                              title={status === 'disabled' ? 'Activate User' : 'Disable User'}
                            >
                              {actionUserId === user.id ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : status === 'disabled' ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </button>
                            {status === 'invited' && (
                              <button
                                onClick={() => handleResendInvite(user)}
                                disabled={actionUserId === user.id}
                                className="text-gray-600 hover:text-gray-800 flex items-center gap-1 disabled:opacity-50"
                                title="Resend Invite"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchUsers(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => fetchUsers(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {roleModalOpen && roleModalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Change Role</h3>
              <button onClick={() => setRoleModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-sm text-gray-500">User</div>
                <div className="text-sm font-medium text-gray-900">
                  {roleModalUser.firstName} {roleModalUser.lastName}
                </div>
                <div className="text-xs text-gray-500">{roleModalUser.email}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">No Role</option>
                  {roleOptions.map((role) => (
                    <option key={role.id} value={String(role.id)}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              {roleLoading && (
                <div className="text-sm text-gray-500">Loading roles...</div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setRoleModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChange}
                  disabled={roleLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
