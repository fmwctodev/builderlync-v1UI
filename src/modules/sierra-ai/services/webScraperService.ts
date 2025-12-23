import { knowledgeBaseApi } from './knowledgeBaseApi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';

export interface WebSource {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  collection_id: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  last_scraped_at: string | null;
  error_message: string | null;
  metadata: Record<string, any>;
  auto_refresh: boolean;
  refresh_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  created_at: string;
  updated_at: string;
}

export interface ScrapeResult {
  success: boolean;
  title?: string;
  content?: string;
  chunks?: string[];
  metadata?: {
    description?: string;
    wordCount?: number;
  };
  error?: string;
}

export class WebScraperService {
  async scrapeUrl(url: string): Promise<ScrapeResult> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/knowledge-base/scrape-website`,
        { url, maxChunkSize: 1000 },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Web scraping error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async importFromUrl(
    url: string,
    collectionId: string,
    options?: {
      autoRefresh?: boolean;
      refreshFrequency?: 'daily' | 'weekly' | 'monthly' | 'never';
    }
  ): Promise<{ webSource: any; articles: any[] }> {
    const organizationId = localStorage.getItem('organization_id') || '';

    const scrapeResult = await this.scrapeUrl(url);

    if (!scrapeResult.success || !scrapeResult.content) {
      throw new Error(scrapeResult.error || 'Failed to scrape content');
    }

    const article = await knowledgeBaseApi.createArticle({
      organization_id: organizationId,
      title: scrapeResult.title || new URL(url).hostname,
      content: scrapeResult.content,
      source_url: url,
      status: 'published'
    });

    return {
      webSource: { url, title: scrapeResult.title },
      articles: [article]
    };
  }

  validateUrl(url: string): { valid: boolean; error?: string } {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }
}

export const webScraperService = new WebScraperService();
