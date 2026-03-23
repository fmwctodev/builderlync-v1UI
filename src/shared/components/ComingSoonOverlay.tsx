import React from 'react';
import { Clock, Rocket, Construction } from 'lucide-react';

interface ComingSoonOverlayProps {
  message?: string;
  subtitle?: string;
  icon?: 'clock' | 'rocket' | 'construction';
  showNotifyButton?: boolean;
  onNotify?: () => void;
}

const ComingSoonOverlay: React.FC<ComingSoonOverlayProps> = ({
  message = 'Coming Soon',
  subtitle = 'This feature is currently under development and will be available soon.',
  icon = 'rocket',
  showNotifyButton = false,
  onNotify,
}) => {
  const renderIcon = () => {
    const iconProps = { size: 64, className: 'text-gray-400 dark:text-gray-500 mb-4' };

    switch (icon) {
      case 'clock':
        return <Clock {...iconProps} />;
      case 'construction':
        return <Construction {...iconProps} />;
      case 'rocket':
      default:
        return <Rocket {...iconProps} />;
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105">
        <div className="flex flex-col items-center">
          {renderIcon()}

          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {message}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mb-6 text-base leading-relaxed">
            {subtitle}
          </p>

          {showNotifyButton && (
            <button
              onClick={onNotify}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Notify Me When Ready
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComingSoonOverlay;
