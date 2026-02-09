import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendDirection?: 'up' | 'down';
  icon?: LucideIcon;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendDirection,
  icon: Icon,
  onClick,
}) => {
  return (
    <Card
      className={onClick ? 'cursor-pointer' : ''}
      hoverable={!!onClick}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              {trendDirection === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {Math.abs(trend)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="ml-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <Icon className="w-8 h-8 text-red-600" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
