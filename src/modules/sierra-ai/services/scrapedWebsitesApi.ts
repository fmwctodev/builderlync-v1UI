import { useCurrentOrganization } from '../../../shared/context/OrgContext';

export interface ScrapedWebsite {
  id: string;
  organization_id: string;
  domain_url: string;
  domain_type: string;
  status: string;
  created_at: string;
  last_scraped_at?: string;
  collection_id?: string;
}

export interface ScrapeWebsiteRequest {
  url: string;
  collection_id?: string;
  agent_id?: string;
}

class ScrapedWebsitesApi {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'X-Organization-Slug': localStorage.getItem('currentOrganizationSlug') || ''
    };
  }

  async getScrapedWebsites(): Promise<ScrapedWebsite[]> {
    const response = await fetch('/knowledge-base/scraped-websites', {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch scraped websites');
    }

    const result = await response.json();
    return result.data || [];
  }

  async scrapeWebsite(data: ScrapeWebsiteRequest): Promise<ScrapedWebsite> {
    const response = await fetch('/knowledge-base/scrape-website', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to scrape website');
    }

    const result = await response.json();
    return result.data;
  }

  async deleteScrapedWebsite(id: string): Promise<void> {
    const response = await fetch(`/knowledge-base/scraped-websites/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete scraped website');
    }
  }
}

export const scrapedWebsitesApi = new ScrapedWebsitesApi();
