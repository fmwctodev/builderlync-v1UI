import React, { useState } from 'react';
import { useScrapedWebsites } from '../hooks/useScrapedWebsites';

export function ScrapedWebsites() {
  const { websites, isLoading, error, scrapeWebsite, deleteWebsite, clearError } = useScrapedWebsites();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !currentOrganizationId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await scrapeWebsite({ url });
      setUrl('');
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scraped website?')) return;

    try {
      await deleteWebsite(id);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Scrape Website
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting || !url.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Scraping...' : 'Scrape Website'}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Scraped Websites ({websites.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {websites.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No websites scraped yet. Add a URL above to get started.
            </div>
          ) : (
            websites.map((website) => (
              <div key={website.id} className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        website.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {website.domain_url}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Added {new Date(website.created_at).toLocaleDateString()}
                        {website.last_scraped_at && (
                          <span> • Last scraped {new Date(website.last_scraped_at).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDelete(website.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}