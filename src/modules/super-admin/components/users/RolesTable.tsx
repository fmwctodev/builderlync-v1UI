import React, { useState } from 'react';
import { MoreVertical, Edit, Copy, Trash2, CheckCircle } from 'lucide-react';
import { Role } from '../../types';
import { ScopeBadge } from './ScopeBadge';

interface RolesTableProps {
  roles: Role[];
  userCounts: Record<string, number>;
  onEdit: (role: Role) => void;
  onDuplicate: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  userCounts,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Role Name</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Scope</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Account</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Default</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Users</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr
              key={role.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="py-3 px-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{role.name}</div>
                  {role.description && (
                    <div className="text-xs text-gray-500 mt-1">{role.description}</div>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <ScopeBadge scope={role.scope} />
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {role.account_id ? 'Account-Specific' : '-'}
              </td>
              <td className="py-3 px-4">
                {role.is_default && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    Yes
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {userCounts[role.id] || 0}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {formatDate(role.created_at)}
              </td>
              <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === role.id ? null : role.id);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                  {openMenuId === role.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <button
                          onClick={() => {
                            onEdit(role);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Role
                        </button>
                        <button
                          onClick={() => {
                            onDuplicate(role);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => {
                            onDelete(role);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
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
