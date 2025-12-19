import { useState, useEffect, useCallback } from 'react';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { scrapedWebsitesApi, ScrapedWebsite, ScrapeWebsiteRequest } from '../services/scrapedWebsitesApi';

export function useScrapedWebsites() {
  const { currentOrganizationId } = useCurrentOrganization();
  const [websites, setWebsites] = useState<ScrapedWebsite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWebsites = useCallback(async () => {
    if (!currentOrganizationId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await scrapedWebsitesApi.getScrapedWebsites();
      setWebsites(data);
    } catch (err) {
      console.error('Error loading websites:', err);
      setError(err instanceof Error ? err.message : 'Failed to load scraped websites');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganizationId]);

  const scrapeWebsite = useCallback(async (data: ScrapeWebsiteRequest) => {
    try {
      setError(null);
      const newWebsite = await scrapedWebsitesApi.scrapeWebsite(data);
      setWebsites(prev => [newWebsite, ...prev]);
      return newWebsite;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scrape website';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteWebsite = useCallback(async (id: string) => {
    try {
      setError(null);
      await scrapedWebsitesApi.deleteScrapedWebsite(id);
      setWebsites(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete website';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    loadWebsites();
  }, [loadWebsites]);

  return {
    websites,
    isLoading,
    error,
    loadWebsites,
    scrapeWebsite,
    deleteWebsite,
    clearError: () => setError(null)
  };
}