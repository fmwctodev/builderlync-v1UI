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
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
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
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">AI Summary (Default)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Customers find the fanpage content lacking and unengaging. However, they appreciate the potential of the{' '}
              <span className="text-blue-600 cursor-pointer">See More</span>
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="text-xs text-gray-500">content quality</div>
              <div className="text-xs text-gray-500">video creation</div>
              <div className="text-xs text-gray-500">high resolution</div>
              <div className="text-xs text-gray-500">ease of use</div>
              <div className="text-xs text-gray-500">trial offer</div>
            </div>

            <div className="flex gap-2 mb-4">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Google</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Facebook</span>
            </div>

            <div className="text-xs text-gray-500 mb-4">From 1 Reviews</div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Average Reviews</h4>
              <div className="text-lg font-bold text-gray-900 dark:text-white">5.0/5</div>
              <div className="text-xs text-gray-500">(1 Reviews)</div>
            </div>

            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((rating, index) => (
                <div key={rating} className="flex items-center gap-2 text-xs">
                  <span>{rating}</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 h-2 rounded">
                    <div 
                      className="bg-yellow-400 h-2 rounded" 
                      style={{ width: index === 0 ? '100%' : '0%' }}
                    ></div>
                  </div>
                  <span>{index === 0 ? '100%' : '0%'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-3 space-y-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  BA
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-blue-600">Facebook</span>
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
                    <div className="text-xs text-blue-600 font-medium">Replied By Reviews AI</div>
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