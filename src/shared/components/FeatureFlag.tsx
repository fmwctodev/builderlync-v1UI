import React from 'react';
import { useFeatureFlag } from '../hooks/useFeatureFlag';

interface FeatureFlagProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A declarative component to show/hide content based on a PostHog feature flag.
 * 
 * Usage:
 * <FeatureFlag flag="new-feature" fallback={<OldFeature />}>
 *   <NewFeature />
 * </FeatureFlag>
 */
export const FeatureFlag: React.FC<FeatureFlagProps> = ({ flag, children, fallback = null }) => {
  const isEnabled = useFeatureFlag(flag);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
