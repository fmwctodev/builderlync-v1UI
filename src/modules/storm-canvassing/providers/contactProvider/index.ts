import type { ContactProvider } from '../../types';
import type { ContactProviderInterface } from './types';
import { MockContactProvider } from './MockContactProvider';

export * from './types';
export { MockContactProvider } from './MockContactProvider';

export interface ContactProviderConfig {
  provider: ContactProvider;
  hailtraceApiKey?: string;
  hailReconApiKey?: string;
}

export function createContactProvider(config: ContactProviderConfig): ContactProviderInterface {
  switch (config.provider) {
    case 'HAILTRACE':
      console.warn('HailTrace contact provider not yet implemented, using Mock provider');
      return new MockContactProvider();

    case 'HAIL_RECON':
      console.warn('Hail Recon contact provider not yet implemented, using Mock provider');
      return new MockContactProvider();

    case 'MOCK':
    default:
      return new MockContactProvider();
  }
}

export function getAvailableContactProviders(): Array<{
  id: ContactProvider;
  name: string;
  description: string;
  requiresApiKey: boolean;
  costPerReveal?: number;
}> {
  return [
    {
      id: 'MOCK',
      name: 'Mock Provider',
      description: 'Sample contact data for testing and demo purposes',
      requiresApiKey: false,
      costPerReveal: 1,
    },
    {
      id: 'HAILTRACE',
      name: 'HailTrace Contacts',
      description: 'Property owner contact lookup via HailTrace API',
      requiresApiKey: true,
      costPerReveal: 1,
    },
    {
      id: 'HAIL_RECON',
      name: 'Hail Recon Contacts',
      description: 'Property owner contact lookup via Hail Recon API',
      requiresApiKey: true,
      costPerReveal: 1,
    },
  ];
}
