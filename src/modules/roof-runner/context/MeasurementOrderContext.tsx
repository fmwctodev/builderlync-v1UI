import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useCurrentOrganizationSafe } from '../../../shared/context/OrgContext';
import { supabase } from '../../../shared/lib/supabase';
import { getOrganizationCredits } from '../services/creditsApi';
import {
  retrieveEagleViewAuth,
  storeEagleViewAuth,
  clearEagleViewAuth as clearStoredAuth,
  isTokenExpired,
} from '../services/eagleViewAuthService';
import {
  getAutoDeselectProducts,
  getAutoDeselectAddOns,
} from '../utils/productSelectionRules';
import {
  resolveCreditsForSelection,
  checkCreditEligibility,
  getEmptyCreditBreakdown,
  getDefaultCreditEligibility,
} from '../services/creditMappingService';
import {
  fetchPropertyData,
  parsePropertyDataError,
  clearPropertyDataCache,
} from '../services/propertyDataService';
import { getPropertyDataTierFromSubscription } from '../types/propertyData';
import { validatePromoCode, applyPromoToCredits } from '../services/promoCodeService';
import type { PromoCodeStatus, PromoCodeResult } from '../types/promoCode';
import { DEFAULT_PROMO_STATE } from '../types/promoCode';
import type {
  AccountMode,
  EagleViewAuthState,
  CreditBalance,
  ProductId,
  AddOnId,
  OrderPayload,
  CreditBreakdownResult,
  CreditEligibility,
  UpgradeEligibleProductId,
  UpgradeContext,
  UpgradeSource,
  MeasurementOrder,
  UpgradeOrderPayload,
} from '../types/measurementOrder';
import type { PrefilledSource } from '../components/measurements/PrefilledBanner';
import { UPGRADE_TARGET_PRODUCT } from '../types/measurementOrder';
import type {
  PropertyData,
  PropertyDataStatus,
  PropertyDataError,
} from '../types/propertyData';

interface MeasurementOrderContextValueExtended {
  accountMode: AccountMode | null;
  eagleViewAuth: EagleViewAuthState | null;
  creditBalance: CreditBalance | null;
  isLoadingCredits: boolean;
  isAuthenticating: boolean;
  error: string | null;
  selectedProducts: ProductId[];
  selectedAddOns: AddOnId[];
  productSelectionWarnings: string[];
  creditBreakdown: CreditBreakdownResult;
  creditEligibility: CreditEligibility;
  isUpgradeFlow: boolean;
  upgradeFromOrderId: string | null;
  upgradeFromProductId: UpgradeEligibleProductId | null;
  upgradeContext: UpgradeContext | null;
  selectedPropertyId: string | null;
  selectedAddressText: string | null;
  propertyData: PropertyData | null;
  propertyDataStatus: PropertyDataStatus;
  propertyDataError: PropertyDataError | null;
  promoCode: string | null;
  promoStatus: PromoCodeStatus;
  promoResult: PromoCodeResult | null;
  promoError: string | null;
  adjustedCreditTotal: number;
  prefilledSource: PrefilledSource | null;
  prefilledAddressText: string | null;
  setAccountMode: (mode: AccountMode) => void;
  clearAccountMode: () => void;
  setEagleViewAuth: (auth: EagleViewAuthState) => void;
  clearEagleViewAuth: () => void;
  refreshCreditBalance: () => Promise<void>;
  clearError: () => void;
  selectProduct: (productId: ProductId) => { autoDeselected: ProductId[] };
  deselectProduct: (productId: ProductId) => { autoDeselectedAddOns: AddOnId[] };
  toggleAddOn: (addOnId: AddOnId) => void;
  clearProductSelection: () => void;
  getOrderPayload: () => OrderPayload | UpgradeOrderPayload | null;
  enterUpgradeMode: (order: MeasurementOrder, source: UpgradeSource) => void;
  exitUpgradeMode: () => void;
  setSelectedAddress: (propertyId: string, addressText: string) => void;
  clearSelectedAddress: () => void;
  refreshPropertyData: () => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
  clearPromoCode: () => void;
  setPrefilledSource: (source: PrefilledSource | null, addressText?: string | null) => void;
  clearPrefilledSource: () => void;
}

const MeasurementOrderContext = createContext<MeasurementOrderContextValueExtended | undefined>(undefined);

