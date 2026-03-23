import type {
  StormProviderInterface,
  StormEventQueryParams,
  StormEventResult,
  StormLayerResult
} from './types';

const MOCK_EVENTS: StormEventResult[] = [
  {
    externalId: 'mock-denver-2024-06',
    name: 'Denver Metro Hail Storm - June 2024',
    description: 'Severe hailstorm affecting Denver metro area with hail up to 2.5 inches',
    eventDate: new Date('2024-06-15'),
    eventStart: new Date('2024-06-15T14:30:00Z'),
    eventEnd: new Date('2024-06-15T18:45:00Z'),
    bbox: {
      minLng: -105.1,
      minLat: 39.6,
      maxLng: -104.8,
      maxLat: 39.85,
    },
    centerLat: 39.7392,
    centerLng: -104.9903,
    metadata: {
      maxHailSize: 2.5,
      affectedCounties: ['Denver', 'Adams', 'Jefferson'],
      estimatedDamage: '$50M+',
    },
  },
  {
    externalId: 'mock-dallas-2024-05',
    name: 'Dallas-Fort Worth Hail Storm - May 2024',
    description: 'Large hail event across DFW metroplex',
    eventDate: new Date('2024-05-28'),
    eventStart: new Date('2024-05-28T19:00:00Z'),
    eventEnd: new Date('2024-05-28T23:30:00Z'),
    bbox: {
      minLng: -97.1,
      minLat: 32.6,
      maxLng: -96.5,
      maxLat: 33.1,
    },
    centerLat: 32.7767,
    centerLng: -96.7970,
    metadata: {
      maxHailSize: 3.0,
      affectedCounties: ['Dallas', 'Tarrant', 'Collin', 'Denton'],
      estimatedDamage: '$100M+',
    },
  },
  {
    externalId: 'mock-okc-2024-04',
    name: 'Oklahoma City Severe Storm - April 2024',
    description: 'Tornado and hail producing supercell',
    eventDate: new Date('2024-04-20'),
    eventStart: new Date('2024-04-20T20:15:00Z'),
    eventEnd: new Date('2024-04-21T01:00:00Z'),
    bbox: {
      minLng: -97.7,
      minLat: 35.3,
      maxLng: -97.3,
      maxLat: 35.6,
    },
    centerLat: 35.4676,
    centerLng: -97.5164,
    metadata: {
      maxHailSize: 2.0,
      tornadoConfirmed: true,
      affectedCounties: ['Oklahoma', 'Cleveland'],
      estimatedDamage: '$75M+',
    },
  },
];

const MOCK_LAYERS: Record<string, StormLayerResult[]> = {
  'mock-denver-2024-06': [
    {
      externalId: 'mock-denver-hail-layer',
      name: 'Hail Swath - Denver',
      layerType: 'HAIL',
      format: 'GEOJSON',
      minThreshold: 0.5,
      maxThreshold: 2.5,
      style: {
        fillOpacity: 0.5,
        strokeColor: '#333333',
        strokeWidth: 1,
      },
    },
  ],
  'mock-dallas-2024-05': [
    {
      externalId: 'mock-dallas-hail-layer',
      name: 'Hail Swath - Dallas',
      layerType: 'HAIL',
      format: 'GEOJSON',
      minThreshold: 0.75,
      maxThreshold: 3.0,
      style: {
        fillOpacity: 0.5,
        strokeColor: '#333333',
        strokeWidth: 1,
      },
    },
  ],
  'mock-okc-2024-04': [
    {
      externalId: 'mock-okc-hail-layer',
      name: 'Hail Swath - OKC',
      layerType: 'HAIL',
      format: 'GEOJSON',
      minThreshold: 0.5,
      maxThreshold: 2.0,
      style: {
        fillOpacity: 0.5,
        strokeColor: '#333333',
        strokeWidth: 1,
      },
    },
    {
      externalId: 'mock-okc-tornado-layer',
      name: 'Tornado Path - OKC',
      layerType: 'TORNADO',
      format: 'GEOJSON',
      style: {
        fillColor: '#FF0000',
        fillOpacity: 0.7,
        strokeColor: '#990000',
        strokeWidth: 2,
      },
    },
  ],
};

