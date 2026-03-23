import { useMemo } from 'react';
import {
  getEnvironment,
  isNonProductionEnvironment,
  isStagingEnvironment,
  isDevelopmentEnvironment
} from '../config/featureFlags';

export function useEnvironment() {
  return useMemo(() => {
    const environment = getEnvironment();
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

    return {
      environment,
      hostname,
      isProduction: environment === 'production',
      isStaging: isStagingEnvironment(),
      isDevelopment: isDevelopmentEnvironment(),
      isNonProduction: isNonProductionEnvironment(),
    };
  }, []);
}
