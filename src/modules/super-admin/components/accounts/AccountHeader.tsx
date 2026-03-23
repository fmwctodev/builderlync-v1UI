import React from 'react';
import { ArrowLeft, Edit, Ban, CheckCircle, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { EnterpriseAccount } from '../../types';

interface AccountHeaderProps {
  account: EnterpriseAccount;
  onEdit: () => void;
  onSuspend: () => void;
  onReactivate: () => void;
  onImpersonate: () => void;
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({
  account,
  onEdit,
  onSuspend,
  onReactivate,
  onImpersonate,
}) => {
  const navigate = useNavigate();

  const getStatusVariant = (status: EnterpriseAccount['status']) => {
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

  const getPlanVariant = (plan: EnterpriseAccount['plan']) => {
    switch (plan) {
      case 'Enterprise':
        return 'info';
      case 'Pro':
        return 'success';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <button
        onClick={() => navigate('/super-admin/accounts')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Accounts</span>
      </button>

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{account.name}</h1>
            <Badge variant={getStatusVariant(account.status)}>{account.status}</Badge>
            <Badge variant={getPlanVariant(account.plan)}>{account.plan}</Badge>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div>
              <span className="font-medium">MRR:</span> ${account.mrr.toFixed(2)}
            </div>
            <div>
              <span className="font-medium">ARR:</span> ${account.arr.toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Renewal:</span>{' '}
              {new Date(account.renewalDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onImpersonate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <UserCircle className="w-4 h-4" />
            Impersonate
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Edit className="w-4 h-4" />
            Edit Account
          </button>
          {account.status === 'active' ? (
            <button
              onClick={onSuspend}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              <Ban className="w-4 h-4" />
              Suspend
            </button>
          ) : (
            <button
              onClick={onReactivate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              Reactivate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
