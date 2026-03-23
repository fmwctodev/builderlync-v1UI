import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import {
  getProposalWithLineItems,
  updateProposal,
  updateLineItem,
  addLineItem,
  deleteLineItem,
  reorderLineItems,
  calculateProposalTotal,
  updateProposalValue,
  logAuditEvent,
} from '../services/proposalIntegrationApi';
import type {
  Proposal,
  ProposalLineItem,
  ProposalWithLineItems,
  EstimateSnapshot,
  ProposalContent,
  ProposalTotals,
  UpdateProposalLineItemRequest,
  CreateProposalLineItemRequest,
} from '../types/proposalIntegration';

interface UseProposalBuilderResult {
  proposal: Proposal | null;
  lineItems: ProposalLineItem[];
  snapshot: EstimateSnapshot | null;
  totals: ProposalTotals;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  error: string | null;
  updateProposalField: <K extends keyof Proposal>(field: K, value: Proposal[K]) => void;
  updateProposalContent: (content: Partial<ProposalContent>) => void;
  updateLineItemField: (itemId: string, updates: UpdateProposalLineItemRequest) => Promise<void>;
  addNewLineItem: (item: Omit<CreateProposalLineItemRequest, 'proposal_id' | 'organization_id'>) => Promise<void>;
  removeLineItem: (itemId: string) => Promise<void>;
  reorderItems: (itemIds: string[]) => Promise<void>;
  saveNow: () => Promise<boolean>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

const DEBOUNCE_MS = 2000;

export function useProposalBuilder(proposalId: string): UseProposalBuilderResult {
  const { currentOrganizationId } = useCurrentOrganization();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [lineItems, setLineItems] = useState<ProposalLineItem[]>([]);
  const [snapshot, setSnapshot] = useState<EstimateSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pendingChanges = useRef<Partial<Proposal>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totals = useMemo((): ProposalTotals => {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);

    const itemsNeedingPricing = lineItems.filter(item => item.unit_price === 0).length;

    return {
      subtotal,
      tax_rate: 0,
      tax_amount: 0,
      total: subtotal,
      items_needing_pricing: itemsNeedingPricing,
    };
  }, [lineItems]);

  const fetchProposal = useCallback(async () => {
    if (!currentOrganizationId || !proposalId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getProposalWithLineItems(proposalId, currentOrganizationId);
      if (result.success && result.data) {
        setProposal(result.data);
        setLineItems(result.data.line_items || []);
        setSnapshot(result.data.snapshot || null);
      } else {
        setError(result.message || 'Failed to load proposal');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load proposal';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [proposalId, currentOrganizationId]);

  useEffect(() => {
    fetchProposal();
  }, [fetchProposal]);

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (!currentOrganizationId || !proposalId || Object.keys(pendingChanges.current).length === 0) {
        return;
      }

      setIsSaving(true);
      try {
        const result = await updateProposal(proposalId, currentOrganizationId, pendingChanges.current);
        if (result.success && result.data) {
          setProposal(result.data);
          pendingChanges.current = {};
          setIsDirty(false);
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, DEBOUNCE_MS);
  }, [currentOrganizationId, proposalId]);

  const updateProposalField = useCallback(<K extends keyof Proposal>(field: K, value: Proposal[K]) => {
    setProposal(prev => prev ? { ...prev, [field]: value } : null);
    pendingChanges.current[field as string] = value;
    setIsDirty(true);
    scheduleSave();
  }, [scheduleSave]);

  const updateProposalContent = useCallback((content: Partial<ProposalContent>) => {
    setProposal(prev => {
      if (!prev) return null;
      const newContent = { ...prev.content, ...content };
      pendingChanges.current.content = newContent;
      return { ...prev, content: newContent };
    });
    setIsDirty(true);
    scheduleSave();
  }, [scheduleSave]);

  const updateLineItemField = useCallback(async (
    itemId: string,
    updates: UpdateProposalLineItemRequest
  ) => {
    if (!currentOrganizationId) return;

    setLineItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, ...updates, was_edited: true } : item
      )
    );

    try {
      const result = await updateLineItem(itemId, currentOrganizationId, updates);
      if (result.success && result.data) {
        setLineItems(prev =>
          prev.map(item => item.id === itemId ? result.data! : item)
        );

        const totalResult = await calculateProposalTotal(proposalId, currentOrganizationId);
        if (totalResult.success && proposal) {
          await updateProposalValue(proposalId, currentOrganizationId, totalResult.total);
          setProposal(prev => prev ? { ...prev, value: totalResult.total } : null);
        }

        await logAuditEvent(
          proposalId,
          currentOrganizationId,
          'line_item_edited',
          { item_id: itemId, changes: updates }
        );
      }
    } catch (err) {
      console.error('Failed to update line item:', err);
      await fetchProposal();
    }
  }, [currentOrganizationId, proposalId, proposal, fetchProposal]);

