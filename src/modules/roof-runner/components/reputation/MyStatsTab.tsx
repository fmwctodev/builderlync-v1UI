import React, { useState } from 'react';
import { Star, TrendingUp, Send } from 'lucide-react';

const MyStatsTab: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('This Week');

  const filters = ['This Week', 'This Month', 'This Year', 'Last Week', 'Last 6 Month'];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedFilter === filter
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Recap</h3>
          <div className="text-2xl mb-2">🤩</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Get chill AI summaries of customer reviews from your chosen Review Pages and time frames!
          </p>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Summary</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Customers find the fanpage content lacking and unengaging. However, they appreciate the potential of the video content creation services to enhance engagement and conversions.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-600">Google</span>
              <span className="text-blue-600">Facebook</span>
              <span className="text-gray-500">From 1 Reviews</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Invites Goal</h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">0</span>
              <span className="text-sm text-gray-500">0% out of 20</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Reviews Received</h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">0</span>
              <span className="text-sm text-gray-500">0% vs Previous 6 Months</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sentiment</h4>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">0</div>
                <div className="text-xs text-gray-500">0%</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">0</div>
                <div className="text-xs text-gray-500">0%</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Average Rating</h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">0</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} className="text-gray-300" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Start Growing your Online Visibility Today!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Get listed across 35+ Digital services Globally</p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Invite Trends</h4>
          <div className="h-32 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
            Chart placeholder
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Review Trends</h4>
          <div className="h-32 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
            Chart placeholder
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Latest Review Requests</h4>
          <div className="text-center py-8">
            <Send size={48} className="mx-auto text-gray-300 mb-4" />
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Start Sending Review Requests</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Send your first review request to start building credibility and attracting more customers.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Latest Reviews</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                BA
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Facebook</span>
                  <span className="text-xs text-gray-500">Bootcreative AI</span>
                  <span className="text-xs text-gray-500">886.digital</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={12} className="text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm font-medium ml-1">5</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Hi 886.digital! Your fanpage content is very sparse and boring. Boost Creatives AI can handle video content creation, freeing up your time to focus on running your business while still producing high-quality videos that drive conversions. 🤑4 Reasons Your Business Should Use Bootcreatives Ai Video: 💸 Create videos from many sources: websites, photos, text... 💸 Output high quality video up to 4k 60fps 💸 Creating diverse content helps maximize conversion rates 💸 Export videos quickly, simple to use 👉Get 14 Free Trial Days Now: https://www.facebook.com/1001497784955075?KN42gCTYd
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyStatsTab;