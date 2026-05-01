import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  Affiliate,
  AffiliatePayout,
  AffiliatePayoutStatus,
  AffiliateReferral,
  AffiliateStats,
  CreateAffiliateInput,
  UpdateAffiliateInput,
} from '../types/affiliate';
import {
  accruePayouts as accruePayoutsService,
  computeStats,
  createAffiliate as createAffiliateService,
  deleteAffiliate as deleteAffiliateService,
  getAffiliates,
  getPayouts,
  getReferrals,
  syncReferralPayingStatus,
  updateAffiliate as updateAffiliateService,
  updatePayoutStatus as updatePayoutStatusService,
  updateReferral as updateReferralService,
} from '../services/affiliates-service';
import { getSuperAdminUser } from '../utils/super-admin-auth';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AffiliatesContextValue {
  affiliates: Affiliate[];
  referrals: AffiliateReferral[];
  payouts: AffiliatePayout[];
  loading: boolean;
  error: string | null;

  refresh: () => Promise<void>;
  refreshReferrals: () => Promise<void>;
  refreshPayouts: () => Promise<void>;

  createAffiliate: (input: CreateAffiliateInput) => Promise<Affiliate>;
  updateAffiliate: (id: string, updates: UpdateAffiliateInput) => Promise<void>;
  deleteAffiliate: (id: string) => Promise<void>;

  markReferralPaying: (id: string) => Promise<void>;
  markReferralChurned: (id: string) => Promise<void>;
  syncReferralStatuses: () => Promise<number>;

  accrueCurrentPeriod: () => Promise<number>;
  setPayoutStatus: (
    id: string,
    status: AffiliatePayoutStatus,
    extras?: { paymentReference?: string; notes?: string }
  ) => Promise<void>;

  statsFor: (affiliateId: string) => AffiliateStats | undefined;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AffiliatesContext = createContext<AffiliatesContextValue | undefined>(undefined);

export const useAffiliates = () => {
  const ctx = useContext(AffiliatesContext);
  if (!ctx) throw new Error('useAffiliates must be used within AffiliatesProvider');
  return ctx;
};

export const AffiliatesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
    },
    []
  );

  const refreshReferrals = useCallback(async () => {
    try {
      const data = await getReferrals();
      setReferrals(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load referrals';
      showToast(message, 'error');
    }
  }, [showToast]);

  const refreshPayouts = useCallback(async () => {
    try {
      const data = await getPayouts();
      setPayouts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load payouts';
      showToast(message, 'error');
    }
  }, [showToast]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [a, r, p] = await Promise.all([getAffiliates(), getReferrals(), getPayouts()]);
      setAffiliates(a);
      setReferrals(r);
      setPayouts(p);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load affiliates';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createAffiliate = useCallback(
    async (input: CreateAffiliateInput) => {
      try {
        const created = await createAffiliateService(input);
        setAffiliates((prev) => [created, ...prev]);
        showToast(`Affiliate "${created.name}" created`);
        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create affiliate';
        showToast(message, 'error');
        throw err;
      }
    },
    [showToast]
  );

  const updateAffiliate = useCallback(
    async (id: string, updates: UpdateAffiliateInput) => {
      try {
        const updated = await updateAffiliateService(id, updates);
        setAffiliates((prev) => prev.map((a) => (a.id === id ? updated : a)));
        showToast('Affiliate updated');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update affiliate';
        showToast(message, 'error');
        throw err;
      }
    },
    [showToast]
  );

  const deleteAffiliate = useCallback(
    async (id: string) => {
      try {
        await deleteAffiliateService(id);
        setAffiliates((prev) => prev.filter((a) => a.id !== id));
        setReferrals((prev) => prev.filter((r) => r.affiliateId !== id));
        setPayouts((prev) => prev.filter((p) => p.affiliateId !== id));
        showToast('Affiliate deleted');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete affiliate';
        showToast(message, 'error');
        throw err;
      }
    },
    [showToast]
  );

  const markReferralPaying = useCallback(
    async (id: string) => {
      try {
        const updated = await updateReferralService(id, {
          status: 'paying',
          firstPaymentAt: new Date().toISOString(),
        });
        setReferrals((prev) => prev.map((r) => (r.id === id ? updated : r)));
        showToast('Referral marked as paying');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update referral';
        showToast(message, 'error');
        throw err;
      }
    },
    [showToast]
  );

  const markReferralChurned = useCallback(
    async (id: string) => {
      try {
        const updated = await updateReferralService(id, { status: 'churned' });
        setReferrals((prev) => prev.map((r) => (r.id === id ? updated : r)));
        showToast('Referral marked as churned');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update referral';
        showToast(message, 'error');
        throw err;
      }
    },
    [showToast]
  );

  const syncReferralStatuses = useCallback(async () => {
    try {
      const moved = await syncReferralPayingStatus();
      await refreshReferrals();
      showToast(`Synced — ${moved} referrals transitioned to paying`);
      return moved;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync referrals';
      showToast(message, 'error');
      return 0;
    }
  }, [refreshReferrals, showToast]);

  const accrueCurrentPeriod = useCallback(async () => {
    try {
      const inserted = await accruePayoutsService();
      await refreshPayouts();
      showToast(`Accrued ${inserted} payout${inserted === 1 ? '' : 's'} for last period`);
      return inserted;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to accrue payouts';
      showToast(message, 'error');
      return 0;
    }
  }, [refreshPayouts, showToast]);

  const setPayoutStatus = useCallback(
    async (
      id: string,
      status: AffiliatePayoutStatus,
      extras?: { paymentReference?: string; notes?: string }
    ) => {
      try {
        const user = getSuperAdminUser();
        const updated = await updatePayoutStatusService(id, status, {
          ...extras,
          actorId: user?.id,
        });
        setPayouts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        showToast(`Payout marked ${status}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update payout';
        showToast(message, 'error');
        throw err;
      }
    },
    [showToast]
  );

  const statsFor = useCallback(
    (affiliateId: string): AffiliateStats | undefined => {
      const affiliate = affiliates.find((a) => a.id === affiliateId);
      if (!affiliate) return undefined;
      return computeStats(affiliate, referrals, payouts);
    },
    [affiliates, referrals, payouts]
  );

  const value: AffiliatesContextValue = {
    affiliates,
    referrals,
    payouts,
    loading,
    error,
    refresh,
    refreshReferrals,
    refreshPayouts,
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
  };

  return (
    <AffiliatesContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white ${
              toast.type === 'success'
                ? 'bg-green-600'
                : toast.type === 'error'
                ? 'bg-red-600'
                : 'bg-blue-600'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </AffiliatesContext.Provider>
  );
};
