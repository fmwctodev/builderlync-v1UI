import React, { useMemo, useState } from 'react';
import { Plus, RefreshCw, Search, Calculator, Users } from 'lucide-react';
import { AffiliatesProvider, useAffiliates } from '../contexts/AffiliatesContext';
import { Card } from '../components/ui/Card';
import { Affiliate, CreateAffiliateInput } from '../types/affiliate';
import { AffiliatesTable } from '../components/affiliates/AffiliatesTable';
import { ReferralsTable } from '../components/affiliates/ReferralsTable';
import { PayoutsTable } from '../components/affiliates/PayoutsTable';
import { AffiliateEditModal } from '../components/affiliates/AffiliateEditModal';

type Tab = 'affiliates' | 'referrals' | 'payouts';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const AffiliatesContent: React.FC = () => {
  const {
    affiliates,
    referrals,
    payouts,
    loading,
    refresh,
    createAffiliate,
    updateAffiliate,
    deleteAffiliate,
    markReferralPaying,
    markReferralChurned,
    syncReferralStatuses,
    accrueCurrentPeriod,
    setPayoutStatus,
    statsFor,
    showToast,
  } = useAffiliates();

  const [tab, setTab] = useState<Tab>('affiliates');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'inactive'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Affiliate | undefined>();
  const [busy, setBusy] = useState(false);

  const filteredAffiliates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return affiliates.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.referralCode.toLowerCase().includes(q) ||
        (a.company || '').toLowerCase().includes(q)
      );
    });
  }, [affiliates, search, statusFilter]);

  const summary = useMemo(() => {
    const totalAffiliates = affiliates.length;
    const activeAffiliates = affiliates.filter((a) => a.status === 'active').length;
    const totalReferrals = referrals.length;
    const payingReferrals = referrals.filter((r) => r.status === 'paying').length;
    const pendingPayout = payouts
      .filter((p) => p.status === 'accrued' || p.status === 'approved')
      .reduce((s, p) => s + p.amountDue, 0);
    return { totalAffiliates, activeAffiliates, totalReferrals, payingReferrals, pendingPayout };
  }, [affiliates, referrals, payouts]);

  const handleCreate = () => {
    setModalMode('create');
    setSelected(undefined);
    setModalOpen(true);
  };

  const handleEdit = (a: Affiliate) => {
    setModalMode('edit');
    setSelected(a);
    setModalOpen(true);
  };

  const handleDelete = async (a: Affiliate) => {
    const stats = statsFor(a.id);
    const hasActivity = (stats?.totalReferrals ?? 0) > 0;
    const ok = window.confirm(
      hasActivity
        ? `Delete "${a.name}"?\n\nThis affiliate has ${stats?.totalReferrals} referrals and ${formatCurrency(
            stats?.lifetimeEarned ?? 0
          )} in lifetime payouts. All referrals and payout history will be deleted.\n\nThis cannot be undone.`
        : `Delete "${a.name}"?\n\nThis affiliate has no referrals yet, but the action cannot be undone.`
    );
    if (!ok) return;
    try {
      await deleteAffiliate(a.id);
      setModalOpen(false);
    } catch {
      // toast already shown
    }
  };

  const handleSave = async (data: CreateAffiliateInput) => {
    if (modalMode === 'create') {
      await createAffiliate(data);
    } else if (selected) {
      await updateAffiliate(selected.id, data);
    }
  };

  const handleSyncReferrals = async () => {
    setBusy(true);
    try {
      await syncReferralStatuses();
    } finally {
      setBusy(false);
    }
  };

  const handleAccrue = async () => {
    setBusy(true);
    try {
      await accrueCurrentPeriod();
    } finally {
      setBusy(false);
    }
  };

  const handleRefresh = async () => {
    setBusy(true);
    try {
      await refresh();
      showToast('Refreshed', 'info');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Affiliates</h1>
          <p className="text-gray-600 mt-1">
            Manage referral partners, track signups, and pay out commissions on a Net 30 cadence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={busy}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            <Plus className="w-5 h-5" /> Add Affiliate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Affiliates</div>
              <div className="text-2xl font-bold text-gray-900">
                {summary.activeAffiliates}{' '}
                <span className="text-base text-gray-500 font-normal">
                  / {summary.totalAffiliates}
                </span>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total referrals</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{summary.totalReferrals}</div>
        </Card>
        <Card>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Paying</div>
          <div className="text-2xl font-bold text-green-700 mt-1">{summary.payingReferrals}</div>
        </Card>
        <Card>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Pending payout</div>
          <div className="text-2xl font-bold text-yellow-700 mt-1">
            {formatCurrency(summary.pendingPayout)}
          </div>
        </Card>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {(
            [
              { key: 'affiliates' as const, label: 'Affiliates', count: filteredAffiliates.length },
              { key: 'referrals' as const, label: 'Referrals', count: referrals.length },
              { key: 'payouts' as const, label: 'Payouts', count: payouts.length },
            ]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key
                  ? 'border-red-600 text-red-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label} <span className="text-xs text-gray-400">({t.count})</span>
            </button>
          ))}
        </nav>
      </div>

      {tab === 'affiliates' && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, code, company…"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <Card className="overflow-hidden p-0">
            <AffiliatesTable
              affiliates={filteredAffiliates}
              statsFor={statsFor}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Card>
        </>
      )}

      {tab === 'referrals' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Referrals show up here as soon as a visitor lands with an affiliate link.
            </p>
            <button
              type="button"
              onClick={handleSyncReferrals}
              disabled={busy}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
              Sync paying status
            </button>
          </div>
          <Card className="overflow-hidden p-0">
            <ReferralsTable
              referrals={referrals}
              onMarkPaying={(r) => markReferralPaying(r.id)}
              onMarkChurned={(r) => markReferralChurned(r.id)}
            />
          </Card>
        </>
      )}

      {tab === 'payouts' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              One payout row per affiliate per monthly period. <span className="font-medium">Net 30</span> = due 30 days
              after period end.
            </p>
            <button
              type="button"
              onClick={handleAccrue}
              disabled={busy}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Calculator className={`w-4 h-4 ${busy ? 'animate-pulse' : ''}`} />
              Accrue last period
            </button>
          </div>
          <Card className="overflow-hidden">
            <PayoutsTable payouts={payouts} onSetStatus={setPayoutStatus} />
          </Card>
        </>
      )}

      <AffiliateEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        affiliate={selected}
        onSave={handleSave}
        onDelete={selected ? () => handleDelete(selected) : undefined}
      />
    </div>
  );
};

export const Affiliates: React.FC = () => (
  <AffiliatesProvider>
    <AffiliatesContent />
  </AffiliatesProvider>
);
