import { useState, useCallback, useEffect } from 'react';
import type { MaterialsSummary, MaterialsConfig } from '../utils/materialsUtils';
import type { EstimatorDraftRecord } from '../types/estimatorNavigation';
import { saveDraft as saveDraftToServer, getDraftByProperty } from '../services/estimatorDraftService';

const DRAFT_STORAGE_KEY = 'estimator-materials-draft';

export interface EstimatorDraft {
  materialsSummary: MaterialsSummary;
  addressText: string | null;
  exportedAt: string;
}

export interface ServerDraftData {
  organizationId: string;
  userId: string;
  propertyId: string;
  addressText: string;
  roofAreaSqFt?: number | null;
  effectivePitch?: number | null;
  materialsConfig?: MaterialsConfig | null;
  materialsSummary?: MaterialsSummary | null;
  jobId?: string | null;
  customerId?: string | null;
}

interface UseEstimatorDraftReturn {
  draft: EstimatorDraft | null;
  hasDraft: boolean;
  exportMaterialsToDraft: (summary: MaterialsSummary, addressText: string | null) => void;
  clearDraft: () => void;
  serverDraftId: string | null;
  isSavingToServer: boolean;
  serverSaveError: string | null;
  saveFullDraftToServer: (data: ServerDraftData) => Promise<string | null>;
  loadDraftFromServer: (organizationId: string, propertyId: string) => Promise<EstimatorDraftRecord | null>;
}

function loadDraftFromStorage(): EstimatorDraft | null {
  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as EstimatorDraft;
    if (!parsed.materialsSummary || !parsed.exportedAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function saveDraftToStorage(draft: EstimatorDraft): void {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    console.warn('Failed to save estimator draft to localStorage');
  }
}

function removeDraftFromStorage(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    console.warn('Failed to remove estimator draft from localStorage');
  }
}

export function useEstimatorDraft(): UseEstimatorDraftReturn {
  const [draft, setDraft] = useState<EstimatorDraft | null>(() => loadDraftFromStorage());
  const [serverDraftId, setServerDraftId] = useState<string | null>(null);
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [serverSaveError, setServerSaveError] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadDraftFromStorage();
    setDraft(stored);
  }, []);

  const exportMaterialsToDraft = useCallback((summary: MaterialsSummary, addressText: string | null) => {
    const newDraft: EstimatorDraft = {
      materialsSummary: summary,
      addressText,
      exportedAt: new Date().toISOString(),
    };
    saveDraftToStorage(newDraft);
    setDraft(newDraft);
  }, []);

  const clearDraft = useCallback(() => {
    removeDraftFromStorage();
    setDraft(null);
    setServerDraftId(null);
  }, []);

  const saveFullDraftToServer = useCallback(async (data: ServerDraftData): Promise<string | null> => {
    setIsSavingToServer(true);
    setServerSaveError(null);

    try {
      const draftId = await saveDraftToServer({
        organizationId: data.organizationId,
        userId: data.userId,
        propertyId: data.propertyId,
        addressText: data.addressText,
        roofAreaSqFt: data.roofAreaSqFt,
        effectivePitch: data.effectivePitch,
        materialsConfig: data.materialsConfig,
        materialsSummary: data.materialsSummary,
        jobId: data.jobId,
        customerId: data.customerId,
      });

      setServerDraftId(draftId);
      return draftId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save draft to server';
      setServerSaveError(message);
      console.error('Failed to save draft to server:', error);
      return null;
    } finally {
      setIsSavingToServer(false);
    }
  }, []);

  const loadDraftFromServer = useCallback(async (
    organizationId: string,
    propertyId: string
  ): Promise<EstimatorDraftRecord | null> => {
    try {
      const serverDraft = await getDraftByProperty(organizationId, propertyId);
      if (serverDraft) {
        setServerDraftId(serverDraft.id);
      }
      return serverDraft;
    } catch (error) {
      console.error('Failed to load draft from server:', error);
      return null;
    }
  }, []);

  return {
    draft,
    hasDraft: draft !== null,
    exportMaterialsToDraft,
    clearDraft,
    serverDraftId,
    isSavingToServer,
    serverSaveError,
    saveFullDraftToServer,
    loadDraftFromServer,
  };
}
