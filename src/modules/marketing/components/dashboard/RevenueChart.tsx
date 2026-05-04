import React from 'react';
import { BarChart3 } from 'lucide-react';

interface RevenueChartProps {
  title: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ title }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="p-6">
        <div className="h-64 flex items-center justify-center bg-paper dark:bg-canvas rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};