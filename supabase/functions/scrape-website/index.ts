import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ScrapeRequest {
  url: string;
  maxChunkSize?: number;
}

interface ScrapeResponse {
  success: boolean;
  title?: string;
  content?: string;
  chunks?: string[];
  metadata?: {
    description?: string;
    author?: string;
    publishedDate?: string;
    wordCount?: number;
  };
  error?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { url, maxChunkSize = 1000 }: ScrapeRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!isValidUrl(url)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid URL format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Sierra-AI-Bot/1.0 (Knowledge Base Scraper)',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'URL does not return HTML content',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const html = await response.text();
    const parsed = parseHtml(html);
    const chunks = chunkText(parsed.content, maxChunkSize);

    const result: ScrapeResponse = {
      success: true,
      title: parsed.title,
      content: parsed.content,
      chunks,
      metadata: {
        description: parsed.description,
        wordCount: parsed.content.split(/\s+/).length,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Scraping error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function parseHtml(html: string): { title: string; content: string; description?: string } {
  let title = '';
  let description = '';
  let content = '';

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    title = decodeHtml(titleMatch[1].trim());
  }

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (descMatch) {
    description = decodeHtml(descMatch[1]);
  }

  let cleanHtml = html.replace(/<script[^>]*>.*?<\/script>/gis, '');
  cleanHtml = cleanHtml.replace(/<style[^>]*>.*?<\/style>/gis, '');
  cleanHtml = cleanHtml.replace(/<nav[^>]*>.*?<\/nav>/gis, '');
  cleanHtml = cleanHtml.replace(/<header[^>]*>.*?<\/header>/gis, '');
  cleanHtml = cleanHtml.replace(/<footer[^>]*>.*?<\/footer>/gis, '');
  cleanHtml = cleanHtml.replace(/<aside[^>]*>.*?<\/aside>/gis, '');

  const articleMatch = cleanHtml.match(/<article[^>]*>(.*?)<\/article>/is);
  if (articleMatch) {
    cleanHtml = articleMatch[1];
  } else {
    const mainMatch = cleanHtml.match(/<main[^>]*>(.*?)<\/main>/is);
    if (mainMatch) {
      cleanHtml = mainMatch[1];
    }
  }

  content = cleanHtml.replace(/<[^>]+>/g, ' ');
  content = content.replace(/&nbsp;/g, ' ');
  content = content.replace(/&amp;/g, '&');
  content = content.replace(/&lt;/g, '<');
  content = content.replace(/&gt;/g, '>');
  content = content.replace(/&quot;/g, '"');
  content = content.replace(/&#39;/g, "'");
  content = content.replace(/\s+/g, ' ');
  content = content.trim();

  return { title, content, description };
}

function decodeHtml(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function chunkText(text: string, maxChunkSize: number): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}
