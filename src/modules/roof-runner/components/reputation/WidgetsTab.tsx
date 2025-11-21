import React, { useState } from 'react';
import { Smartphone, Copy, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import CopyCodeModal from './CopyCodeModal';

const WidgetsTab: React.FC = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(0);

  const reviews = [
    {
      id: 1,
      author: 'Bootcreative AI',
      date: 'Aug 07, 2024',
      text: 'Hi 886.digital! Your fanpage content is very sparse and boring. Boost Creatives AI can handle video content creation, freeing up your time to focus on...',
      rating: 5
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Widgets</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMobileView(!isMobileView)}
              className={`p-2 rounded-lg transition-colors ${
                isMobileView 
                  ? 'bg-primary-100 text-blue-700 dark:bg-primary-900/30 dark:text-blue-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
              title="Mobile View"
            >
              <Smartphone size={20} />
            </button>
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Copy Code"
            >
              <Copy size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-center">
          <div className={`bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 ${
            isMobileView ? 'w-80' : 'w-full max-w-2xl'
          }`}>
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Testimonials</h3>
                <p className="text-sm text-gray-600 mb-4">135-141 Cardigan Street, Carlton, VIC, 3053</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-gray-900">5.00</span>
                </div>
                <p className="text-sm text-gray-600">based on 1 reviews</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                {reviews.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{reviews[currentReview].author}</h4>
                        <p className="text-sm text-gray-500">{reviews[currentReview].date}</p>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={14} 
                            className={star <= reviews[currentReview].rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">
                      {reviews[currentReview].text} <span className="text-primary-600 cursor-pointer">More</span>
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentReview(Math.max(0, currentReview - 1))}
                    disabled={currentReview === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <span className="text-sm text-gray-500">
                    {currentReview + 1}
                  </span>
                  
                  <button
                    onClick={() => setCurrentReview(Math.min(reviews.length - 1, currentReview + 1))}
                    disabled={currentReview === reviews.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CopyCodeModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
      />
    </div>
  );
};

export default WidgetsTab;