import { useState, useCallback, useRef } from 'react';
import type { ParsedHailAlert } from '../services/nwsApiService';

export interface StormToast {
  id: string;
  alert: ParsedHailAlert;
  timestamp: number;
}

const TOAST_DURATION_MS = 12_000;
const MAX_VISIBLE = 3;

export function useStormAlertToast() {
  const [toasts, setToasts] = useState<StormToast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((toastId: string) => {
    const timer = timersRef.current.get(toastId);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(toastId);
    }
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  const showAlertToasts = useCallback(
    (alerts: ParsedHailAlert[]) => {
      const newToasts: StormToast[] = alerts.slice(0, MAX_VISIBLE).map((alert) => ({
        id: `toast-${alert.id}-${Date.now()}`,
        alert,
        timestamp: Date.now(),
      }));

      setToasts((prev) => [...newToasts, ...prev].slice(0, MAX_VISIBLE));

      for (const toast of newToasts) {
        const timer = setTimeout(() => dismissToast(toast.id), TOAST_DURATION_MS);
        timersRef.current.set(toast.id, timer);
      }
    },
    [dismissToast]
  );

  return { toasts, showAlertToasts, dismissToast };
}
