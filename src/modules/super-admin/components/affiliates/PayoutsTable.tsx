import React, { useState } from 'react';
import { CheckCircle, DollarSign, XCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { AffiliatePayout, AffiliatePayoutStatus } from '../../types/affiliate';

interface Props {
  payouts: AffiliatePayout[];
  onSetStatus: (
    id: string,
    status: AffiliatePayoutStatus,
    extras?: { paymentReference?: string; notes?: string }
  ) => Promise<void>;
}

const statusVariant = (s: AffiliatePayoutStatus) => {
  switch (s) {
    case 'paid':
      return 'success' as const;
    case 'approved':
      return 'info' as const;
    case 'accrued':
      return 'warning' as const;
    case 'void':
      return 'neutral' as const;
    default:
      return 'neutral' as const;
  }
};

const formatDate = (s?: string) => (s ? new Date(s).toLocaleDateString() : '—');
const formatCurrency = (n: number, c = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(n || 0);

const isOverdue = (p: AffiliatePayout) =>
  p.status !== 'paid' && p.status !== 'void' && new Date(p.dueDate) < new Date();

export const PayoutsTable: React.FC<Props> = ({ payouts, onSetStatus }) => {
  const [paymentRefById, setPaymentRefById] = useState<Record<string, string>>({});

  if (payouts.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-base font-medium">No payouts accrued yet</p>
        <p className="text-sm mt-1">
          Click <span className="font-medium">Accrue last period</span> to calculate commissions for paying referrals.
        </p>
      </div>
    );
  }

  const totalPending = payouts
    .filter((p) => p.status === 'accrued' || p.status === 'approved')
    .reduce((s, p) => s + p.amountDue, 0);
  const totalPaid = payouts.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amountDue, 0);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
          <div className="text-xs text-yellow-700 uppercase tracking-wide font-medium">Pending</div>
          <div className="text-2xl font-bold text-yellow-900">{formatCurrency(totalPending)}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <div className="text-xs text-green-700 uppercase tracking-wide font-medium">Paid out</div>
          <div className="text-2xl font-bold text-green-900">{formatCurrency(totalPaid)}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <div className="text-xs text-gray-700 uppercase tracking-wide font-medium">Total payouts</div>
          <div className="text-2xl font-bold text-gray-900">{payouts.length}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Affiliate</th>
              <th className="px-4 py-3 text-left">Period</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-left">Due (Net 30)</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Reference</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payouts.map((p) => {
              const overdue = isOverdue(p);
              return (
                <tr key={p.id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50/40' : ''}`}>
                  <td className="px-4 py-3 text-gray-900 font-medium">{p.affiliateName || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatDate(p.periodStart)} → {formatDate(p.periodEnd)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium">
                    {formatCurrency(p.amountDue, p.currency)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatDate(p.dueDate)}
                    {overdue && (
                      <span className="ml-1 text-xs font-medium text-red-700">overdue</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(p.status)} size="sm">{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {p.status === 'paid' ? (
                      <span className="text-xs font-mono text-gray-600">
                        {p.paymentReference || '—'}
                      </span>
                    ) : (
                      <input
                        value={paymentRefById[p.id] || ''}
                        onChange={(e) =>
                          setPaymentRefById((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        placeholder="payment ref"
                        className="px-2 py-1 text-xs border border-gray-300 rounded font-mono w-32"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {p.status === 'accrued' && (
                      <button
                        type="button"
                        onClick={() => onSetStatus(p.id, 'approved')}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {(p.status === 'accrued' || p.status === 'approved') && (
                      <button
                        type="button"
                        onClick={() =>
                          onSetStatus(p.id, 'paid', {
                            paymentReference: paymentRefById[p.id] || undefined,
                          })
                        }
                        className="ml-1 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Mark paid
                      </button>
                    )}
                    {p.status !== 'paid' && p.status !== 'void' && (
                      <button
                        type="button"
                        onClick={() => onSetStatus(p.id, 'void')}
                        className="ml-1 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded"
                        title="Void payout"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Void
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
