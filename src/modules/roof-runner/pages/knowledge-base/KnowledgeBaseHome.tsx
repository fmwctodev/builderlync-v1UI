import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Mail, MessageCircle } from 'lucide-react';
import {
  getAllCategories,
  getFeaturedArticles,
  getArticleCount,
} from '../../data/knowledgeBase';
import { CategoryCard } from './components/CategoryCard';
import { ArticleCard } from './components/ArticleCard';
import { KbSearchInput } from './components/KbSearchInput';

const KnowledgeBaseHome: React.FC = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';
  const categories = getAllCategories();
  const featured = getFeaturedArticles(6);
  const total = getArticleCount();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Link
            to={`${orgPrefix}/support`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Support
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {total} articles across {categories.length} modules · Updated continuously
              </p>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-3xl">
            Step-by-step guides, video walkthroughs, and reference docs for every part of
            BuilderLync. Search below or browse by module.
          </p>
          <KbSearchInput size="lg" />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
          {/* Featured */}
          {featured.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Featured guides
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Most useful for new accounts
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </section>
          )}

          {/* Categories */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Browse by module
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => (
                <CategoryCard key={c.slug} category={c} />
              ))}
            </div>
          </section>

          {/* Still need help */}
          <section className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Can't find what you need?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-5">
              Our team responds within 24 hours. Submit a ticket or chat with the AI assistant.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={`${orgPrefix}/support`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <Mail className="w-4 h-4" />
                Submit a ticket
              </Link>
              <Link
                to={`${orgPrefix}/support`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with assistant
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseHome;
