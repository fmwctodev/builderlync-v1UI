import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import {
  ABCSupplyAccount,
  ABCSupplyBranch,
  ABCSupplyProduct,
  ABCSupplyPriceResponse,
  fetchAccounts,
  fetchBranchesForAccount,
  getItemPrice,
  getBatchPricing,
} from '../services/abcSupplyApi';

export interface CartItem {
  product: ABCSupplyProduct;
  quantity: number;
  uom: string;
  pricing: ABCSupplyPriceResponse | null;
  isLoading: boolean;
  error: string | null;
}

interface ABCSupplyContextType {
  accounts: ABCSupplyAccount[];
  branches: ABCSupplyBranch[];
  selectedAccount: ABCSupplyAccount | null;
  selectedBranch: ABCSupplyBranch | null;
  cartItems: CartItem[];
  isLoadingAccounts: boolean;
  isLoadingBranches: boolean;
  accountsError: string | null;
  branchesError: string | null;

  selectAccount: (account: ABCSupplyAccount | null) => void;
  selectBranch: (branch: ABCSupplyBranch | null) => void;

  addToCart: (product: ABCSupplyProduct, quantity: number, uom?: string) => Promise<void>;
  updateCartItemQuantity: (itemNumber: string, quantity: number) => Promise<void>;
  updateCartItemUom: (itemNumber: string, uom: string) => Promise<void>;
  removeFromCart: (itemNumber: string) => void;
  clearCart: () => void;

  refreshPricing: () => Promise<void>;

  cartSubtotal: number;
  cartItemCount: number;
  hasInvalidPricing: boolean;
  hasContactForPriceItems: boolean;

  isReadyToOrder: boolean;
  getValidationErrors: () => string[];

  refreshAccounts: () => Promise<void>;
  refreshBranches: () => Promise<void>;
}

const ABCSupplyContext = createContext<ABCSupplyContextType | undefined>(undefined);

export function useABCSupply(): ABCSupplyContextType {
  const context = useContext(ABCSupplyContext);
  if (!context) {
    throw new Error('useABCSupply must be used within an ABCSupplyProvider');
  }
  return context;
}

interface ABCSupplyProviderProps {
  children: ReactNode;
}

