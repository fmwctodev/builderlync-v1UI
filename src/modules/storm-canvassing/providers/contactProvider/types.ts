import type { Door, ContactReveal } from '../../types';

export interface ContactProviderInterface {
  name: string;

  revealContact(door: Door): Promise<ContactRevealResult>;

  estimateCost?(door: Door): Promise<number>;

  testConnection(): Promise<boolean>;
}

export interface ContactRevealResult {
  name?: string;
  phones: string[];
  emails: string[];
  raw: Record<string, unknown>;
}

export function mapContactRevealResultToEntity(
  result: ContactRevealResult,
  organizationId: string,
  doorId: string,
  provider: 'MOCK' | 'HAILTRACE' | 'HAIL_RECON',
  userId: string,
  creditsUsed: number,
  cacheHours: number
): Partial<ContactReveal> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + cacheHours);

  return {
    organization_id: organizationId,
    door_id: doorId,
    provider,
    revealed_by: userId,
    credits_used: creditsUsed,
    name: result.name,
    phones: result.phones,
    emails: result.emails,
    fields_returned: result.raw,
    expires_at: expiresAt.toISOString(),
    cache_key: `${organizationId}:${doorId}`,
  };
}
