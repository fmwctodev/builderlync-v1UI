import React from 'react';
import { BookOpen } from 'lucide-react';
import {
  getCategoriesBySection,
  getFeaturedArticles,
  getArticleCount,
  getCategoryCount,
  SECTIONS,
} from '../data';
import { CategoryCard } from '../components/CategoryCard';
import { ArticleCard } from '../components/ArticleCard';
import { KbSearchInput } from '../components/KbSearchInput';

const Home: React.FC = () => {
  const groups = getCategoriesBySection();
  const featured = getFeaturedArticles(6);
  const totalArticles = getArticleCount();
  const totalCategories = getCategoryCount();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                BuilderLync Knowledge Base
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {totalArticles} articles · {totalCategories} categories · Updated continuously
              </p>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 max-w-3xl mb-6">
            Step-by-step guides, video walkthroughs, and reference docs for every part of
            BuilderLync. Search below or browse by module.
          </p>
          <KbSearchInput size="lg" />
        </div>
      </section>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Featured */}
        {featured.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Featured guides
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">Most-loaded help</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((a) => (
                <ArticleCard key={`${a.categorySlug}/${a.slug}`} article={a} />
              ))}
            </div>
          </section>
        )}

        {/* Categories grouped by section */}
        {groups.map((group) => {
          const sectionMeta = SECTIONS.find((s) => s.id === group.sectionId);
          if (!sectionMeta) return null;
          return (
            <section key={group.sectionId}>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {sectionMeta.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {sectionMeta.description}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.categories.map((c) => (
                  <CategoryCard key={c.slug} category={c} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
