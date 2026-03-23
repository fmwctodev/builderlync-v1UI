import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type {
  PropertyData,
  PropertyDataStatus,
  PropertyDataError,
  ImageryStatus,
  ImageryError,
  PitchValue,
} from '../types/propertyData';
import type {
  PlanTierForBilling,
  EstimateChargeStatus,
  EstimateChargeError,
  InstantEstimateChargeRecord,
} from '../types/instantEstimatorBilling';
import {
  normalizePlanTier,
  isInstantEstimateFreeForTier,
  getInstantEstimateCreditCost,
} from '../types/instantEstimatorBilling';
import {
  fetchPropertyData,
  parsePropertyDataError,
  getCachedPropertyData,
  fetchOrthogonalImagery,
  parseImageryError,
} from '../services/propertyDataService';
import {
  getChargeStatus,
  chargeInstantEstimate,
} from '../services/instantEstimatorBillingService';
import { getOrganizationCredits } from '../services/creditsApi';
import { getEffectivePitch } from '../utils/pitchUtils';
import type { MaterialsConfig, MaterialsSummary } from '../utils/materialsUtils';
import { DEFAULT_MATERIALS_CONFIG, calculateMaterialsSummary } from '../utils/materialsUtils';
import { useCurrentOrganizationSafe } from '../../../shared/context/OrgContext';

interface InstantEstimatorContextValue {
  selectedPropertyId: string | null;
  selectedAddressText: string | null;
  propertyData: PropertyData | null;
  propertyDataStatus: PropertyDataStatus;
  propertyDataError: PropertyDataError | null;
  estimatorAccountMode: 'credits' | 'eagleview' | 'internal';
  imageryEnabled: boolean;
  imageryStatus: ImageryStatus;
  imageryError: ImageryError | null;
  imageryUrls: string[];
  pitchOverride: PitchValue;
  effectivePitch: PitchValue;
  isPitchRequiredModalOpen: boolean;
  pendingPitchActionId: string | null;
  roofAreaOverride: number | null;
  materialsConfig: MaterialsConfig;
  effectiveRoofArea: number | null;
  materialsSummary: MaterialsSummary | null;
  orgPlanTier: PlanTierForBilling | null;
  orgCreditBalance: number | null;
  isLoadingOrgContext: boolean;
  estimateChargeStatus: EstimateChargeStatus;
  estimateChargeError: EstimateChargeError | null;
  currentPropertyChargeRecord: InstantEstimateChargeRecord | null;
  isInstantEstimateFree: boolean;
  instantEstimateCreditCost: number;
  hasValidChargeForCurrentProperty: boolean;
  canGenerateEstimate: boolean;
  needsConfirmation: boolean;
  setSelectedAddress: (propertyId: string, addressText: string) => void;
  clearSelectedAddress: () => void;
  refreshPropertyData: () => Promise<void>;
  setEstimatorAccountMode: (mode: 'credits' | 'eagleview' | 'internal') => void;
  setImageryEnabled: (enabled: boolean) => void;
  fetchImagery: () => Promise<void>;
  retryImagery: () => Promise<void>;
  setPitchOverride: (pitch: number | null) => void;
  clearPitchOverride: () => void;
  openPitchRequiredModal: (actionId: string, onContinue: () => void) => void;
  closePitchRequiredModal: () => void;
  submitPitchFromModal: (pitch: number) => void;
  setRoofAreaOverride: (area: number | null) => void;
  updateMaterialsConfig: (updates: Partial<MaterialsConfig>) => void;
  resetMaterialsConfig: () => void;
  refreshCreditBalance: () => Promise<void>;
  checkPropertyChargeStatus: () => Promise<void>;
  generateInstantEstimate: () => Promise<{ needsConfirmation: boolean }>;
  confirmAndChargeEstimate: () => Promise<boolean>;
}

const InstantEstimatorContext = createContext<InstantEstimatorContextValue | null>(null);

interface InstantEstimatorProviderProps {
  children: React.ReactNode;
  defaultAccountMode?: 'credits' | 'eagleview' | 'internal';
  organizationId?: string;
  defaultImageryEnabled?: boolean;
}

