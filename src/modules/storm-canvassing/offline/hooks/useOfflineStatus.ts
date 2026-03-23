import { useState, useEffect, useCallback } from 'react';

export interface OfflineStatus {
  isOnline: boolean;
  isActuallyOnline: boolean;
  lastChecked: Date | null;
}

export function useOfflineStatus(checkInterval: number = 30000): OfflineStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isActuallyOnline, setIsActuallyOnline] = useState(navigator.onLine);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = useCallback(async () => {
    if (!navigator.onLine) {
      setIsActuallyOnline(false);
      setLastChecked(new Date());
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setIsActuallyOnline(response.ok);
    } catch {
      setIsActuallyOnline(false);
    }

    setLastChecked(new Date());
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsActuallyOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkConnection();

    const intervalId = setInterval(checkConnection, checkInterval);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [checkConnection, checkInterval]);

  return {
    isOnline,
    isActuallyOnline,
    lastChecked,
  };
}
