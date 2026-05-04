import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Affiliate, AffiliateStats } from '../../types/affiliate';
import { AffiliateLinkButton } from './AffiliateLinkButton';

interface Props {
  affiliates: Affiliate[];
  statsFor: (id: string) => AffiliateStats | undefined;
  onEdit: (a: Affiliate) => void;
  onDelete: (a: Affiliate) => void;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const statusBadgeVariant = (status: Affiliate['status']) => {
  switch (status) {
    case 'active':
      return 'success' as const;
    case 'paused':
      return 'warning' as const;
    case 'inactive':
      return 'neutral' as const;
    default:
      return 'neutral' as const;
  }
};

export const AffiliatesTable: React.FC<Props> = ({ affiliates, statsFor, onEdit, onDelete }) => {
  if (affiliates.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-base font-medium">No affiliates yet</p>
        <p className="text-sm mt-1">Click <span className="font-medium">Add Affiliate</span> to create your first partner.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">Affiliate</th>
            <th className="px-4 py-3 text-left">Code / Link</th>
            <th className="px-4 py-3 text-right">Rate</th>
            <th className="px-4 py-3 text-right">Referrals</th>
            <th className="px-4 py-3 text-right">Paying</th>
            <th className="px-4 py-3 text-right">Pending payout</th>
            <th className="px-4 py-3 text-right">Lifetime</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {affiliates.map((a) => {
            const s = statsFor(a.id);
            return (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{a.name}</div>
                  <div className="text-xs text-gray-500">{a.email}</div>
                  {a.company && <div className="text-xs text-gray-400">{a.company}</div>}
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <div className="font-mono text-xs text-gray-700 mb-1">{a.referralCode}</div>
                  <AffiliateLinkButton referralCode={a.referralCode} variant="compact" />
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {(a.commissionRate * 100).toFixed(0)}%
                  <div className="text-xs text-gray-400">
                    {a.commissionWindowMonths === 0
                      ? 'lifetime'
                      : `${a.commissionWindowMonths}mo`}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-900">{s?.totalReferrals ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-gray-900 font-medium">{s?.paying ?? 0}</span>
                </td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">
                  {formatCurrency(s?.pendingPayout ?? 0)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatCurrency(s?.lifetimeEarned ?? 0)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusBadgeVariant(a.status)} size="sm">
                    {a.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onEdit(a)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(a)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded text-gray-500 hover:bg-red-50 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
