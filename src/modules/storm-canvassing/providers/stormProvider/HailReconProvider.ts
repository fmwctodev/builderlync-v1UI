import type {
  StormProviderInterface,
  StormEventQueryParams,
  StormEventResult,
  StormLayerResult
} from './types';

export interface HailReconConfig {
  apiKey: string;
  baseUrl?: string;
}

export class HailReconProvider implements StormProviderInterface {
  name = 'Interactive Hail Maps / Hail Recon';
  private apiKey: string;
  private baseUrl: string;

  constructor(config: HailReconConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.interactivehailmaps.com/v1';
  }

  async listEvents(params?: StormEventQueryParams): Promise<StormEventResult[]> {
    console.warn('HailReconProvider.listEvents: Not implemented - requires API integration');
    throw new Error('Hail Recon integration not yet implemented. Contact support for API access.');
  }

  async getEventById(externalId: string): Promise<StormEventResult | null> {
    console.warn('HailReconProvider.getEventById: Not implemented - requires API integration');
    throw new Error('Hail Recon integration not yet implemented. Contact support for API access.');
  }

  async getLayers(eventId: string): Promise<StormLayerResult[]> {
    console.warn('HailReconProvider.getLayers: Not implemented - requires API integration');
    throw new Error('Hail Recon integration not yet implemented. Contact support for API access.');
  }

  async getLayerGeoJSON(layerId: string): Promise<GeoJSON.FeatureCollection> {
    console.warn('HailReconProvider.getLayerGeoJSON: Not implemented - requires API integration');
    throw new Error('Hail Recon integration not yet implemented. Contact support for API access.');
  }

  async getLayerTileUrl(layerId: string): Promise<string> {
    console.warn('HailReconProvider.getLayerTileUrl: Not implemented - requires API integration');
    throw new Error('Hail Recon integration not yet implemented. Contact support for API access.');
  }

  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      console.warn('HailReconProvider.testConnection: Not implemented - requires API integration');
      return false;
    } catch {
      return false;
    }
  }
}