function generateHailSwathGeoJSON(
  centerLng: number,
  centerLat: number,
  externalId: string
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  const hailSizes = [0.75, 1.0, 1.5, 2.0, 2.5];

  hailSizes.forEach((size, index) => {
    const radius = 0.02 + index * 0.015;
    const offset = index * 0.01;
    const points = 32;
    const coordinates: number[][] = [];

    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const lng = centerLng + offset + radius * Math.cos(angle) * (1 + Math.random() * 0.2);
      const lat = centerLat + radius * 0.7 * Math.sin(angle) * (1 + Math.random() * 0.2);
      coordinates.push([lng, lat]);
    }
    coordinates.push(coordinates[0]);

    features.push({
      type: 'Feature',
      properties: {
        hailSize: size,
        hailSizeCategory: size < 1 ? 'small' : size < 1.5 ? 'medium' : size < 2 ? 'large' : 'giant',
        intensity: Math.round((size / 3) * 100),
        timestamp: new Date().toISOString(),
        layerId: externalId,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates],
      },
    });
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

function generateTornadoPathGeoJSON(
  centerLng: number,
  centerLat: number
): GeoJSON.FeatureCollection {
  const pathLength = 0.15;
  const pathWidth = 0.005;
  const startLng = centerLng - pathLength / 2;
  const endLng = centerLng + pathLength / 2;

  const coordinates = [
    [startLng, centerLat - pathWidth],
    [startLng, centerLat + pathWidth],
    [endLng, centerLat + pathWidth * 1.5],
    [endLng, centerLat - pathWidth * 1.5],
    [startLng, centerLat - pathWidth],
  ];

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          efRating: 'EF2',
          pathLengthMiles: 8.5,
          maxWidthYards: 400,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      },
    ],
  };
}

export class MockStormProvider implements StormProviderInterface {
  name = 'Mock Storm Provider';

  async listEvents(params?: StormEventQueryParams): Promise<StormEventResult[]> {
    let results = [...MOCK_EVENTS];

    if (params?.dateRange) {
      const [start, end] = params.dateRange;
      results = results.filter((event) => {
        if (!event.eventDate) return true;
        return event.eventDate >= start && event.eventDate <= end;
      });
    }

    if (params?.bbox) {
      const { minLng, minLat, maxLng, maxLat } = params.bbox;
      results = results.filter((event) => {
        if (!event.centerLng || !event.centerLat) return true;
        return (
          event.centerLng >= minLng &&
          event.centerLng <= maxLng &&
          event.centerLat >= minLat &&
          event.centerLat <= maxLat
        );
      });
    }

    if (params?.limit) {
      results = results.slice(0, params.limit);
    }

    return results;
  }

  async getEventById(externalId: string): Promise<StormEventResult | null> {
    return MOCK_EVENTS.find((e) => e.externalId === externalId) || null;
  }

  async getLayers(eventId: string): Promise<StormLayerResult[]> {
    return MOCK_LAYERS[eventId] || [];
  }

  async getLayerGeoJSON(layerId: string): Promise<GeoJSON.FeatureCollection> {
    for (const [eventId, layers] of Object.entries(MOCK_LAYERS)) {
      const layer = layers.find((l) => l.externalId === layerId);
      if (layer) {
        const event = MOCK_EVENTS.find((e) => e.externalId === eventId);
        if (event && event.centerLng && event.centerLat) {
          if (layer.layerType === 'TORNADO') {
            return generateTornadoPathGeoJSON(event.centerLng, event.centerLat);
          }
          return generateHailSwathGeoJSON(event.centerLng, event.centerLat, layerId);
        }
      }
    }

    return { type: 'FeatureCollection', features: [] };
  }

  async testConnection(): Promise<boolean> {
    return true;
  }
}
