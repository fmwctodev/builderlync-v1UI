import React from 'react';
import { BarChart, Grid, Thermometer, Star } from 'lucide-react';

const CompetitorAnalysisTab: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Analytics Chart</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Compare Your Business With Competitors</p>
        <p className="text-sm text-gray-500 mb-4">You can add up to 3 Competitors</p>
        <p className="text-gray-600 dark:text-gray-400">
          Compare your business's online reputation with top competitors across Google, Yelp, Facebook, and more. 
          Uncover insights that help you stand out and win trust.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart size={48} className="mx-auto mb-2" />
            <p>Analytics Chart Placeholder</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Insights You Can't Ignore 🚀
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <BarChart size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Score</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get a detailed breakdown of your website's performance load time, mobile optimisation, and web vitals
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Grid size={20} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Competitive Grid</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Competitive Grid</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Visualize and compare key reputation metrics in one easy grid. Build unlimited reports to monitor and outperform
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Thermometer size={20} className="text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Sentiment Heat-map</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sentiment Heat-map</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Quickly visualize customer sentiment by category. Use this to fine-tune your messaging and customer experience
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Star size={20} className="text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Rating by Source</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rating by Source</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              See how your ratings differ by platform. Identify trends and discover which channels need attention to improve your reputation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysisTab;