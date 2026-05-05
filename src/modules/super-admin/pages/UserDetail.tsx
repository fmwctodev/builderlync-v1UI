import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Building2, User as UserIcon, Shield, Ban, CheckCircle, Send, Trash2 } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  userType: 'user' | 'staff' | 'admin';
  isVerified: boolean;
  isBlocked: boolean;
  status: 'active' | 'invited' | 'disabled';
  createdAt: string;
  companyName: string | null;
  companySlug: string | null;
  parentId: number | null;
  roleId: number | null;
  parent: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    companyName: string | null;
  } | null;
  role: {
    id: number;
    name: string;
    description: string | null;
  } | null;
}

export const UserDetail: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/admin/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      const result = await response.json();
      if (result.success) {
        setUser(result.data || null);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const handleStatusChange = async (status: 'active' | 'invited' | 'disabled') => {
    setActionLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/admin/users/${userId}/status`,
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
      if (result.success) {
        setUser(user ? { ...user, status } : null);
      }
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendInvite = async () => {
    setActionLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/admin/users/${userId}/resend-invite`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      const result = await response.json();
      if (result.success) {
        alert('Invite resent successfully');
      }
    } catch (err) {
      setError('Failed to resend invite');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      const result = await response.json();
      if (result.success) {
        alert('User deleted successfully');
        navigate('/super-admin/users');
      } else {
        setError(result.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
          <button onClick={() => navigate('/super-admin/users')} className="mt-4 text-red-600 hover:text-red-700">
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      invited: 'bg-yellow-100 text-yellow-800',
      disabled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUserTypeBadge = (type: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      user: 'bg-blue-100 text-blue-800',
      staff: 'bg-green-100 text-green-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/super-admin/users')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-2xl">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUserTypeBadge(user.userType)}`}>
                  {user.userType}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">
                Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Company Info */}
          {(user.companyName || user.companySlug) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Company Information</h3>
              <div className="space-y-2">
                {user.companyName && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user.companyName}</span>
                  </div>
                )}
                {user.companySlug && (
                  <div className="text-sm text-gray-600 ml-8">
                    Slug: {user.companySlug}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parent/Owner Info (for staff) */}
          {user.userType === 'staff' && user.parent && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Linked to Owner</h3>
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {user.parent.firstName} {user.parent.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">{user.parent.email}</span>
                </div>
                {user.parent.companyName && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">{user.parent.companyName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Role Info (for staff) */}
          {user.userType === 'staff' && user.role && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Role</h3>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-1">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">{user.role.name}</span>
                </div>
                {user.role.description && (
                  <div className="text-sm text-gray-600 ml-7">{user.role.description}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
          <div className="space-y-3">
            <select
              value={user.status}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              disabled={actionLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="disabled">Disabled</option>
            </select>

            {user.status === 'invited' && (
              <button
                onClick={handleResendInvite}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Resend Invite
              </button>
            )}

            <button
              onClick={() => handleStatusChange(user.status === 'disabled' ? 'active' : 'disabled')}
              disabled={actionLoading}
              className={`w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                user.status === 'disabled'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } disabled:opacity-50`}
            >
              {user.status === 'disabled' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Enable User
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  Disable User
                </>
              )}
            </button>

            <div className="pt-4 mt-4 border-t border-gray-100">
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
