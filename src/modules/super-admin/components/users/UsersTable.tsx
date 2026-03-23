import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Eye, Edit2, Ban, CheckCircle, Mail } from 'lucide-react';
import { PlatformUser } from '../../types';
import { UserStatusBadge } from './UserStatusBadge';
import { ScopeBadge } from './ScopeBadge';
import { clsx } from 'clsx';

interface UsersTableProps {
  users: PlatformUser[];
  onChangeRole: (user: PlatformUser) => void;
  onChangeStatus: (user: PlatformUser, status: 'active' | 'disabled') => void;
  onResendInvite: (user: PlatformUser) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onChangeRole,
  onChangeStatus,
  onResendInvite,
}) => {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatDate = (date?: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  const formatRelativeTime = (date?: string | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(date);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">User</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Account</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Role</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Last Login</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/super-admin/users/${user.id}`)}
            >
              <td className="py-3 px-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {user.full_name || 'Unnamed User'}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </td>
              <td className="py-3 px-4">
                {user.account ? (
                  <div>
                    <div className="text-sm text-gray-900">{user.account.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.account.plan}</div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">No account</span>
                )}
              </td>
              <td className="py-3 px-4">
                {user.role ? (
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-gray-900">{user.role.name}</div>
                    <ScopeBadge scope={user.role.scope} size="sm" />
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">No role</span>
                )}
              </td>
              <td className="py-3 px-4">
                <UserStatusBadge status={user.status} />
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {formatRelativeTime(user.last_login_at)}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {formatDate(user.created_at)}
              </td>
              <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === user.id ? null : user.id);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                  {openMenuId === user.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <button
                          onClick={() => {
                            navigate(`/super-admin/users/${user.id}`);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            onChangeRole(user);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Change Role
                        </button>
                        {user.status === 'active' ? (
                          <button
                            onClick={() => {
                              onChangeStatus(user, 'disabled');
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Ban className="w-4 h-4" />
                            Disable User
                          </button>
                        ) : user.status === 'disabled' ? (
                          <button
                            onClick={() => {
                              onChangeStatus(user, 'active');
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Activate User
                          </button>
                        ) : null}
                        {user.status === 'invited' && (
                          <button
                            onClick={() => {
                              onResendInvite(user);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Mail className="w-4 h-4" />
                            Resend Invite
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
