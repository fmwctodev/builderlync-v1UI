import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstantEstimatorOptional } from '../context/InstantEstimatorContext';
import { useCurrentOrganizationSafe } from '../../../shared/context/OrgContext';
import { useSupabaseUser } from '../../../shared/hooks/useSupabaseUser';
import { saveDraft } from '../services/estimatorDraftService';
import type { InstantEstimatorRouteState } from '../types/estimatorNavigation';

interface UseEscalateToReportReturn {
  navigateToOrderReport: () => Promise<void>;
  navigateToOrderHistory: () => void;
  isSaving: boolean;
  saveError: string | null;
  draftSaved: boolean;
}

export function useEscalateToReport(): UseEscalateToReportReturn {
  const navigate = useNavigate();
  const estimatorContext = useInstantEstimatorOptional();
  const { currentOrganizationId } = useCurrentOrganizationSafe();
  const { user } = useSupabaseUser();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);

  const navigateToOrderReport = useCallback(async () => {
    if (!estimatorContext) {
      navigate('/measurements');
      return;
    }

    const {
      selectedPropertyId,
      selectedAddressText,
      effectiveRoofArea,
      effectivePitch,
      materialsConfig,
      materialsSummary,
    } = estimatorContext;

    if (!selectedPropertyId || !selectedAddressText) {
      navigate('/measurements');
      return;
    }

    let draftId: string | undefined;

    if (currentOrganizationId && user?.id) {
      setIsSaving(true);
      setSaveError(null);

      try {
        draftId = await saveDraft({
          organizationId: currentOrganizationId,
          userId: user.id,
          propertyId: selectedPropertyId,
          addressText: selectedAddressText,
          roofAreaSqFt: effectiveRoofArea,
          effectivePitch: effectivePitch,
          materialsConfig: materialsConfig,
          materialsSummary: materialsSummary,
        });
        setDraftSaved(true);
      } catch (error) {
        console.error('Failed to save draft:', error);
        setSaveError('Could not save draft. Your estimate may not persist.');
      } finally {
        setIsSaving(false);
      }
    }

    const routeState: InstantEstimatorRouteState = {
      source: 'instant_estimator',
      propertyId: selectedPropertyId,
      addressText: selectedAddressText,
      roofAreaSqFt: effectiveRoofArea ?? undefined,
      effectivePitch: effectivePitch ?? undefined,
      estimatorDraftId: draftId,
    };

    navigate('/measurements', { state: routeState });
  }, [estimatorContext, currentOrganizationId, user?.id, navigate]);

  const navigateToOrderHistory = useCallback(() => {
    const routeState: Partial<InstantEstimatorRouteState> = {
      source: 'instant_estimator',
      initialTab: 'order-history',
    };

    navigate('/measurements', { state: routeState });
  }, [navigate]);

  return {
    navigateToOrderReport,
    navigateToOrderHistory,
    isSaving,
    saveError,
    draftSaved,
  };
}
