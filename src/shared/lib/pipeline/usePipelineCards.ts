import { useEffect, useMemo, useState } from 'react';
import { useCurrentOrganization } from '../../context/OrgContext';
import { getJobs, type Job } from '../../store/services/jobsApi';
import { getAllProposals, type Proposal } from '../../store/services/proposalsApi';
import { fetchInvoices, type Invoice } from '../../store/services/paymentsApi';
import { getContacts, type Contact } from '../../store/services/contactsApi';
import { buildPipelineCards } from './buildPipelineCards';
import type { PipelineCard } from './types';

interface UsePipelineCardsResult {
  cards: PipelineCard[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Pipeline view-model hook — read-only join across existing data sources.
 *
 * No new slice, no new actions. Each underlying source uses its existing
 * async API exactly as the legacy pages do today.
 *
 * Mistakes to avoid:
 *  - Do NOT call this in tight render loops; the hook fetches on mount and
 *    on org change, then caches. Use `refetch()` after a stage-advance
 *    action so the cards re-derive.
 *  - Do NOT mutate the returned array; treat it as immutable.
 */
export function usePipelineCards(): UsePipelineCardsResult {
  const { currentOrganizationId } = useCurrentOrganization();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  useEffect(() => {
    if (!currentOrganizationId) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    Promise.allSettled([
      getJobs(currentOrganizationId, 1, 200),
      getAllProposals(),
      fetchInvoices(),
      // getContacts signature: (orgId, search?, type?, page?, limit?)
      getContacts(currentOrganizationId, undefined, undefined, 1, 500),
    ])
      .then(([jobsRes, proposalsRes, invoicesRes, contactsRes]) => {
        if (cancelled) return;

        if (jobsRes.status === 'fulfilled') {
          setJobs(jobsRes.value.data?.data ?? []);
        }
        if (proposalsRes.status === 'fulfilled') {
          setProposals(proposalsRes.value.data ?? []);
        }
        if (invoicesRes.status === 'fulfilled') {
          setInvoices(invoicesRes.value ?? []);
        }
        if (contactsRes.status === 'fulfilled') {
          // getContacts returns ContactsListResponse with data.data
          const cs =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (contactsRes.value as any)?.data?.data ??
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (contactsRes.value as any)?.data ??
            [];
          setContacts(cs as Contact[]);
        }

        const failures = [jobsRes, proposalsRes, invoicesRes, contactsRes]
          .filter((r) => r.status === 'rejected')
          .map((r) => (r as PromiseRejectedResult).reason?.message ?? 'fetch failed');
        if (failures.length === 4) {
          setError('Failed to load pipeline data');
        }
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message ?? 'Failed to load pipeline data');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentOrganizationId, refetchKey]);

  const cards = useMemo(
    () => buildPipelineCards({ jobs, proposals, invoices, contacts }),
    [jobs, proposals, invoices, contacts],
  );

  return {
    cards,
    loading,
    error,
    refetch: () => setRefetchKey((k) => k + 1),
  };
}
