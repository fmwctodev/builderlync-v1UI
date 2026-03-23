import type {
  StormProviderInterface,
  StormEventQueryParams,
  StormEventResult,
  StormLayerResult
} from './types';

export interface HailTraceConfig {
  apiKey: string;
  baseUrl?: string;
}

export class HailTraceProvider implements StormProviderInterface {
  name = 'HailTrace';
  private apiKey: string;
  private baseUrl: string;

  constructor(config: HailTraceConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.hailtrace.com/v1';
  }

  async listEvents(params?: StormEventQueryParams): Promise<StormEventResult[]> {
    console.warn('HailTraceProvider.listEvents: Not implemented - requires API integration');
    throw new Error('HailTrace integration not yet implemented. Contact support for API access.');
  }

  async getEventById(externalId: string): Promise<StormEventResult | null> {
    console.warn('HailTraceProvider.getEventById: Not implemented - requires API integration');
    throw new Error('HailTrace integration not yet implemented. Contact support for API access.');
  }

  async getLayers(eventId: string): Promise<StormLayerResult[]> {
    console.warn('HailTraceProvider.getLayers: Not implemented - requires API integration');
    throw new Error('HailTrace integration not yet implemented. Contact support for API access.');
  }

  async getLayerGeoJSON(layerId: string): Promise<GeoJSON.FeatureCollection> {
    console.warn('HailTraceProvider.getLayerGeoJSON: Not implemented - requires API integration');
    throw new Error('HailTrace integration not yet implemented. Contact support for API access.');
  }

  async getLayerTileUrl(layerId: string): Promise<string> {
    console.warn('HailTraceProvider.getLayerTileUrl: Not implemented - requires API integration');
    throw new Error('HailTrace integration not yet implemented. Contact support for API access.');
  }

  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      console.warn('HailTraceProvider.testConnection: Not implemented - requires API integration');
      return false;
    } catch {
      return false;
    }
  }
}
