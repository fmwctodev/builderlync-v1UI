export const MIN_PITCH = 1;
export const MAX_PITCH = 24;

export interface PitchValidationResult {
  valid: boolean;
  error?: string;
  numericValue?: number;
}

export function parsePitchValue(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) {
      return null;
    }
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (trimmed === '') {
      return null;
    }

    if (trimmed.includes(':')) {
      const parts = trimmed.split(':');
      if (parts.length === 2) {
        const rise = parseFloat(parts[0].trim());
        const run = parseFloat(parts[1].trim());
        if (!isNaN(rise) && !isNaN(run) && run !== 0) {
          return rise;
        }
      }
      return null;
    }

    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 2) {
        const rise = parseFloat(parts[0].trim());
        const run = parseFloat(parts[1].trim());
        if (!isNaN(rise) && !isNaN(run) && run !== 0) {
          return rise;
        }
      }
      return null;
    }

    const parsed = parseFloat(trimmed.replace(/[^\d.-]/g, ''));
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }

  if (typeof value === 'object' && value !== null && '#text' in value) {
    return parsePitchValue((value as Record<string, unknown>)['#text']);
  }

  return null;
}

export function getEffectivePitch(
  apiPitch: number | null,
  override: number | null
): number | null {
  if (override !== null) {
    return override;
  }
  return apiPitch;
}

export function validatePitch(value: string): PitchValidationResult {
  const trimmed = value.trim();

  if (trimmed === '') {
    return { valid: false, error: 'Pitch is required' };
  }

  const numericValue = Number(trimmed);

  if (isNaN(numericValue)) {
    return { valid: false, error: `Enter a pitch between ${MIN_PITCH} and ${MAX_PITCH}` };
  }

  if (!Number.isInteger(numericValue)) {
    return { valid: false, error: `Enter a pitch between ${MIN_PITCH} and ${MAX_PITCH}` };
  }

  if (numericValue < MIN_PITCH || numericValue > MAX_PITCH) {
    return { valid: false, error: `Enter a pitch between ${MIN_PITCH} and ${MAX_PITCH}` };
  }

  return { valid: true, numericValue };
}

export function isPitchAvailable(effectivePitch: number | null): boolean {
  return effectivePitch !== null;
}

export function formatPitchDisplay(pitch: number | null, isOverride: boolean = false): string {
  if (pitch === null) {
    return 'Not available';
  }
  const formatted = `${pitch}/12`;
  return isOverride ? `${formatted} (override)` : formatted;
}
