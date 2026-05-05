import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { KbCategory } from '../data/types';
import { getArticlesByCategory } from '../data';

interface CategoryCardProps {
  category: KbCategory;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';
  const Icon = category.icon;
  const count = getArticlesByCategory(category.slug).length;

  return (
    <Link
      to={`${orgPrefix}/support/knowledge-base/${category.slug}`}
      className="group block p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 ${category.accent} dark:bg-opacity-20 rounded-lg flex items-center justify-center shrink-0`}
        >
          <Icon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            {category.name}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {category.description}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {count} article{count === 1 ? '' : 's'}
            </span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
};
