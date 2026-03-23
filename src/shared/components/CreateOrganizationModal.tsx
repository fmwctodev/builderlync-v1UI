import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizationsApi } from '../services/organizationsApi';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrganizationModal({ isOpen, onClose }: CreateOrganizationModalProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isSlugManuallyEdited && name) {
      const generatedSlug = organizationsApi.generateSlug(name);
      setSlug(generatedSlug);
    }
  }, [name, isSlugManuallyEdited]);

  useEffect(() => {
    if (slug.length >= 3) {
      const checkSlug = async () => {
        try {
          const available = await organizationsApi.checkSlugAvailability(slug);
          setSlugAvailable(available);
        } catch (err) {
          console.error('Error checking slug:', err);
        }
      };
      const timeoutId = setTimeout(checkSlug, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSlugAvailable(null);
    }
  }, [slug]);

  const handleSlugChange = (value: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(organizationsApi.generateSlug(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Organization name is required');
      return;
    }

    if (!slug.trim()) {
      setError('Organization slug is required');
      return;
    }

    if (slug.length < 3) {
      setError('Slug must be at least 3 characters long');
      return;
    }

    if (slugAvailable === false) {
      setError('This slug is already taken');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const org = await organizationsApi.createOrganization({
        name: name.trim(),
        slug: slug.trim(),
      });

      navigate(`/org/${org.slug}/dashboard`, {
        replace: true,
        state: {
          organizationId: org.id,
          organizationSlug: org.slug,
          organizationName: org.name
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Organization
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization Name
              </label>
              <input
                id="org-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                placeholder="Acme Roofing Inc."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="org-slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization URL
              </label>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                  builderlynk.com/org/
                </span>
                <div className="flex-1">
                  <input
                    id="org-slug"
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    disabled={isLoading}
                    placeholder="acme-roofing"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              {slug.length >= 3 && (
                <p className={`text-sm mt-1 ${
                  slugAvailable === true
                    ? 'text-green-600 dark:text-green-400'
                    : slugAvailable === false
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {slugAvailable === true && '✓ Slug is available'}
                  {slugAvailable === false && '✗ Slug is already taken'}
                  {slugAvailable === null && 'Checking availability...'}
                </p>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name || !slug || slugAvailable === false}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