export function InstantEstimatorProvider({
  children,
  defaultAccountMode = 'internal',
  organizationId: propOrganizationId,
  defaultImageryEnabled = false,
}: InstantEstimatorProviderProps) {
  const orgContext = useCurrentOrganizationSafe();
  const organizationId = propOrganizationId || orgContext.currentOrganizationId || undefined;

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedAddressText, setSelectedAddressText] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [propertyDataStatus, setPropertyDataStatus] = useState<PropertyDataStatus>('idle');
  const [propertyDataError, setPropertyDataError] = useState<PropertyDataError | null>(null);
  const [estimatorAccountMode, setEstimatorAccountMode] = useState<'credits' | 'eagleview' | 'internal'>(defaultAccountMode);

  const [imageryEnabled, setImageryEnabledState] = useState<boolean>(defaultImageryEnabled);
  const [imageryStatus, setImageryStatus] = useState<ImageryStatus>('idle');
  const [imageryError, setImageryError] = useState<ImageryError | null>(null);
  const [imageryUrls, setImageryUrls] = useState<string[]>([]);

  const [pitchOverride, setPitchOverrideState] = useState<PitchValue>(null);
  const [isPitchRequiredModalOpen, setIsPitchRequiredModalOpen] = useState(false);
  const [pendingPitchActionId, setPendingPitchActionId] = useState<string | null>(null);
  const pendingPitchCallback = useRef<(() => void) | null>(null);

  const [roofAreaOverride, setRoofAreaOverrideState] = useState<number | null>(null);
  const [materialsConfig, setMaterialsConfig] = useState<MaterialsConfig>(DEFAULT_MATERIALS_CONFIG);

  const [orgCreditBalance, setOrgCreditBalance] = useState<number | null>(null);
  const [isLoadingOrgContext, setIsLoadingOrgContext] = useState(true);
  const [estimateChargeStatus, setEstimateChargeStatus] = useState<EstimateChargeStatus>('idle');
  const [estimateChargeError, setEstimateChargeError] = useState<EstimateChargeError | null>(null);
  const [currentPropertyChargeRecord, setCurrentPropertyChargeRecord] = useState<InstantEstimateChargeRecord | null>(null);

  const orgPlanTier = useMemo<PlanTierForBilling | null>(() => {
    if (orgContext.isLoading) return null;
    return normalizePlanTier(orgContext.subscriptionTier);
  }, [orgContext.subscriptionTier, orgContext.isLoading]);

  const isInstantEstimateFree = useMemo(() => {
    if (!orgPlanTier) return false;
    return isInstantEstimateFreeForTier(orgPlanTier);
  }, [orgPlanTier]);

  const instantEstimateCreditCost = useMemo(() => {
    if (!orgPlanTier) return 1;
    return getInstantEstimateCreditCost(orgPlanTier);
  }, [orgPlanTier]);

  const hasValidChargeForCurrentProperty = useMemo(() => {
    return currentPropertyChargeRecord !== null && estimateChargeStatus === 'charged';
  }, [currentPropertyChargeRecord, estimateChargeStatus]);

  const canGenerateEstimate = useMemo(() => {
    if (!selectedPropertyId || !selectedAddressText || !organizationId) return false;
    if (hasValidChargeForCurrentProperty) return true;
    if (isInstantEstimateFree) return true;
    if (orgCreditBalance === null) return false;
    return orgCreditBalance >= instantEstimateCreditCost;
  }, [
    selectedPropertyId,
    selectedAddressText,
    organizationId,
    hasValidChargeForCurrentProperty,
    isInstantEstimateFree,
    orgCreditBalance,
    instantEstimateCreditCost,
  ]);

  const needsConfirmation = useMemo(() => {
    if (hasValidChargeForCurrentProperty) return false;
    if (isInstantEstimateFree) return false;
    return true;
  }, [hasValidChargeForCurrentProperty, isInstantEstimateFree]);

  const effectivePitch = useMemo(() => {
    return getEffectivePitch(propertyData?.pitch ?? null, pitchOverride);
  }, [propertyData?.pitch, pitchOverride]);

  const effectiveRoofArea = useMemo(() => {
    return roofAreaOverride ?? propertyData?.roofAreaSqFt ?? null;
  }, [roofAreaOverride, propertyData?.roofAreaSqFt]);

  const materialsSummary = useMemo(() => {
    return calculateMaterialsSummary(
      propertyData?.roofAreaSqFt ?? null,
      roofAreaOverride,
      materialsConfig
    );
  }, [propertyData?.roofAreaSqFt, roofAreaOverride, materialsConfig]);

  const fetchInProgress = useRef(false);
  const imageryFetchInProgress = useRef(false);

  const refreshCreditBalance = useCallback(async () => {
    if (!organizationId) return;
    try {
      const balance = await getOrganizationCredits(organizationId);
      setOrgCreditBalance(balance.balance);
    } catch (error) {
      console.error('Failed to refresh credit balance:', error);
    }
  }, [organizationId]);

  const checkPropertyChargeStatus = useCallback(async () => {
    if (!organizationId || !selectedPropertyId) {
      setCurrentPropertyChargeRecord(null);
      return;
    }

    try {
      const status = await getChargeStatus(organizationId, selectedPropertyId);
      if (status.charged && status.chargeRecord) {
        setCurrentPropertyChargeRecord(status.chargeRecord);
        setEstimateChargeStatus('charged');
      } else {
        setCurrentPropertyChargeRecord(null);
        setEstimateChargeStatus('idle');
      }
    } catch (error) {
      console.error('Failed to check charge status:', error);
      setCurrentPropertyChargeRecord(null);
    }
  }, [organizationId, selectedPropertyId]);

  const fetchData = useCallback(async (propertyId: string, addressText: string) => {
    if (fetchInProgress.current) return;

    const cached = getCachedPropertyData(propertyId);
    if (cached) {
      setPropertyData(cached);
      setPropertyDataStatus('success');
      setPropertyDataError(null);
      return;
    }

    fetchInProgress.current = true;
    setPropertyDataStatus('loading');
    setPropertyDataError(null);

    try {
      const data = await fetchPropertyData({
        propertyId,
        addressText,
        tier: 'basic',
        accountMode: estimatorAccountMode,
        organizationId,
      });

      setPropertyData(data);
      setPropertyDataStatus('success');
      setPropertyDataError(null);
    } catch (error) {
      const parsedError = parsePropertyDataError(error);
      setPropertyDataError(parsedError);
      setPropertyDataStatus('error');
      setPropertyData(null);
    } finally {
      fetchInProgress.current = false;
    }
  }, [estimatorAccountMode, organizationId]);

  const generateInstantEstimate = useCallback(async (): Promise<{ needsConfirmation: boolean }> => {
    if (!selectedPropertyId || !selectedAddressText || !organizationId) {
      return { needsConfirmation: false };
    }

    setEstimateChargeStatus('checking');
    setEstimateChargeError(null);

    try {
      const status = await getChargeStatus(organizationId, selectedPropertyId);

      if (status.charged && status.chargeRecord) {
        setCurrentPropertyChargeRecord(status.chargeRecord);
        setEstimateChargeStatus('charged');
        await fetchData(selectedPropertyId, selectedAddressText);
        return { needsConfirmation: false };
      }

      if (isInstantEstimateFree) {
        setEstimateChargeStatus('charging');
        const chargeResult = await chargeInstantEstimate({
          organizationId,
          propertyId: selectedPropertyId,
          addressText: selectedAddressText,
          planTier: orgPlanTier || 'standard',
        });

        if (!chargeResult.success) {
          setEstimateChargeStatus('error');
          setEstimateChargeError(chargeResult.error || { message: 'Failed to record charge' });
          return { needsConfirmation: false };
        }

        await checkPropertyChargeStatus();
        setEstimateChargeStatus('charged');
        await fetchData(selectedPropertyId, selectedAddressText);
        return { needsConfirmation: false };
      }

      if (orgCreditBalance === null) {
        await refreshCreditBalance();
      }

      if (orgCreditBalance !== null && orgCreditBalance < instantEstimateCreditCost) {
        setEstimateChargeStatus('error');
        setEstimateChargeError({ message: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS' });
        return { needsConfirmation: false };
      }

      setEstimateChargeStatus('idle');
      return { needsConfirmation: true };
    } catch (error) {
      setEstimateChargeStatus('error');
      setEstimateChargeError({
        message: error instanceof Error ? error.message : 'An error occurred',
      });
      return { needsConfirmation: false };
    }
  }, [
    selectedPropertyId,
    selectedAddressText,
    organizationId,
    isInstantEstimateFree,
    orgPlanTier,
    orgCreditBalance,
    instantEstimateCreditCost,
    fetchData,
    checkPropertyChargeStatus,
    refreshCreditBalance,
  ]);

  const confirmAndChargeEstimate = useCallback(async (): Promise<boolean> => {
    if (!selectedPropertyId || !selectedAddressText || !organizationId) {
      return false;
    }

    setEstimateChargeStatus('charging');
    setEstimateChargeError(null);

    try {
      const chargeResult = await chargeInstantEstimate({
        organizationId,
        propertyId: selectedPropertyId,
        addressText: selectedAddressText,
        planTier: orgPlanTier || 'standard',
      });

      if (!chargeResult.success) {
        setEstimateChargeStatus('error');
        setEstimateChargeError(chargeResult.error || { message: 'Failed to charge credits' });
        return false;
      }

      if (chargeResult.newBalance !== undefined) {
        setOrgCreditBalance(chargeResult.newBalance);
      }

      await checkPropertyChargeStatus();
      setEstimateChargeStatus('charged');
      await fetchData(selectedPropertyId, selectedAddressText);
      return true;
    } catch (error) {
      setEstimateChargeStatus('error');
      setEstimateChargeError({
        message: error instanceof Error ? error.message : 'An error occurred while charging',
      });
      return false;
    }
  }, [
    selectedPropertyId,
    selectedAddressText,
    organizationId,
    orgPlanTier,
    fetchData,
    checkPropertyChargeStatus,
  ]);

  const setSelectedAddress = useCallback((propertyId: string, addressText: string) => {
    setSelectedPropertyId(propertyId);
    setSelectedAddressText(addressText);
    setEstimateChargeStatus('idle');
    setEstimateChargeError(null);
    setCurrentPropertyChargeRecord(null);
    setPropertyData(null);
    setPropertyDataStatus('idle');
    setPropertyDataError(null);
  }, []);

  const clearSelectedAddress = useCallback(() => {
    setSelectedPropertyId(null);
    setSelectedAddressText(null);
    setPropertyData(null);
    setPropertyDataStatus('idle');
    setPropertyDataError(null);
    setImageryEnabledState(false);
    setImageryStatus('idle');
    setImageryError(null);
    setImageryUrls([]);
    setPitchOverrideState(null);
    setIsPitchRequiredModalOpen(false);
    setPendingPitchActionId(null);
    pendingPitchCallback.current = null;
    setRoofAreaOverrideState(null);
    setMaterialsConfig(DEFAULT_MATERIALS_CONFIG);
    setEstimateChargeStatus('idle');
    setEstimateChargeError(null);
    setCurrentPropertyChargeRecord(null);
  }, []);

  const refreshPropertyData = useCallback(async () => {
    if (!selectedPropertyId || !selectedAddressText) return;

    if (!hasValidChargeForCurrentProperty && !isInstantEstimateFree) {
      console.warn('Cannot refresh property data without a valid charge');
      return;
    }

    await fetchData(selectedPropertyId, selectedAddressText);
  }, [selectedPropertyId, selectedAddressText, hasValidChargeForCurrentProperty, isInstantEstimateFree, fetchData]);

  const fetchImageryInternal = useCallback(async () => {
    if (!selectedPropertyId || !selectedAddressText) return;
    if (imageryFetchInProgress.current) return;
    if (imageryUrls.length > 0) return;

    imageryFetchInProgress.current = true;
    setImageryStatus('loading');
    setImageryError(null);

    try {
      const urls = await fetchOrthogonalImagery({
        propertyId: selectedPropertyId,
        addressText: selectedAddressText,
        organizationId,
      });

      setImageryUrls(urls);
      setImageryStatus('success');
      setImageryError(null);
    } catch (error) {
      const parsedError = parseImageryError(error);
      setImageryError(parsedError);
      setImageryStatus('error');
    } finally {
      imageryFetchInProgress.current = false;
    }
  }, [selectedPropertyId, selectedAddressText, organizationId, imageryUrls.length]);

  const setImageryEnabled = useCallback((enabled: boolean) => {
    setImageryEnabledState(enabled);
  }, []);

  const fetchImagery = useCallback(async () => {
    await fetchImageryInternal();
  }, [fetchImageryInternal]);

  const retryImagery = useCallback(async () => {
    setImageryUrls([]);
    setImageryStatus('idle');
    setImageryError(null);
    await fetchImageryInternal();
  }, [fetchImageryInternal]);

  const setPitchOverride = useCallback((pitch: number | null) => {
    setPitchOverrideState(pitch);
  }, []);

  const clearPitchOverride = useCallback(() => {
    setPitchOverrideState(null);
  }, []);

  const openPitchRequiredModal = useCallback((actionId: string, onContinue: () => void) => {
    setPendingPitchActionId(actionId);
    pendingPitchCallback.current = onContinue;
    setIsPitchRequiredModalOpen(true);
  }, []);

  const closePitchRequiredModal = useCallback(() => {
    setIsPitchRequiredModalOpen(false);
    setPendingPitchActionId(null);
    pendingPitchCallback.current = null;
  }, []);

  const submitPitchFromModal = useCallback((pitch: number) => {
    setPitchOverrideState(pitch);
    setIsPitchRequiredModalOpen(false);
    const callback = pendingPitchCallback.current;
    setPendingPitchActionId(null);
    pendingPitchCallback.current = null;
    if (callback) {
      callback();
    }
  }, []);

  const setRoofAreaOverride = useCallback((area: number | null) => {
    setRoofAreaOverrideState(area);
  }, []);

  const updateMaterialsConfig = useCallback((updates: Partial<MaterialsConfig>) => {
    setMaterialsConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetMaterialsConfig = useCallback(() => {
    setMaterialsConfig(DEFAULT_MATERIALS_CONFIG);
    setRoofAreaOverrideState(null);
  }, []);

  useEffect(() => {
    const loadOrgContext = async () => {
      if (!organizationId) {
        setIsLoadingOrgContext(false);
        return;
      }

      setIsLoadingOrgContext(true);
      try {
        const balance = await getOrganizationCredits(organizationId);
        setOrgCreditBalance(balance.balance);
      } catch (error) {
        console.error('Failed to load credit balance:', error);
      } finally {
        setIsLoadingOrgContext(false);
      }
    };

    loadOrgContext();
  }, [organizationId]);

  useEffect(() => {
    if (selectedPropertyId && organizationId) {
      checkPropertyChargeStatus();
    }
  }, [selectedPropertyId, organizationId, checkPropertyChargeStatus]);

  useEffect(() => {
    if (imageryEnabled && selectedPropertyId && selectedAddressText && imageryUrls.length === 0 && imageryStatus === 'idle') {
      fetchImageryInternal();
    }
  }, [imageryEnabled, selectedPropertyId, selectedAddressText, imageryUrls.length, imageryStatus, fetchImageryInternal]);

  const value: InstantEstimatorContextValue = {
    selectedPropertyId,
    selectedAddressText,
    propertyData,
    propertyDataStatus,
    propertyDataError,
    estimatorAccountMode,
    imageryEnabled,
    imageryStatus,
    imageryError,
    imageryUrls,
    pitchOverride,
    effectivePitch,
    isPitchRequiredModalOpen,
    pendingPitchActionId,
    roofAreaOverride,
    materialsConfig,
    effectiveRoofArea,
    materialsSummary,
    orgPlanTier,
    orgCreditBalance,
    isLoadingOrgContext,
    estimateChargeStatus,
    estimateChargeError,
    currentPropertyChargeRecord,
    isInstantEstimateFree,
    instantEstimateCreditCost,
    hasValidChargeForCurrentProperty,
    canGenerateEstimate,
    needsConfirmation,
    setSelectedAddress,
    clearSelectedAddress,
    refreshPropertyData,
    setEstimatorAccountMode,
    setImageryEnabled,
    fetchImagery,
    retryImagery,
    setPitchOverride,
    clearPitchOverride,
    openPitchRequiredModal,
    closePitchRequiredModal,
    submitPitchFromModal,
    setRoofAreaOverride,
    updateMaterialsConfig,
    resetMaterialsConfig,
    refreshCreditBalance,
    checkPropertyChargeStatus,
    generateInstantEstimate,
    confirmAndChargeEstimate,
  };

  return (
    <InstantEstimatorContext.Provider value={value}>
      {children}
    </InstantEstimatorContext.Provider>
  );
}

export function useInstantEstimator(): InstantEstimatorContextValue {
  const context = useContext(InstantEstimatorContext);
  if (!context) {
    throw new Error('useInstantEstimator must be used within an InstantEstimatorProvider');
  }
  return context;
}

export function useInstantEstimatorOptional(): InstantEstimatorContextValue | null {
  return useContext(InstantEstimatorContext);
}
