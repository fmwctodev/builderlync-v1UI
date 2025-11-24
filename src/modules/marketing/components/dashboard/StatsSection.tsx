import React from 'react';
import { Stat } from '../../types';
import { Star, Globe, TrendingUp, Users } from 'lucide-react';

interface StatsSectionProps {
  stats: Stat[];
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const getIcon = (iconName: string) => {
    const props = { size: 24, className: 'text-white' };
    switch (iconName) {
      case 'Star': return <Star {...props} />;
      case 'Globe': return <Globe {...props} />;
      case 'TrendingUp': return <TrendingUp {...props} />;
      case 'Users': return <Users {...props} />;
      default: return <TrendingUp {...props} />;
    }
  };

  const getIconBg = (iconName: string) => {
    switch (iconName) {
      case 'Star': return 'bg-yellow-500';
      case 'Globe': return 'bg-primary-500';
      case 'TrendingUp': return 'bg-green-500';
      case 'Users': return 'bg-primary-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${getIconBg(stat.icon)}`}>
              {getIcon(stat.icon)}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-sm font-medium ${
              stat.change.type === 'increase' ? 'text-green-600' : 
              stat.change.type === 'decrease' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {stat.change.value}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              {stat.change.period}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};