export function MeasurementOrderProvider({ children }: { children: React.ReactNode }) {
  const { currentOrganizationId, subscriptionTier } = useCurrentOrganizationSafe();

  const [accountMode, setAccountModeState] = useState<AccountMode | null>(null);
  const [eagleViewAuth, setEagleViewAuthState] = useState<EagleViewAuthState | null>(null);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<ProductId[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnId[]>([]);
  const [productSelectionWarnings, setProductSelectionWarnings] = useState<string[]>([]);

  const [isUpgradeFlow, setIsUpgradeFlow] = useState(false);
  const [upgradeFromOrderId, setUpgradeFromOrderId] = useState<string | null>(null);
  const [upgradeFromProductId, setUpgradeFromProductId] = useState<UpgradeEligibleProductId | null>(null);
  const [upgradeContext, setUpgradeContext] = useState<UpgradeContext | null>(null);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedAddressText, setSelectedAddressText] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [propertyDataStatus, setPropertyDataStatus] = useState<PropertyDataStatus>('idle');
  const [propertyDataError, setPropertyDataError] = useState<PropertyDataError | null>(null);

  const [promoCode, setPromoCode] = useState<string | null>(DEFAULT_PROMO_STATE.promoCode);
  const [promoStatus, setPromoStatus] = useState<PromoCodeStatus>(DEFAULT_PROMO_STATE.promoStatus);
  const [promoResult, setPromoResult] = useState<PromoCodeResult | null>(DEFAULT_PROMO_STATE.promoResult);
  const [promoError, setPromoError] = useState<string | null>(DEFAULT_PROMO_STATE.promoError);

  const [prefilledSource, setPrefilledSourceState] = useState<PrefilledSource | null>(null);
  const [prefilledAddressText, setPrefilledAddressText] = useState<string | null>(null);

  const refreshCreditBalance = useCallback(async () => {
    if (!currentOrganizationId) {
      setCreditBalance(null);
      return;
    }

    setIsLoadingCredits(true);
    setError(null);

    try {
      const balance = await getOrganizationCredits(currentOrganizationId);
      setCreditBalance(balance);
    } catch (err) {
      console.error('Failed to fetch credit balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to load credit balance');
      setCreditBalance({
        organizationId: currentOrganizationId,
        balance: 0,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsLoadingCredits(false);
    }
  }, [currentOrganizationId]);

  const setAccountMode = useCallback((mode: AccountMode) => {
    setAccountModeState(mode);
    setError(null);
  }, []);

  const clearAccountMode = useCallback(() => {
    setAccountModeState(null);
    setEagleViewAuthState(null);
    clearStoredAuth();
    setError(null);
  }, []);

  const setEagleViewAuth = useCallback((auth: EagleViewAuthState) => {
    setEagleViewAuthState(auth);
    storeEagleViewAuth(auth);
    setIsAuthenticating(false);
    setError(null);
  }, []);

  const clearEagleViewAuth = useCallback(() => {
    setEagleViewAuthState(null);
    clearStoredAuth();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const selectProduct = useCallback((productId: ProductId): { autoDeselected: ProductId[] } => {
    const autoDeselected = getAutoDeselectProducts(productId, selectedProducts);

    setSelectedProducts((prev) => {
      const filtered = prev.filter((id) => !autoDeselected.includes(id));
      if (!filtered.includes(productId)) {
        return [...filtered, productId];
      }
      return filtered;
    });

    return { autoDeselected };
  }, [selectedProducts]);

  const deselectProduct = useCallback((productId: ProductId): { autoDeselectedAddOns: AddOnId[] } => {
    const autoDeselectedAddOns = getAutoDeselectAddOns(productId, selectedAddOns);

    setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    setSelectedAddOns((prev) => prev.filter((id) => !autoDeselectedAddOns.includes(id)));

    return { autoDeselectedAddOns };
  }, [selectedAddOns]);

  const toggleAddOn = useCallback((addOnId: AddOnId) => {
    setSelectedAddOns((prev) => {
      if (prev.includes(addOnId)) {
        return prev.filter((id) => id !== addOnId);
      }
      return [...prev, addOnId];
    });
  }, []);

  const clearProductSelection = useCallback(() => {
    setSelectedProducts([]);
    setSelectedAddOns([]);
    setProductSelectionWarnings([]);
  }, []);

  const enterUpgradeMode = useCallback((order: MeasurementOrder, source: UpgradeSource) => {
    if (order.productId !== 'measure_bidperfect') {
      console.error('Upgrade is only available for BidPerfect orders');
      return;
    }

    setIsUpgradeFlow(true);
    setUpgradeFromOrderId(order.id);
    setUpgradeFromProductId('measure_bidperfect');
    setUpgradeContext({
      addressId: order.addressId || order.id,
      propertyId: order.propertyId || order.id,
      addressText: order.address,
      customerId: order.customerId,
      jobId: order.jobId,
      source,
    });
    setSelectedProducts([UPGRADE_TARGET_PRODUCT]);
    setSelectedAddOns([]);
    setProductSelectionWarnings([]);
  }, []);

  const exitUpgradeMode = useCallback(() => {
    setIsUpgradeFlow(false);
    setUpgradeFromOrderId(null);
    setUpgradeFromProductId(null);
    setUpgradeContext(null);
    setSelectedProducts([]);
    setSelectedAddOns([]);
    setProductSelectionWarnings([]);
  }, []);

  const loadPropertyData = useCallback(async (propertyId: string, addressText: string) => {
    if (!accountMode) {
      return;
    }

    setPropertyDataStatus('loading');
    setPropertyDataError(null);

    try {
      const tier = getPropertyDataTierFromSubscription(subscriptionTier);
      const data = await fetchPropertyData({
        propertyId,
        addressText,
        tier,
        accountMode,
        eagleviewAuthToken: eagleViewAuth?.token,
      });
      setPropertyData(data);
      setPropertyDataStatus('success');
    } catch (err) {
      const parsedError = parsePropertyDataError(err);
      setPropertyDataError(parsedError);
      setPropertyDataStatus('error');
      setPropertyData(null);
    }
  }, [accountMode, subscriptionTier, eagleViewAuth]);

  const setSelectedAddress = useCallback((propertyId: string, addressText: string) => {
    setSelectedPropertyId(propertyId);
    setSelectedAddressText(addressText);

    if (accountMode) {
      loadPropertyData(propertyId, addressText);
    }
  }, [accountMode, loadPropertyData]);

  const clearSelectedAddress = useCallback(() => {
    if (selectedPropertyId) {
      clearPropertyDataCache(selectedPropertyId);
    }
    setSelectedPropertyId(null);
    setSelectedAddressText(null);
    setPropertyData(null);
    setPropertyDataStatus('idle');
    setPropertyDataError(null);
  }, [selectedPropertyId]);

  const refreshPropertyData = useCallback(async () => {
    if (selectedPropertyId && selectedAddressText) {
      clearPropertyDataCache(selectedPropertyId);
      await loadPropertyData(selectedPropertyId, selectedAddressText);
    }
  }, [selectedPropertyId, selectedAddressText, loadPropertyData]);

  const creditBreakdown: CreditBreakdownResult = useMemo(() => {
    if (selectedProducts.length === 0 && selectedAddOns.length === 0) {
      return getEmptyCreditBreakdown();
    }
    return resolveCreditsForSelection(selectedProducts, selectedAddOns, subscriptionTier);
  }, [selectedProducts, selectedAddOns, subscriptionTier]);

  const adjustedCreditTotal: number = useMemo(() => {
    return applyPromoToCredits(creditBreakdown.totalCredits, promoResult);
  }, [creditBreakdown.totalCredits, promoResult]);

  const applyPromoCode = useCallback(async (code: string) => {
    if (!code.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setPromoStatus('validating');
    setPromoError(null);

    try {
      const result = await validatePromoCode({
        code,
        totalCredits: creditBreakdown.totalCredits,
        accountMode,
      });

      if (result.isValid) {
        setPromoCode(code.trim().toUpperCase());
        setPromoResult(result);
        setPromoStatus('valid');
        setPromoError(null);
      } else {
        setPromoCode(null);
        setPromoResult(null);
        setPromoStatus('invalid');
        setPromoError(result.errorMessage || 'Invalid promo code');
      }
    } catch (err) {
      console.error('Error applying promo code:', err);
      setPromoStatus('error');
      setPromoError('Unable to validate promo code. Please try again.');
    }
  }, [creditBreakdown.totalCredits, accountMode]);

  const clearPromoCode = useCallback(() => {
    setPromoCode(null);
    setPromoStatus('idle');
    setPromoResult(null);
    setPromoError(null);
  }, []);

  const setPrefilledSource = useCallback((source: PrefilledSource | null, addressText?: string | null) => {
    setPrefilledSourceState(source);
    setPrefilledAddressText(addressText ?? null);
  }, []);

  const clearPrefilledSource = useCallback(() => {
    setPrefilledSourceState(null);
    setPrefilledAddressText(null);
  }, []);

  const getOrderPayload = useCallback((): OrderPayload | UpgradeOrderPayload | null => {
    if (!accountMode || selectedProducts.length === 0) {
      return null;
    }

    const basePayload: OrderPayload = {
      accountMode,
      selectedProducts,
      selectedAddOns,
      addressId: upgradeContext?.addressId,
      propertyId: upgradeContext?.propertyId,
    };

    if (isUpgradeFlow && upgradeFromOrderId && upgradeFromProductId) {
      return {
        ...basePayload,
        metadata: {
          type: 'UPGRADE',
          upgradeFromOrderId,
          upgradeFromProductId,
          lockedUpgradeProductId: UPGRADE_TARGET_PRODUCT,
        },
      } as UpgradeOrderPayload;
    }

    return basePayload;
  }, [accountMode, selectedProducts, selectedAddOns, isUpgradeFlow, upgradeFromOrderId, upgradeFromProductId, upgradeContext]);

  const creditEligibility: CreditEligibility = useMemo(() => {
    if (accountMode === 'eagleview') {
      return getDefaultCreditEligibility();
    }
    const hasLoadError = error !== null && error.includes('credit');
    return checkCreditEligibility(
      creditBalance?.balance ?? null,
      adjustedCreditTotal,
      creditBreakdown.missingMappings,
      hasLoadError
    );
  }, [accountMode, creditBalance, adjustedCreditTotal, creditBreakdown.missingMappings, error]);

  useEffect(() => {
    if (currentOrganizationId) {
      refreshCreditBalance();
    }
  }, [currentOrganizationId, refreshCreditBalance]);

  useEffect(() => {
    const storedAuth = retrieveEagleViewAuth();
    if (storedAuth && !isTokenExpired(storedAuth)) {
      setEagleViewAuthState(storedAuth);
      setAccountModeState('eagleview');
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearAccountMode();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearAccountMode]);

  useEffect(() => {
    if (eagleViewAuth && isTokenExpired(eagleViewAuth)) {
      setError('Your EagleView session has expired. Please log in again.');
      clearEagleViewAuth();
      if (accountMode === 'eagleview') {
        setAccountModeState(null);
      }
    }
  }, [eagleViewAuth, accountMode, clearEagleViewAuth]);

  const value: MeasurementOrderContextValueExtended = {
    accountMode,
    eagleViewAuth,
    creditBalance,
    isLoadingCredits,
    isAuthenticating,
    error,
    selectedProducts,
    selectedAddOns,
    productSelectionWarnings,
    creditBreakdown,
    creditEligibility,
    isUpgradeFlow,
    upgradeFromOrderId,
    upgradeFromProductId,
    upgradeContext,
    selectedPropertyId,
    selectedAddressText,
    propertyData,
    propertyDataStatus,
    propertyDataError,
    promoCode,
    promoStatus,
    promoResult,
    promoError,
    adjustedCreditTotal,
    prefilledSource,
    prefilledAddressText,
    setAccountMode,
    clearAccountMode,
    setEagleViewAuth,
    clearEagleViewAuth,
    refreshCreditBalance,
    clearError,
    selectProduct,
    deselectProduct,
    toggleAddOn,
    clearProductSelection,
    getOrderPayload,
    enterUpgradeMode,
    exitUpgradeMode,
    setSelectedAddress,
    clearSelectedAddress,
    refreshPropertyData,
    applyPromoCode,
    clearPromoCode,
    setPrefilledSource,
    clearPrefilledSource,
  };

  return (
    <MeasurementOrderContext.Provider value={value}>
      {children}
    </MeasurementOrderContext.Provider>
  );
}

export function useMeasurementOrderContext(): MeasurementOrderContextValueExtended {
  const context = useContext(MeasurementOrderContext);
  if (context === undefined) {
    throw new Error('useMeasurementOrderContext must be used within a MeasurementOrderProvider');
  }
  return context;
}

export type { MeasurementOrderContextValueExtended };
