import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Info, Lightbulb, AlertTriangle, ArrowRight } from 'lucide-react';
import type { KbBlock } from '../data/types';
import { getArticleBySlug } from '../data';
import { VideoPlaceholder } from './VideoPlaceholder';
import { ScreenshotPlaceholder } from './ScreenshotPlaceholder';

interface ArticleBodyProps {
  blocks: KbBlock[];
}

/**
 * Read-only renderer for KbBlock[] article bodies.
 *
 * Why structured blocks instead of markdown?
 *  - Zero new dependencies
 *  - Consistent styling
 *  - Easy to extend (add a new block type, render it once)
 *  - Migrates cleanly to a database later
 */
export const ArticleBody: React.FC<ArticleBodyProps> = ({ blocks }) => {
  return (
    <div className="space-y-4 text-gray-800 dark:text-gray-200 leading-relaxed">
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
    </div>
  );
};

const BlockRenderer: React.FC<{ block: KbBlock }> = ({ block }) => {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-base text-gray-700 dark:text-gray-300">{block.text}</p>;

    case 'heading':
      if (block.level === 2) {
        return (
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white pt-4">
            {block.text}
          </h2>
        );
      }
      return (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">{block.text}</h3>
      );

    case 'list':
      if (block.ordered) {
        return (
          <ol className="list-decimal pl-6 space-y-1.5 text-gray-700 dark:text-gray-300">
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="list-disc pl-6 space-y-1.5 text-gray-700 dark:text-gray-300">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case 'callout': {
      const tone = block.tone ?? 'info';
      const styles = {
        info: {
          wrap: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-900 dark:text-blue-100',
          body: 'text-blue-800 dark:text-blue-200',
          Icon: Info,
        },
        tip: {
          wrap: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
          icon: 'text-emerald-600 dark:text-emerald-400',
          title: 'text-emerald-900 dark:text-emerald-100',
          body: 'text-emerald-800 dark:text-emerald-200',
          Icon: Lightbulb,
        },
        warn: {
          wrap: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
          icon: 'text-amber-600 dark:text-amber-400',
          title: 'text-amber-900 dark:text-amber-100',
          body: 'text-amber-800 dark:text-amber-200',
          Icon: AlertTriangle,
        },
      }[tone];
      const Icon = styles.Icon;
      return (
        <div className={`flex gap-3 rounded-lg border p-4 ${styles.wrap}`}>
          <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${styles.icon}`} />
          <div className="min-w-0">
            {block.title && <div className={`font-semibold mb-1 ${styles.title}`}>{block.title}</div>}
            <div className={`text-sm ${styles.body}`}>{block.text}</div>
          </div>
        </div>
      );
    }

    case 'video':
      return (
        <VideoPlaceholder
          description={block.placeholder?.description ?? block.caption ?? 'Video'}
          src={block.src}
          caption={block.caption}
        />
      );

    case 'image':
      return (
        <ScreenshotPlaceholder
          description={block.placeholder?.description ?? block.alt}
          src={block.src}
          alt={block.alt}
          caption={block.caption}
        />
      );

    case 'screenshot':
      return (
        <ScreenshotPlaceholder
          description={block.placeholder?.description ?? block.alt}
          src={block.src}
          alt={block.alt}
          caption={block.caption}
        />
      );

    case 'steps':
      return (
        <ol className="space-y-3">
          {block.items.map((step, i) => (
            <li
              key={i}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            >
              <div className="flex gap-4">
                <div className="shrink-0 w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 flex items-center justify-center font-semibold text-sm">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white mb-0.5">
                    {step.title}
                  </div>
                  {step.text && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">{step.text}</div>
                  )}
                </div>
              </div>
              {step.screenshot && (
                <div className="mt-3 ml-11">
                  <ScreenshotPlaceholder
                    description={step.screenshot.description}
                    src={step.screenshot.src}
                    alt={step.screenshot.description}
                    inline
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      );

    case 'code':
      return (
        <pre className="rounded-lg bg-gray-900 dark:bg-black text-gray-100 text-sm p-4 overflow-x-auto border border-gray-800">
          <code>{block.text}</code>
        </pre>
      );

    case 'related':
      return <RelatedBlock articleSlugs={block.articleSlugs} />;

    default:
      return null;
  }
};

const RelatedBlock: React.FC<{
  articleSlugs: { categorySlug: string; articleSlug: string }[];
}> = ({ articleSlugs }) => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';

  const articles = articleSlugs
    .map((s) => getArticleBySlug(s.categorySlug, s.articleSlug))
    .filter((a): a is NonNullable<typeof a> => a !== null);

  if (articles.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
      {articles.map((a) => (
        <Link
          key={`${a.categorySlug}/${a.slug}`}
          to={`${orgPrefix}/support/knowledge-base/${a.categorySlug}/${a.slug}`}
          className="group flex items-start gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-300 dark:hover:border-red-700 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors text-sm">
              {a.title}
            </div>
            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {a.summary}
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
        </Link>
      ))}
    </div>
  );
};
