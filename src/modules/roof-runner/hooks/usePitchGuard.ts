import { useCallback } from 'react';
import { useInstantEstimator } from '../context/InstantEstimatorContext';
import { isPitchAvailable } from '../utils/pitchUtils';

export interface EnsurePitchOptions {
  requiresPitch: boolean;
  actionId: string;
  onContinue: () => void;
}

export function usePitchGuard() {
  const { effectivePitch, openPitchRequiredModal } = useInstantEstimator();

  const ensurePitchIfRequired = useCallback(
    (options: EnsurePitchOptions) => {
      const { requiresPitch, actionId, onContinue } = options;

      if (!requiresPitch) {
        onContinue();
        return;
      }

      if (isPitchAvailable(effectivePitch)) {
        onContinue();
        return;
      }

      openPitchRequiredModal(actionId, onContinue);
    },
    [effectivePitch, openPitchRequiredModal]
  );

  return { ensurePitchIfRequired };
}
