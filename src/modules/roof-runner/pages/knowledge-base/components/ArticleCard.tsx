import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, Play } from 'lucide-react';
import { type KbArticle } from '../../../data/knowledgeBase';

interface ArticleCardProps {
  article: KbArticle;
  /** If true, renders a more compact row layout (used in lists). */
  compact?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, compact = false }) => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';
  const href = `${orgPrefix}/support/knowledge-base/${article.categorySlug}/${article.slug}`;

  if (compact) {
    return (
      <Link
        to={href}
        className="group block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-all"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {article.title}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {article.summary}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
              {article.readMinutes && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readMinutes} min read
                </span>
              )}
              {article.primaryVideoUrl && (
                <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                  <Play className="w-3 h-3 fill-current" />
                  Video
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={href}
      className="group block p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:shadow-md transition-all h-full"
    >
      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
        {article.title}
      </h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
        {article.summary}
      </p>
      <div className="mt-4 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
        {article.readMinutes && (
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.readMinutes} min
          </span>
        )}
        {article.primaryVideoUrl && (
          <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
            <Play className="w-3 h-3 fill-current" />
            Video
          </span>
        )}
      </div>
    </Link>
  );
};
