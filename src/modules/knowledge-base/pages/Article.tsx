import React, { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Mail } from 'lucide-react';
import {
  getArticleBySlug,
  getCategoryBySlug,
  getRelatedArticles,
} from '../data';
import { ArticleBody } from '../components/ArticleBody';
import { ArticleCard } from '../components/ArticleCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { VideoPlaceholder } from '../components/VideoPlaceholder';

const Article: React.FC = () => {
  const { orgSlug, categorySlug, articleSlug } = useParams<{
    orgSlug: string;
    categorySlug: string;
    articleSlug: string;
  }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [categorySlug, articleSlug]);

  if (!categorySlug || !articleSlug) {
    return <Navigate to={`${orgPrefix}/support/knowledge-base`} replace />;
  }

  const article = getArticleBySlug(categorySlug, articleSlug);
  const category = getCategoryBySlug(categorySlug);

  if (!article || !category) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Article not found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The article you're looking for doesn't exist or has been moved.
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

  const related = getRelatedArticles(article, 4);
  const updatedDate = new Date(article.updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Breadcrumbs
          crumbs={[
            {
              label: category.name,
              to: `${orgPrefix}/support/knowledge-base/${category.slug}`,
            },
          ]}
        />

        <Link
          to={`${orgPrefix}/support/knowledge-base/${category.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        >
          <ArrowLeft className="w-4 h-4" />
          All articles in {category.name}
        </Link>

        {/* Article body */}
        <article className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 md:p-10">
          <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {article.title}
            </h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">{article.summary}</p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {article.readMinutes && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {article.readMinutes} min read
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Updated {updatedDate}
              </span>
              {article.author && <span>By {article.author}</span>}
            </div>
            {article.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Primary video at top */}
          {article.primaryVideo && (
            <VideoPlaceholder
              description={article.primaryVideo.placeholder?.description ?? article.title}
              src={article.primaryVideo.src}
              caption={article.primaryVideo.placeholder?.description ?? article.title}
            />
          )}

          {/* Body */}
          <ArticleBody blocks={article.body} />
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Related articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} compact />
              ))}
            </div>
          </section>
        )}

        {/* Contact support */}
        <section className="mt-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Still need help?</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            We respond to support tickets within 24 hours.
          </p>
          <Link
            to={`${orgPrefix}/support`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Article;
