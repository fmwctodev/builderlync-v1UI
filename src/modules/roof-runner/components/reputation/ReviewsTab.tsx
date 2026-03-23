import React, { useState } from 'react';
import { Send, Bot, Search, Calendar, ChevronDown, X, Star } from 'lucide-react';
import AISummaryModal from './AISummaryModal';

interface ReviewsTabProps {
  onOpenModal: () => void;
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({ onOpenModal }) => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    rating: '',
    source: '',
    startDate: '',
    endDate: ''
  });

  return (
    <div className="bg-white dark:bg-gray-800">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reviews</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Bot size={16} />
              AI Summary
            </button>
            <button
              onClick={onOpenModal}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Send size={16} />
              Send Review Request
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex gap-4 mb-6">
          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Rating</option>
            <option value="4-5">Between 4 and 5</option>
            <option value="3-4">Between 3 and 4</option>
            <option value="2-3">Between 2 and 3</option>
            <option value="1-2">Between 1 and 2</option>
          </select>

          <select
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Source</option>
            <option value="all">All</option>
            <option value="google">All Google Pages</option>
            <option value="facebook">All Facebook pages</option>
            <option value="melbourne">866 Digital - Melbourne VIC</option>
            <option value="886digital">886.digital</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
            placeholder="Start Date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
            placeholder="End Date"
          />

          <button
            onClick={() => setFilters({ rating: '', source: '', startDate: '', endDate: '' })}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear filters
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="space-y-4">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-primary-600">✨</div>
                  <h3 className="font-medium text-primary-700">AI Summary (Default)</h3>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">
                The reviews indicate highly positive feedback on video content quality and creation speed, while also{' '}
                <span className="text-primary-600 cursor-pointer font-medium">See More</span>
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1 bg-primary-100 text-red-700 px-2 py-1 rounded-full text-xs">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  video content
                </div>
                <div className="flex items-center gap-1 bg-primary-100 text-red-700 px-2 py-1 rounded-full text-xs">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  high quality
                </div>
                <div className="flex items-center gap-1 bg-primary-100 text-red-700 px-2 py-1 rounded-full text-xs">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  easy to use
                </div>
                <div className="flex items-center gap-1 bg-primary-100 text-red-700 px-2 py-1 rounded-full text-xs">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  diverse content
                </div>
                <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  sparse fanpage
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">G</div>
                  <div className="w-4 h-4 bg-primary-600 rounded text-white text-xs flex items-center justify-center font-bold">f</div>
                </div>
                <span>From 1 Reviews</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Average Reviews</h4>
              <div className="text-4xl font-bold text-gray-900 mb-2">5.0/5</div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={20} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <div className="text-sm text-gray-500">(1 Reviews)</div>
            </div>
          </div>

          <div className="col-span-3 space-y-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  BA
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-primary-600">Facebook</span>
                    <span className="text-xs text-gray-500">Bootcreative AI</span>
                    <span className="text-xs text-gray-500">886.digital</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={12} className="text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm font-medium ml-1">5</span>
                    <span className="text-xs text-gray-500 ml-2">Aug 7th, 2024, 12:45pm</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Hi 886.digital! Your fanpage content is very sparse and boring. Boost Creatives AI can handle video content creation, freeing up your time to focus on running your business while still producing high-quality videos that drive conversions. 🤑4 Reasons Your Business Should Use Bootcreatives Ai Video: 💸 Create videos from many sources: websites, photos, text... 💸 Output high quality video up to 4k 60fps 💸 Creating diverse content helps maximize conversion rates 💸 Export videos quickly, simple to use 👉Get 14 Free Trial Days Now: https://www.facebook.com/1001497784955075?KN42gCTYd
                  </p>
                  
                  <div className="space-y-3 ml-4 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                    {[
                      "Thank you for your feedback and offer, Bootcreative AI. We are always looking for ways to improve and your insights about our fanpage are highly appreciated. We'll definitely take a look at the service you're offering. Thanks.",
                      "Thank you for your feedback and suggestion, Bootcreative AI. We are always looking for ways to improve our content and services. We will look into the tools you mentioned for potential improvements. Much appreciated!",
                      "We appreciate your feedback and are always open to improving our service. Your innovative AI video production sounds interesting. We'll keep it in mind for future content improvements."
                    ].map((reply, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          8D
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-900 dark:text-white">886 Digital</span>
                            <span className="text-xs text-gray-500">Aug 7th, 2024, 12:46pm</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{reply}</p>
                        </div>
                      </div>
                    ))}
                    <div className="text-xs text-primary-600 font-medium">Replied By Reviews AI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AISummaryModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
      />
    </div>
  );
};

export default ReviewsTab;