import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { AffiliateReferral, AffiliateReferralStatus } from '../../types/affiliate';

interface Props {
  referrals: AffiliateReferral[];
  onMarkPaying: (r: AffiliateReferral) => void;
  onMarkChurned: (r: AffiliateReferral) => void;
}

const statusVariant = (s: AffiliateReferralStatus) => {
  switch (s) {
    case 'paying':
      return 'success' as const;
    case 'signed_up':
      return 'info' as const;
    case 'cookie':
      return 'neutral' as const;
    case 'churned':
      return 'error' as const;
    default:
      return 'neutral' as const;
  }
};

const formatDate = (s?: string) => (s ? new Date(s).toLocaleDateString() : '—');
const formatCurrency = (n?: number) =>
  n != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) : '—';

export const ReferralsTable: React.FC<Props> = ({ referrals, onMarkPaying, onMarkChurned }) => {
  if (referrals.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-base font-medium">No referrals yet</p>
        <p className="text-sm mt-1">
          Referrals appear here as soon as someone visits the site with an affiliate link.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">Affiliate</th>
            <th className="px-4 py-3 text-left">Referred</th>
            <th className="px-4 py-3 text-left">Account</th>
            <th className="px-4 py-3 text-right">MRR</th>
            <th className="px-4 py-3 text-left">Cookied</th>
            <th className="px-4 py-3 text-left">Signed up</th>
            <th className="px-4 py-3 text-left">First payment</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {referrals.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{r.affiliateName || '—'}</div>
                {r.affiliateCode && (
                  <div className="text-xs text-gray-500 font-mono">{r.affiliateCode}</div>
                )}
              </td>
              <td className="px-4 py-3 text-gray-700">{r.referredEmail || '—'}</td>
              <td className="px-4 py-3 text-gray-700">
                {r.referredAccountName || (r.referredAccountId ? `Acct ${r.referredAccountId.slice(0, 8)}` : '—')}
              </td>
              <td className="px-4 py-3 text-right text-gray-900">
                {formatCurrency(r.accountMrr)}
              </td>
              <td className="px-4 py-3 text-gray-600">{formatDate(r.cookieAt)}</td>
              <td className="px-4 py-3 text-gray-600">{formatDate(r.signedUpAt)}</td>
              <td className="px-4 py-3 text-gray-600">{formatDate(r.firstPaymentAt)}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant(r.status)} size="sm">
                  {r.status === 'signed_up' ? 'signed up' : r.status}
                </Badge>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                {r.status !== 'paying' && r.status !== 'churned' && (
                  <button
                    type="button"
                    onClick={() => onMarkPaying(r)}
                    title="Mark as paying"
                    className="inline-flex items-center justify-center w-8 h-8 rounded text-gray-500 hover:bg-green-50 hover:text-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {r.status !== 'churned' && (
                  <button
                    type="button"
                    onClick={() => onMarkChurned(r)}
                    title="Mark as churned"
                    className="inline-flex items-center justify-center w-8 h-8 rounded text-gray-500 hover:bg-red-50 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
