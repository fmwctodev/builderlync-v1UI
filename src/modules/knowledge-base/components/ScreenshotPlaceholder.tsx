import React from 'react';
import { Camera } from 'lucide-react';

interface ScreenshotPlaceholderProps {
  description: string;
  /** Source URL when real media ships. */
  src?: string;
  alt?: string;
  caption?: string;
  /** Render smaller — used inside step blocks. */
  inline?: boolean;
}

/**
 * Screenshot placeholder — shows a labeled gray box until a real `src`
 * ships. Distinct from VideoPlaceholder visually so authors can see at a
 * glance which articles still need media.
 */
export const ScreenshotPlaceholder: React.FC<ScreenshotPlaceholderProps> = ({
  description,
  src,
  alt,
  caption,
  inline = false,
}) => {
  if (src) {
    return (
      <figure className={inline ? 'my-2' : 'my-4'}>
        <img
          src={src}
          alt={alt ?? description}
          className="rounded-lg border border-gray-200 dark:border-gray-700 max-w-full h-auto shadow-sm"
          loading="lazy"
        />
        {caption && (
          <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure
      className={inline ? 'my-1' : 'my-3'}
      data-kb-slot="screenshot"
      data-kb-description={description}
    >
      <div
        className={`rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-3 ${
          inline ? 'p-3' : 'p-4'
        }`}
      >
        <div className="w-10 h-10 shrink-0 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <Camera className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
            Screenshot placeholder
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">{description}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-1">
            [drop-in: image URL]
          </div>
        </div>
      </div>
    </figure>
  );
};
