import { useMemo } from 'react';
import { FEATURE_FLAGS } from '../config/featureFlags';

export interface FeatureFlagsResult {
  jsonXmlDownloadsEnabled: boolean;
  showRawPropertyDataEnabled: boolean;
}

export function useFeatureFlags(): FeatureFlagsResult {
  return useMemo(() => ({
    jsonXmlDownloadsEnabled: FEATURE_FLAGS.JSON_XML_DOWNLOADS,
    showRawPropertyDataEnabled: FEATURE_FLAGS.SHOW_RAW_PROPERTY_DATA,
  }), []);
}
