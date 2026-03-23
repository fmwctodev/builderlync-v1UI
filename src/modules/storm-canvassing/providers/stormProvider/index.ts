import type { StormProvider } from '../../types';
import type { StormProviderInterface } from './types';
import { MockStormProvider } from './MockStormProvider';
import { HailTraceProvider } from './HailTraceProvider';
import { HailReconProvider } from './HailReconProvider';

export * from './types';
export { MockStormProvider } from './MockStormProvider';
export { HailTraceProvider } from './HailTraceProvider';
export { HailReconProvider } from './HailReconProvider';

export interface StormProviderConfig {
  provider: StormProvider;
  hailtraceApiKey?: string;
  hailReconApiKey?: string;
}

export function createStormProvider(config: StormProviderConfig): StormProviderInterface {
  switch (config.provider) {
    case 'HAILTRACE':
      if (!config.hailtraceApiKey) {
        console.warn('HailTrace API key not configured, falling back to Mock provider');
        return new MockStormProvider();
      }
      return new HailTraceProvider({ apiKey: config.hailtraceApiKey });

    case 'HAIL_RECON':
      if (!config.hailReconApiKey) {
        console.warn('Hail Recon API key not configured, falling back to Mock provider');
        return new MockStormProvider();
      }
      return new HailReconProvider({ apiKey: config.hailReconApiKey });

    case 'MOCK':
    default:
      return new MockStormProvider();
  }
}

export function getAvailableStormProviders(): Array<{
  id: StormProvider;
  name: string;
  description: string;
  requiresApiKey: boolean;
  documentationUrl?: string;
}> {
  return [
    {
      id: 'MOCK',
      name: 'Mock Provider',
      description: 'Sample storm data for testing and demo purposes',
      requiresApiKey: false,
    },
    {
      id: 'HAILTRACE',
      name: 'HailTrace',
      description: 'Professional hail tracking and storm data provider',
      requiresApiKey: true,
      documentationUrl: 'https://hailtrace.com',
    },
    {
      id: 'HAIL_RECON',
      name: 'Interactive Hail Maps / Hail Recon',
      description: 'Detailed hail swath mapping and storm intelligence',
      requiresApiKey: true,
      documentationUrl: 'https://interactivehailmaps.com',
    },
  ];
}
