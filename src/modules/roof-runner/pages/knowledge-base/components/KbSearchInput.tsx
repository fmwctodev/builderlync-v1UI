import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, X, FileText } from 'lucide-react';
import { searchArticles, type KbArticle } from '../../../data/knowledgeBase';

interface KbSearchInputProps {
  /** Visual size — `lg` is the hero version on the KB home. */
  size?: 'md' | 'lg';
  placeholder?: string;
}

/**
 * Search input with live results dropdown. Used at the top of the KB home
 * and at the top of each category page.
 */
export const KbSearchInput: React.FC<KbSearchInputProps> = ({
  size = 'lg',
  placeholder = 'Search the knowledge base…',
}) => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KbArticle[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setResults(searchArticles(query, 8));
    }, 80);
    return () => clearTimeout(t);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const isLg = size === 'lg';

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLg ? 'w-5 h-5' : 'w-4 h-4'} text-gray-400`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`w-full ${isLg ? 'pl-12 pr-12 py-4 text-lg' : 'pl-10 pr-10 py-2.5 text-sm'} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500`}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setOpen(false);
            }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLg ? 'w-7 h-7' : 'w-5 h-5'} flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded`}
            aria-label="Clear search"
          >
            <X className={isLg ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          </button>
        )}
      </div>

      {open && query && (
        <div className="absolute left-0 right-0 mt-2 z-30 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No results for "{query}". Try different keywords.
            </div>
          ) : (
            <ul className="py-1">
              {results.map((a) => (
                <li key={a.slug}>
                  <Link
                    to={`${orgPrefix}/support/knowledge-base/${a.categorySlug}/${a.slug}`}
                    onClick={() => {
                      setOpen(false);
                      setQuery('');
                    }}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {a.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {a.summary}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
