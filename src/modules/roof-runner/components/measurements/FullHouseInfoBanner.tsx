import { Info, Home } from 'lucide-react';

interface FullHouseInfoBannerProps {
  isVisible: boolean;
}

export function FullHouseInfoBanner({ isVisible }: FullHouseInfoBannerProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-1.5 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
          <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Full House Selected
            </span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Full House includes roof (with penetrations), gutters, walls/siding, windows, and doors measurements.
            Individual measurement reports are disabled because they are included in this comprehensive package.
          </p>
        </div>
      </div>
    </div>
  );
}
