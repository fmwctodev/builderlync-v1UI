import { useState, useEffect, useCallback } from 'react';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { getProposalsByOrganization, updateProposalStatus, deleteProposal, createProposal } from '../../services/proposalsNewApi';
import type { Proposal, ProposalStatus } from '../../types/proposalIntegration';

export function useProposals(statusFilter?: ProposalStatus | 'all') {
  const { currentOrganizationId } = useCurrentOrganization();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!currentOrganizationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getProposalsByOrganization(currentOrganizationId, {
        status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (result.success && result.data) {
        setProposals(result.data);
      } else {
        setError(result.message || 'Failed to load proposals');
      }
    } catch {
      setError('Failed to load proposals');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganizationId, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const changeStatus = useCallback(async (id: string, status: ProposalStatus) => {
    if (!currentOrganizationId) return;
    const result = await updateProposalStatus(id, currentOrganizationId, status);
    if (result.success) {
      setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    }
  }, [currentOrganizationId]);

  const remove = useCallback(async (id: string) => {
    if (!currentOrganizationId) return;
    const result = await deleteProposal(id, currentOrganizationId);
    if (result.success) {
      setProposals(prev => prev.filter(p => p.id !== id));
    }
  }, [currentOrganizationId]);

  const create = useCallback(async (title: string) => {
    if (!currentOrganizationId) return null;
    const result = await createProposal({ organization_id: currentOrganizationId, title, status: 'draft' });
    if (result.success && result.data) {
      setProposals(prev => [result.data!, ...prev]);
      return result.data.id;
    }
    return null;
  }, [currentOrganizationId]);

  const stats = {
    total: proposals.length,
    draft: proposals.filter(p => p.status === 'draft').length,
    waiting: proposals.filter(p => p.status === 'waiting').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    declined: proposals.filter(p => p.status === 'declined').length,
    totalValue: proposals.reduce((sum, p) => sum + (p.value || 0), 0),
    acceptedValue: proposals.filter(p => p.status === 'accepted').reduce((sum, p) => sum + (p.value || 0), 0),
  };

  return { proposals, isLoading, error, refresh: fetch, changeStatus, remove, create, stats };
}
