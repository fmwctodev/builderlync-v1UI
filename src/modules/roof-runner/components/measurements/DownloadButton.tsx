import React, { useState } from 'react';
import { Download, FileText, FileJson, FileCode, Loader2 } from 'lucide-react';

type DownloadType = 'pdf' | 'json' | 'xml';

interface DownloadButtonProps {
  type: DownloadType;
  onClick: () => Promise<void>;
  disabled?: boolean;
  tooltipText?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
}

const typeConfig: Record<DownloadType, { label: string; icon: React.ReactNode }> = {
  pdf: {
    label: 'PDF',
    icon: <FileText className="h-4 w-4" />,
  },
  json: {
    label: 'JSON',
    icon: <FileJson className="h-4 w-4" />,
  },
  xml: {
    label: 'XML',
    icon: <FileCode className="h-4 w-4" />,
  },
};

export function DownloadButton({
  type,
  onClick,
  disabled = false,
  tooltipText,
  variant = 'secondary',
  size = 'sm',
}: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const config = typeConfig[type];

  const handleClick = async () => {
    if (disabled || isLoading) return;
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses =
    'inline-flex items-center gap-1.5 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses =
    variant === 'primary'
      ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-400'
      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400';

  const sizeClasses = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm';

  const disabledClasses = disabled ? 'cursor-not-allowed opacity-60' : '';

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      title={disabled ? tooltipText : `Download ${config.label}`}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {config.icon}
          <span>{config.label}</span>
          <Download className="h-3 w-3" />
        </>
      )}
    </button>
  );
}
