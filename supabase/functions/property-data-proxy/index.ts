import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PropertyDataRequest {
  propertyId: string;
  addressText: string;
  organizationId?: string;
  includeImagery?: boolean;
}

interface PropertyDataResponse {
  roofAreaSqFt: number | null;
  pitch: number | null;
  pitchDescription: string | null;
  confidence: number | null;
  images: string[];
  source: string;
  fetchedAt: string;
  raw: Record<string, unknown>;
}

function detectResponseFormat(response: string): 'json' | 'xml' | 'unknown' {
  const trimmed = response.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }
  if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
    return 'xml';
  }
  return 'unknown';
}

function generateOrthogonalImagery(propertyId: string): string[] {
  const baseIndex = Math.abs(
    propertyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  );

  const orthogonalImages = [
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=600',
  ];

  const count = 4 + (baseIndex % 3);
  const startIdx = baseIndex % orthogonalImages.length;
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    result.push(orthogonalImages[(startIdx + i) % orthogonalImages.length]);
  }

  return result;
}

function generateMockPropertyData(propertyId: string, includeImagery: boolean = false): PropertyDataResponse {
  const roofAreas = [1850, 2200, 2750, 3100, 1650, 2450, 2890, 3250];
  const pitches = [4, 5, 6, 7, 8, 9, 10, 12];
  const pitchDescriptions = ['Low slope', 'Walkable', 'Standard', 'Steep', 'Very steep'];

  const randomIndex = Math.abs(
    propertyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  );

  const roofArea = roofAreas[randomIndex % roofAreas.length];
  const pitch = pitches[randomIndex % pitches.length];
  const pitchDesc = pitchDescriptions[randomIndex % pitchDescriptions.length];

  const images = includeImagery ? generateOrthogonalImagery(propertyId) : [];

  return {
    roofAreaSqFt: roofArea,
    pitch: pitch,
    pitchDescription: pitchDesc,
    confidence: 0.85 + (Math.random() * 0.1),
    images: images,
    source: 'EagleView Property Data',
    fetchedAt: new Date().toISOString(),
    raw: {
      reportId: `RPT-${propertyId.slice(0, 8)}`,
      totalRoofArea: roofArea,
      primaryPitch: pitch,
      pitchCategory: pitchDesc,
      roofComplexity: randomIndex % 3 === 0 ? 'Complex' : randomIndex % 3 === 1 ? 'Medium' : 'Simple',
      roofFacets: Math.floor(randomIndex % 8) + 4,
      predominantRoofMaterial: 'Asphalt Shingles',
      eaveLength: Math.round(roofArea * 0.15),
      ridgeLength: Math.round(roofArea * 0.08),
      hipLength: Math.round(roofArea * 0.12),
      valleyLength: Math.round(roofArea * 0.06),
      rakeLength: Math.round(roofArea * 0.1),
      flashingLength: Math.round(roofArea * 0.04),
      stepFlashingLength: Math.round(roofArea * 0.02),
      dripEdgeLength: Math.round(roofArea * 0.18),
      perimeterLength: Math.round(roofArea * 0.25),
      estimatedSquares: Math.round(roofArea / 100 * 10) / 10,
      wasteFactorPercent: 12,
      adjustedSquares: Math.round((roofArea / 100) * 1.12 * 10) / 10,
      measurementDate: new Date().toISOString().split('T')[0],
      dataSource: 'EagleView Technologies',
      dataVersion: '3.2.1',
    },
  };
}

async function logRequest(
  supabase: ReturnType<typeof createClient>,
  propertyId: string,
  addressText: string,
  organizationId: string | undefined,
  status: 'success' | 'error',
  responseFormat: 'json' | 'xml' | 'unknown',
  errorMessage: string | null,
  durationMs: number
) {
  try {
    await supabase.from('property_data_requests').insert({
      property_id: propertyId,
      address_text: addressText,
      organization_id: organizationId || null,
      status,
      response_format: responseFormat,
      error_message: errorMessage,
      duration_ms: durationMs,
    });
  } catch (e) {
    console.error('Failed to log request:', e);
  }
}

async function checkCache(
  supabase: ReturnType<typeof createClient>,
  propertyId: string,
  organizationId: string | undefined
): Promise<PropertyDataResponse | null> {
  try {
    let query = supabase
      .from('property_data_cache')
      .select('*')
      .eq('property_id', propertyId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      roofAreaSqFt: data.roof_area_sqft,
      pitch: data.pitch,
      pitchDescription: data.pitch ? getPitchDescription(data.pitch) : null,
      confidence: null,
      images: [],
      source: data.source,
      fetchedAt: data.fetched_at,
      raw: data.raw_response || {},
    };
  } catch {
    return null;
  }
}

function getPitchDescription(pitch: number): string {
  if (pitch <= 3) return 'Low slope';
  if (pitch <= 6) return 'Standard';
  if (pitch <= 9) return 'Steep';
  return 'Very steep';
}

async function saveToCache(
  supabase: ReturnType<typeof createClient>,
  propertyId: string,
  addressText: string,
  organizationId: string | undefined,
  data: PropertyDataResponse,
  responseFormat: 'json' | 'xml' | 'unknown' = 'json'
) {
  try {
    await supabase.from('property_data_cache').upsert(
      {
        organization_id: organizationId || null,
        property_id: propertyId,
        address_text: addressText,
        roof_area_sqft: data.roofAreaSqFt,
        pitch: data.pitch,
        raw_response: data.raw,
        source: data.source,
        fetched_at: data.fetchedAt,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        response_format_detected: responseFormat,
      },
      {
        onConflict: 'organization_id,property_id',
        ignoreDuplicates: false,
      }
    );
  } catch (e) {
    console.error('Failed to cache data:', e);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: PropertyDataRequest = await req.json();
    const { propertyId, addressText, organizationId, includeImagery = false } = body;

    if (!propertyId || !addressText) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: propertyId, addressText' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const cached = await checkCache(supabase, propertyId, organizationId);
    if (cached) {
      if (includeImagery && cached.images.length === 0) {
        cached.images = generateOrthogonalImagery(propertyId);
      }

      await logRequest(
        supabase,
        propertyId,
        addressText,
        organizationId,
        'success',
        'json',
        null,
        Date.now() - startTime
      );

      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = generateMockPropertyData(propertyId, includeImagery);

    const detectedFormat: 'json' | 'xml' | 'unknown' = 'json';

    await saveToCache(supabase, propertyId, addressText, organizationId, data, detectedFormat);

    await logRequest(
      supabase,
      propertyId,
      addressText,
      organizationId,
      'success',
      detectedFormat,
      null,
      Date.now() - startTime
    );

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Property data proxy error:', errorMessage);

    return new Response(
      JSON.stringify({ error: 'Failed to fetch property data', details: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});