export function ABCSupplyProvider({ children }: ABCSupplyProviderProps) {
  const { currentOrganizationId } = useCurrentOrganization();
  const organizationId = currentOrganizationId;

  const [accounts, setAccounts] = useState<ABCSupplyAccount[]>([]);
  const [branches, setBranches] = useState<ABCSupplyBranch[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<ABCSupplyAccount | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<ABCSupplyBranch | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [branchesError, setBranchesError] = useState<string | null>(null);

  const refreshAccounts = useCallback(async () => {
    if (!organizationId) return;

    setIsLoadingAccounts(true);
    setAccountsError(null);

    try {
      const data = await fetchAccounts(organizationId);
      setAccounts(data);

      const defaultAccount = data.find(a => a.isDefault) || data[0];
      if (defaultAccount && !selectedAccount) {
        setSelectedAccount(defaultAccount);
      }
    } catch (err) {
      setAccountsError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [organizationId, selectedAccount]);

  const refreshBranches = useCallback(async () => {
    if (!organizationId || !selectedAccount) {
      setBranches([]);
      return;
    }

    setIsLoadingBranches(true);
    setBranchesError(null);

    try {
      const data = await fetchBranchesForAccount(selectedAccount.accountNumber, organizationId);
      setBranches(data);

      if (selectedBranch && !data.find(b => b.branchNumber === selectedBranch.branchNumber)) {
        setSelectedBranch(null);
      }
    } catch (err) {
      setBranchesError(err instanceof Error ? err.message : 'Failed to load branches');
    } finally {
      setIsLoadingBranches(false);
    }
  }, [organizationId, selectedAccount, selectedBranch]);

  useEffect(() => {
    refreshAccounts();
  }, [organizationId]);

  useEffect(() => {
    refreshBranches();
  }, [selectedAccount]);

  const selectAccount = useCallback((account: ABCSupplyAccount | null) => {
    setSelectedAccount(account);
    setSelectedBranch(null);

    if (cartItems.length > 0) {
      setCartItems(items => items.map(item => ({
        ...item,
        pricing: null,
        isLoading: false,
        error: 'Please select a branch to refresh pricing',
      })));
    }
  }, [cartItems.length]);

  const selectBranch = useCallback((branch: ABCSupplyBranch | null) => {
    setSelectedBranch(branch);

    if (branch && cartItems.length > 0 && selectedAccount && organizationId) {
      setCartItems(items => items.map(item => ({
        ...item,
        isLoading: true,
        error: null,
      })));

      getBatchPricing(
        cartItems.map(item => ({
          itemNumber: item.product.itemNumber,
          quantity: item.quantity,
          uom: item.uom,
        })),
        selectedAccount.accountNumber,
        branch.branchNumber,
        organizationId
      ).then(pricingResults => {
        setCartItems(items => items.map((item, index) => ({
          ...item,
          pricing: pricingResults[index] || null,
          isLoading: false,
          error: pricingResults[index]?.requiresContactForPrice
            ? 'Contact branch for pricing'
            : null,
        })));
      }).catch(err => {
        setCartItems(items => items.map(item => ({
          ...item,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to get pricing',
        })));
      });
    }
  }, [cartItems, selectedAccount, organizationId]);

  const addToCart = useCallback(async (product: ABCSupplyProduct, quantity: number, uom?: string) => {
    const existingIndex = cartItems.findIndex(item => item.product.itemNumber === product.itemNumber);
    const selectedUom = uom || product.stockingUom;

    if (existingIndex >= 0) {
      await updateCartItemQuantity(product.itemNumber, cartItems[existingIndex].quantity + quantity);
      return;
    }

    const newItem: CartItem = {
      product,
      quantity,
      uom: selectedUom,
      pricing: null,
      isLoading: !!selectedAccount && !!selectedBranch,
      error: null,
    };

    setCartItems(prev => [...prev, newItem]);

    if (selectedAccount && selectedBranch && organizationId) {
      try {
        const pricing = await getItemPrice(
          {
            accountNumber: selectedAccount.accountNumber,
            branchNumber: selectedBranch.branchNumber,
            itemNumber: product.itemNumber,
            quantity,
            uom: selectedUom,
          },
          organizationId
        );

        setCartItems(prev => prev.map(item =>
          item.product.itemNumber === product.itemNumber
            ? {
                ...item,
                pricing,
                isLoading: false,
                error: pricing.requiresContactForPrice ? 'Contact branch for pricing' : null,
              }
            : item
        ));
      } catch (err) {
        setCartItems(prev => prev.map(item =>
          item.product.itemNumber === product.itemNumber
            ? {
                ...item,
                isLoading: false,
                error: err instanceof Error ? err.message : 'Failed to get pricing',
              }
            : item
        ));
      }
    }
  }, [cartItems, selectedAccount, selectedBranch, organizationId]);

  const updateCartItemQuantity = useCallback(async (itemNumber: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemNumber);
      return;
    }

    setCartItems(prev => prev.map(item =>
      item.product.itemNumber === itemNumber
        ? { ...item, quantity, isLoading: !!selectedAccount && !!selectedBranch }
        : item
    ));

    if (selectedAccount && selectedBranch && organizationId) {
      const item = cartItems.find(i => i.product.itemNumber === itemNumber);
      if (!item) return;

      try {
        const pricing = await getItemPrice(
          {
            accountNumber: selectedAccount.accountNumber,
            branchNumber: selectedBranch.branchNumber,
            itemNumber,
            quantity,
            uom: item.uom,
          },
          organizationId
        );

        setCartItems(prev => prev.map(cartItem =>
          cartItem.product.itemNumber === itemNumber
            ? {
                ...cartItem,
                pricing,
                isLoading: false,
                error: pricing.requiresContactForPrice ? 'Contact branch for pricing' : null,
              }
            : cartItem
        ));
      } catch (err) {
        setCartItems(prev => prev.map(cartItem =>
          cartItem.product.itemNumber === itemNumber
            ? {
                ...cartItem,
                isLoading: false,
                error: err instanceof Error ? err.message : 'Failed to get pricing',
              }
            : cartItem
        ));
      }
    }
  }, [cartItems, selectedAccount, selectedBranch, organizationId]);

  const updateCartItemUom = useCallback(async (itemNumber: string, uom: string) => {
    setCartItems(prev => prev.map(item =>
      item.product.itemNumber === itemNumber
        ? { ...item, uom, isLoading: !!selectedAccount && !!selectedBranch }
        : item
    ));

    if (selectedAccount && selectedBranch && organizationId) {
      const item = cartItems.find(i => i.product.itemNumber === itemNumber);
      if (!item) return;

      try {
        const pricing = await getItemPrice(
          {
            accountNumber: selectedAccount.accountNumber,
            branchNumber: selectedBranch.branchNumber,
            itemNumber,
            quantity: item.quantity,
            uom,
          },
          organizationId
        );

        setCartItems(prev => prev.map(cartItem =>
          cartItem.product.itemNumber === itemNumber
            ? {
                ...cartItem,
                pricing,
                isLoading: false,
                error: pricing.requiresContactForPrice ? 'Contact branch for pricing' : null,
              }
            : cartItem
        ));
      } catch (err) {
        setCartItems(prev => prev.map(cartItem =>
          cartItem.product.itemNumber === itemNumber
            ? {
                ...cartItem,
                isLoading: false,
                error: err instanceof Error ? err.message : 'Failed to get pricing',
              }
            : cartItem
        ));
      }
    }
  }, [cartItems, selectedAccount, selectedBranch, organizationId]);

  const removeFromCart = useCallback((itemNumber: string) => {
    setCartItems(prev => prev.filter(item => item.product.itemNumber !== itemNumber));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const refreshPricing = useCallback(async () => {
    if (!selectedAccount || !selectedBranch || !organizationId || cartItems.length === 0) {
      return;
    }

    setCartItems(prev => prev.map(item => ({
      ...item,
      isLoading: true,
      error: null,
    })));

    try {
      const pricingResults = await getBatchPricing(
        cartItems.map(item => ({
          itemNumber: item.product.itemNumber,
          quantity: item.quantity,
          uom: item.uom,
        })),
        selectedAccount.accountNumber,
        selectedBranch.branchNumber,
        organizationId
      );

      setCartItems(prev => prev.map((item, index) => ({
        ...item,
        pricing: pricingResults[index] || null,
        isLoading: false,
        error: pricingResults[index]?.requiresContactForPrice
          ? 'Contact branch for pricing'
          : null,
      })));
    } catch (err) {
      setCartItems(prev => prev.map(item => ({
        ...item,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to refresh pricing',
      })));
    }
  }, [selectedAccount, selectedBranch, organizationId, cartItems]);

  const cartSubtotal = cartItems.reduce((sum, item) => {
    if (item.pricing?.isValid) {
      return sum + item.pricing.totalPrice;
    }
    return sum;
  }, 0);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const hasInvalidPricing = cartItems.some(
    item => !item.pricing?.isValid && !item.isLoading
  );

  const hasContactForPriceItems = cartItems.some(
    item => item.pricing?.requiresContactForPrice
  );

  const isReadyToOrder = !!(
    selectedAccount &&
    selectedBranch &&
    cartItems.length > 0 &&
    !hasInvalidPricing &&
    !hasContactForPriceItems &&
    !cartItems.some(item => item.isLoading)
  );

  const getValidationErrors = useCallback(() => {
    const errors: string[] = [];

    if (!selectedAccount) {
      errors.push('Please select a ship-to account');
    }
    if (!selectedBranch) {
      errors.push('Please select a branch');
    }
    if (cartItems.length === 0) {
      errors.push('Cart is empty');
    }
    if (hasInvalidPricing) {
      errors.push('Some items have invalid pricing');
    }
    if (hasContactForPriceItems) {
      errors.push('Some items require contacting the branch for pricing');
    }
    if (cartItems.some(item => item.isLoading)) {
      errors.push('Pricing is still loading');
    }

    return errors;
  }, [selectedAccount, selectedBranch, cartItems, hasInvalidPricing, hasContactForPriceItems]);

  const value: ABCSupplyContextType = {
    accounts,
    branches,
    selectedAccount,
    selectedBranch,
    cartItems,
    isLoadingAccounts,
    isLoadingBranches,
    accountsError,
    branchesError,
    selectAccount,
    selectBranch,
    addToCart,
    updateCartItemQuantity,
    updateCartItemUom,
    removeFromCart,
    clearCart,
    refreshPricing,
    cartSubtotal,
    cartItemCount,
    hasInvalidPricing,
    hasContactForPriceItems,
    isReadyToOrder,
    getValidationErrors,
    refreshAccounts,
    refreshBranches,
  };

  return (
    <ABCSupplyContext.Provider value={value}>
      {children}
    </ABCSupplyContext.Provider>
  );
}
