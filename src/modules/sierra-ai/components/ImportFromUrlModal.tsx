import React, { useState } from 'react';
import { X, Globe, AlertCircle, CheckCircle, Loader, ChevronDown } from 'lucide-react';
import { knowledgeBaseApi } from '../services/knowledgeBaseApi';


type CrawlType = 'exact' | 'path' | 'domain';

interface ImportFromUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Array<{ id: string; name: string }>;
  onSuccess: (result: { webSource: any; articles: any[] }) => void;
  agentId?: string;
  organizationId?: string;
}

export function ImportFromUrlModal({
  isOpen,
  onClose,
  collections,
  onSuccess,
  agentId,
  organizationId: propOrganizationId,
}: ImportFromUrlModalProps) {
  const [url, setUrl] = useState('');
  const [crawlType, setCrawlType] = useState<CrawlType>('exact');
  const [showCrawlTypeDropdown, setShowCrawlTypeDropdown] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshFrequency, setRefreshFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const crawlTypeOptions = [
    { value: 'exact', label: 'Exact URL' },
    { value: 'path', label: 'Path & Sub-paths' },
    { value: 'domain', label: 'Entire Domain' },
  ] as const;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }
    // const organizationId = propOrganizationId || localStorage.getItem('currentOrganizationId');
    const user = localStorage.getItem('user');
    const organizationId = JSON.parse(user || '{}')?.companySlug;

    if (!organizationId) {
      setError('Organization not found. Please refresh the page.');
      return;
    }

    setLoading(true);

    try {
      const result = await knowledgeBaseApi.scrapeWebsite({
        url,
        organization_id: organizationId,
        agent_id: agentId
      });

      if (agentId) {
        try {
          const { vapiApi } = await import('../services/vapiApi');
          await vapiApi.addKnowledgeBaseUrl(agentId, url, "Scraped: " + (new URL(url).hostname));
        } catch (VapiError) {
          console.error("Failed to add to Vapi KB:", VapiError);
          // Don't fail the whole operation if just EL fails, but maybe notify user?
        }
      }

      setSuccess(true);
      onSuccess({ webSource: result, articles: [] }); // Adapt to expected format

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape website');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setCrawlType('exact');
    setShowCrawlTypeDropdown(false);
    setSelectedCollection('');
    setAutoRefresh(false);
    setRefreshFrequency('weekly');
    setError('');
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />

        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Web Crawler
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Crawl and extract content from a website to train your bot.
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-base font-semibold text-gray-900 dark:text-white mb-3">
                Enter Domain
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCrawlTypeDropdown(!showCrawlTypeDropdown)}
                    className="w-full px-4 py-3 border-2 border-red-500 dark:border-red-400 rounded-lg text-left flex items-center justify-between bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    disabled={loading}
                  >
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {crawlTypeOptions.find(opt => opt.value === crawlType)?.label}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCrawlTypeDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showCrawlTypeDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                      {crawlTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setCrawlType(option.value);
                            setShowCrawlTypeDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${crawlType === option.value
                            ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                            : 'text-gray-900 dark:text-white'
                            } ${option.value === crawlTypeOptions[crawlTypeOptions.length - 1].value ? 'rounded-b-lg' : ''} ${option.value === crawlTypeOptions[0].value ? 'rounded-t-lg' : ''}`}
                        >
                          {option.label}
                          {crawlType === option.value && (
                            <CheckCircle className="w-4 h-4 inline ml-2 text-red-600 dark:text-red-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter URL"
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Collection
              </label>
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="">Select a collection</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                  disabled={loading}
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-700 dark:text-gray-300">
                  Automatically refresh content
                </label>
              </div>

              {autoRefresh && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Refresh Frequency
                  </label>
                  <select
                    value={refreshFrequency}
                    onChange={(e) => setRefreshFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    disabled={loading}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  Content imported successfully!
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  'Extract Data'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
