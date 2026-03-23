import { useState, useCallback } from 'react';
import type { ProductId, AddOnId } from '../types/measurementOrder';
import {
  formatAutoDeselectMessage,
  formatAddOnAutoDeselectMessage,
} from '../utils/productSelectionRules';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface UseProductSelectionToastReturn {
  toasts: ToastMessage[];
  showAutoDeselectToast: (deselectedProductId: ProductId, selectingProductId: ProductId) => void;
  showAddOnAutoDeselectToast: (addOnId: AddOnId, productId: ProductId) => void;
  showClearAllToast: () => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

let toastIdCounter = 0;

export function useProductSelectionToast(): UseProductSelectionToastReturn {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${++toastIdCounter}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const showAutoDeselectToast = useCallback(
    (deselectedProductId: ProductId, selectingProductId: ProductId) => {
      const message = formatAutoDeselectMessage(deselectedProductId, selectingProductId);
      addToast(message, 'info');
    },
    [addToast]
  );

  const showAddOnAutoDeselectToast = useCallback(
    (addOnId: AddOnId, productId: ProductId) => {
      const message = formatAddOnAutoDeselectMessage(addOnId, productId);
      addToast(message, 'info');
    },
    [addToast]
  );

  const showClearAllToast = useCallback(() => {
    addToast('All selections cleared.', 'info');
  }, [addToast]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showAutoDeselectToast,
    showAddOnAutoDeselectToast,
    showClearAllToast,
    dismissToast,
    clearAllToasts,
  };
}
