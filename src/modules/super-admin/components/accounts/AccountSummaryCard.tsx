import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EnterpriseAccount } from '../../types';
import { Mail, User, Calendar, Users } from 'lucide-react';

interface AccountSummaryCardProps {
  account: EnterpriseAccount;
}

export const AccountSummaryCard: React.FC<AccountSummaryCardProps> = ({ account }) => {
  return (
    <Card title="Account Summary" subtitle="Basic account information">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Owner Name</p>
            <p className="text-sm text-gray-900">{account.ownerName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Owner Email</p>
            <p className="text-sm text-gray-900">{account.ownerEmail}</p>
          </div>
        </div>

        {account.ownerPhone && (
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Phone</p>
              <p className="text-sm text-gray-900">{account.ownerPhone}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Created Date</p>
            <p className="text-sm text-gray-900">
              {new Date(account.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Seats</p>
            <p className="text-sm text-gray-900">
              {account.seatsUsed} / {account.seatsLimit} used
            </p>
          </div>
        </div>

        {account.tags.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {account.tags.map((tag) => (
                <Badge key={tag} variant="neutral" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Health Score</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    account.healthScore >= 80
                      ? 'bg-green-600'
                      : account.healthScore >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${account.healthScore}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900">{account.healthScore}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