  const addNewLineItem = useCallback(async (
    item: Omit<CreateProposalLineItemRequest, 'proposal_id' | 'organization_id'>
  ) => {
    if (!currentOrganizationId) return;

    try {
      const result = await addLineItem(proposalId, currentOrganizationId, item);
      if (result.success && result.data) {
        setLineItems(prev => [...prev, result.data!]);

        const totalResult = await calculateProposalTotal(proposalId, currentOrganizationId);
        if (totalResult.success) {
          await updateProposalValue(proposalId, currentOrganizationId, totalResult.total);
          setProposal(prev => prev ? { ...prev, value: totalResult.total } : null);
        }

        await logAuditEvent(
          proposalId,
          currentOrganizationId,
          'line_item_added',
          { item_name: item.name }
        );
      }
    } catch (err) {
      console.error('Failed to add line item:', err);
    }
  }, [currentOrganizationId, proposalId]);

  const removeLineItem = useCallback(async (itemId: string) => {
    if (!currentOrganizationId) return;

    const itemToRemove = lineItems.find(i => i.id === itemId);

    setLineItems(prev => prev.filter(item => item.id !== itemId));

    try {
      const result = await deleteLineItem(itemId, currentOrganizationId);
      if (result.success) {
        const totalResult = await calculateProposalTotal(proposalId, currentOrganizationId);
        if (totalResult.success) {
          await updateProposalValue(proposalId, currentOrganizationId, totalResult.total);
          setProposal(prev => prev ? { ...prev, value: totalResult.total } : null);
        }

        await logAuditEvent(
          proposalId,
          currentOrganizationId,
          'line_item_deleted',
          { item_name: itemToRemove?.name || itemToRemove?.item_name }
        );
      } else {
        await fetchProposal();
      }
    } catch (err) {
      console.error('Failed to delete line item:', err);
      await fetchProposal();
    }
  }, [currentOrganizationId, proposalId, lineItems, fetchProposal]);

  const reorderItems = useCallback(async (itemIds: string[]) => {
    if (!currentOrganizationId) return;

    const reorderedItems = itemIds.map((id, index) => {
      const item = lineItems.find(i => i.id === id);
      return item ? { ...item, line_number: index + 1 } : null;
    }).filter(Boolean) as ProposalLineItem[];

    setLineItems(reorderedItems);

    try {
      await reorderLineItems(proposalId, currentOrganizationId, itemIds);
    } catch (err) {
      console.error('Failed to reorder line items:', err);
      await fetchProposal();
    }
  }, [currentOrganizationId, proposalId, lineItems, fetchProposal]);

  const saveNow = useCallback(async (): Promise<boolean> => {
    if (!currentOrganizationId || !proposalId) return false;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    if (Object.keys(pendingChanges.current).length === 0) {
      return true;
    }

    setIsSaving(true);
    try {
      const result = await updateProposal(proposalId, currentOrganizationId, pendingChanges.current);
      if (result.success && result.data) {
        setProposal(result.data);
        pendingChanges.current = {};
        setIsDirty(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Save failed:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [currentOrganizationId, proposalId]);

  const refresh = useCallback(async () => {
    await fetchProposal();
  }, [fetchProposal]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    proposal,
    lineItems,
    snapshot,
    totals,
    isLoading,
    isSaving,
    isDirty,
    error,
    updateProposalField,
    updateProposalContent,
    updateLineItemField,
    addNewLineItem,
    removeLineItem,
    reorderItems,
    saveNow,
    refresh,
    clearError,
  };
}
