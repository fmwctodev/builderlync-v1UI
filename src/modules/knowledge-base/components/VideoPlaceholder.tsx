import React from 'react';
import { Play } from 'lucide-react';

interface VideoPlaceholderProps {
  description: string;
  /** Source URL when real media ships. */
  src?: string;
  caption?: string;
  /** Render at smaller size for inline use. */
  inline?: boolean;
}

/**
 * Video placeholder — shows "Video coming soon" until a real `src` ships.
 * When `src` is provided, renders an iframe at the same aspect ratio so layout
 * doesn't shift between draft and published states.
 */
export const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({
  description,
  src,
  caption,
  inline = false,
}) => {
  if (src) {
    return (
      <figure className={inline ? 'my-2' : 'my-4'}>
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video border border-gray-200 dark:border-gray-700 shadow-sm">
          <iframe
            src={src}
            title={caption ?? description}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        {caption && (
          <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className={inline ? 'my-2' : 'my-4'} data-kb-slot="video" data-kb-description={description}>
      <div className="relative rounded-lg overflow-hidden aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Play className="w-7 h-7 text-red-600 dark:text-red-400 fill-current" />
          </div>
          <div className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
            Video coming soon
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            {description}
          </div>
          <div className="mt-3 text-xs text-gray-400 dark:text-gray-500 font-mono">
            [drop-in: youtube embed URL]
          </div>
        </div>
      </div>
    </figure>
  );
};
