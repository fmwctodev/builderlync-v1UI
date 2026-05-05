import React from 'react';
import { Info, Lightbulb, AlertTriangle, Play } from 'lucide-react';
import type { KbBlock } from '../../../data/knowledgeBase';

interface ArticleBodyProps {
  blocks: KbBlock[];
}

/**
 * Read-only renderer for KbBlock[] article bodies.
 *
 * Why structured blocks instead of raw markdown?
 *  - Zero new dependencies
 *  - Consistent styling across every article
 *  - Easy to extend (add a new block type, render it once)
 *  - Migrates cleanly to a database later (one row per block)
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
            {block.title && (
              <div className={`font-semibold mb-1 ${styles.title}`}>{block.title}</div>
            )}
            <div className={`text-sm ${styles.body}`}>{block.text}</div>
          </div>
        </div>
      );
    }

    case 'video': {
      const src = block.src;
      // For known providers, ensure the embed URL is correct. Otherwise pass through.
      return (
        <figure className="my-2">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video border border-gray-200 dark:border-gray-700 shadow-sm">
            <iframe
              src={src}
              title={block.caption ?? 'Video'}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center flex items-center justify-center gap-1.5">
              <Play className="w-3 h-3" />
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'image':
      return (
        <figure className="my-2">
          <img
            src={block.src}
            alt={block.alt}
            className="rounded-lg border border-gray-200 dark:border-gray-700 max-w-full h-auto"
            loading="lazy"
          />
          {block.caption && (
            <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'steps':
      return (
        <ol className="space-y-3">
          {block.items.map((step, i) => (
            <li
              key={i}
              className="flex gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            >
              <div className="shrink-0 w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 flex items-center justify-center font-semibold text-sm">
                {i + 1}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white mb-0.5">
                  {step.title}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{step.text}</div>
              </div>
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

    default:
      // exhaustiveness guard — TS narrows `block` to never if all cases are handled
      return null;
  }
};
