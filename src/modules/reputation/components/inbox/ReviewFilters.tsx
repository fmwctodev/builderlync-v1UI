import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { ReviewFilters, Platform } from '../../types';

interface Account {
  account_id: string;
  account_username: string | null;
  platform: string;
}

interface Props {
  filters: ReviewFilters;
  accounts: Account[];
  onChange: (filters: ReviewFilters) => void;
}

const PLATFORMS: { value: Platform | 'all'; label: string }[] = [
  { value: 'all', label: 'All Platforms' },
  { value: 'googlebusiness', label: 'Google Business' },
  { value: 'facebook', label: 'Facebook' },
];

export const ReviewFiltersPanel: React.FC<Props> = ({ filters, accounts, onChange }) => {
  const update = (partial: Partial<ReviewFilters>) => onChange({ ...filters, ...partial });

  return (
    <div className="flex flex-col gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search reviewer or review text…"
          value={filters.search ?? ''}
          onChange={(e) => update({ search: e.target.value || undefined })}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">
          Platform
        </label>
        <div className="flex flex-col gap-1">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              onClick={() => update({ platform: p.value as Platform | 'all' })}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                (filters.platform ?? 'all') === p.value
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">
          Min Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() =>
                update({ minRating: filters.minRating === n ? undefined : n })
              }
              className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                (filters.minRating ?? 0) === n
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">
          Reply Status
        </label>
        <div className="flex flex-col gap-1">
          {[
            { value: null, label: 'All' },
            { value: false, label: 'Needs Reply' },
            { value: true, label: 'Replied' },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => update({ hasReply: opt.value ?? undefined })}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                (filters.hasReply ?? null) === opt.value
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {accounts.length > 0 && (
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">
            Account
          </label>
          <select
            value={filters.accountId ?? ''}
            onChange={(e) => update({ accountId: e.target.value || undefined })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.account_id} value={a.account_id}>
                {a.account_username ?? a.account_id}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Sort
        </label>
        <div className="flex gap-2">
          <select
            value={filters.sortBy ?? 'date'}
            onChange={(e) => update({ sortBy: e.target.value as 'date' | 'rating' })}
            className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="date">Date</option>
            <option value="rating">Rating</option>
          </select>
          <select
            value={filters.sortOrder ?? 'desc'}
            onChange={(e) => update({ sortOrder: e.target.value as 'asc' | 'desc' })}
            className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => onChange({})}
        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline text-left"
      >
        Clear all filters
      </button>
    </div>
  );
};
