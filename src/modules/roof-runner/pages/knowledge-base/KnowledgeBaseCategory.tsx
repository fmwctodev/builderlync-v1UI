import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import {
  getCategoryBySlug,
  getArticlesByCategory,
} from '../../data/knowledgeBase';
import { ArticleCard } from './components/ArticleCard';
import { KbSearchInput } from './components/KbSearchInput';

const KnowledgeBaseCategory: React.FC = () => {
  const { orgSlug, categorySlug } = useParams<{ orgSlug: string; categorySlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';

  if (!categorySlug) {
    return <Navigate to={`${orgPrefix}/support/knowledge-base`} replace />;
  }

  const category = getCategoryBySlug(categorySlug);
  if (!category) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Category not found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The category "{categorySlug}" doesn't exist or has been moved.
        </p>
        <Link
          to={`${orgPrefix}/support/knowledge-base`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
        >
          Back to Knowledge Base
        </Link>
      </div>
    );
  }

  const articles = getArticlesByCategory(category.slug);
  const Icon = category.icon;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link
              to={`${orgPrefix}/support/knowledge-base`}
              className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <Home className="w-3.5 h-3.5" />
              Knowledge Base
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-medium">{category.name}</span>
          </nav>

          <div className="flex items-start gap-4 mb-6">
            <div
              className={`w-12 h-12 ${category.accent} dark:bg-opacity-20 rounded-lg flex items-center justify-center shrink-0`}
            >
              <Icon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {category.name}
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{category.description}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                {articles.length} article{articles.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <KbSearchInput size="md" placeholder={`Search ${category.name}…`} />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link
            to={`${orgPrefix}/support/knowledge-base`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            All categories
          </Link>

          {articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400">
                No articles in this category yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((a) => (
                <ArticleCard key={a.slug} article={a} compact />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseCategory;
