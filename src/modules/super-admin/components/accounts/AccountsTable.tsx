import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, MoreVertical, Eye, Edit, Ban, CheckCircle, UserCircle, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { EnterpriseAccount } from '../../types';
import { clsx } from 'clsx';

interface AccountsTableProps {
  accounts: EnterpriseAccount[];
  onEdit: (account: EnterpriseAccount) => void;
  onSuspend: (account: EnterpriseAccount) => void;
  onReactivate: (account: EnterpriseAccount) => void;
  onImpersonate: (account: EnterpriseAccount) => void;
  onDelete: (account: EnterpriseAccount) => void;
}

type SortField = 'name' | 'plan' | 'status' | 'mrr' | 'healthScore';
type SortDirection = 'asc' | 'desc';

export const AccountsTable: React.FC<AccountsTableProps> = ({
  accounts,
  onEdit,
  onSuspend,
  onReactivate,
  onImpersonate,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAccounts = [...accounts].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'name') {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-red-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusBadgeVariant = (status: EnterpriseAccount['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trial':
        return 'warning';
      case 'past_due':
        return 'error';
      case 'suspended':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const getPlanBadgeVariant = (plan: EnterpriseAccount['plan']) => {
    switch (plan) {
      case 'Enterprise':
        return 'info';
      case 'Pro':
        return 'success';
      default:
        return 'neutral';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-600';
  };

  const getProvisioningStatusIcon = (status?: string) => {
    switch (status) {
      case 'provisioning':
        return <Loader2 className="w-4 h-4 text-red-600 animate-spin" title="Provisioning in progress" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" title="Provisioning failed" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-gray-400" title="Provisioning pending" />;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4">
              <button
                onClick={() => handleSort('name')}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Account Name
                <SortIcon field="name" />
              </button>
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Owner</th>
            <th className="text-left py-3 px-4">
              <button
                onClick={() => handleSort('plan')}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Plan
                <SortIcon field="plan" />
              </button>
            </th>
            <th className="text-left py-3 px-4">
              <button
                onClick={() => handleSort('status')}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Status
                <SortIcon field="status" />
              </button>
            </th>
            <th className="text-left py-3 px-4">
              <button
                onClick={() => handleSort('mrr')}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                MRR
                <SortIcon field="mrr" />
              </button>
            </th>
            <th className="text-left py-3 px-4">
              <button
                onClick={() => handleSort('healthScore')}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Health Score
                <SortIcon field="healthScore" />
              </button>
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Seats</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedAccounts.map((account) => (
            <tr
              key={account.id}
              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/super-admin/accounts/${account.id}`)}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{account.name}</span>
                  {getProvisioningStatusIcon(account.provisioningStatus)}
                </div>
              </td>
              <td className="py-3 px-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{account.ownerName}</div>
                  <div className="text-xs text-gray-500">{account.ownerEmail}</div>
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge variant={getPlanBadgeVariant(account.plan)} size="sm">
                  {account.plan}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <Badge variant={getStatusBadgeVariant(account.status)} size="sm">
                  {account.status}
                </Badge>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">${account.mrr.toFixed(2)}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                    <div
                      className={clsx('h-2 rounded-full', getHealthScoreColor(account.healthScore))}
                      style={{ width: `${account.healthScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 min-w-[2rem]">
                    {account.healthScore}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {account.seatsUsed} / {account.seatsLimit}
              </td>
              <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === account.id ? null : account.id);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                  {openMenuId === account.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <button
                          onClick={() => {
                            navigate(`/super-admin/accounts/${account.id}`);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            onEdit(account);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Account
                        </button>
                        {account.status === 'active' ? (
                          <button
                            onClick={() => {
                              onSuspend(account);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Ban className="w-4 h-4" />
                            Suspend Account
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              onReactivate(account);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Reactivate Account
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onImpersonate(account);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <UserCircle className="w-4 h-4" />
                          Impersonate
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => {
                            onDelete(account);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
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
