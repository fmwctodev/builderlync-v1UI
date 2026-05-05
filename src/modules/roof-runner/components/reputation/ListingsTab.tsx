import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Link, RefreshCw, Shield } from 'lucide-react';
import PricingModal from './PricingModal';
import ScanBusinessPage from './ScanBusinessPage';

const ListingsTab: React.FC = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [showScanPage, setShowScanPage] = useState(false);

  const banners = [
    { title: 'One Tool to List', image: '/api/placeholder/800/200' },
    { title: 'One Tool to Rank', image: '/api/placeholder/800/200' },
    { title: 'One Tool to Dominate', image: '/api/placeholder/800/200' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (showScanPage) {
    return <ScanBusinessPage onBack={() => setShowScanPage(false)} />;
  }

  return (
    <div className="bg-white dark:bg-gray-800">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Listings</h2>
      </div>

      <div className="p-6">
        <div className="mb-8">
          <div className="relative h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {banners[currentBanner].title}
              </h3>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentBanner ? 'bg-red-600' : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Don't leave your online reputation to chance harness the potential of Listings today !!
          </p>
        </div>

        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-8 rounded-lg mb-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Unlock Your Business's Potential
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Scan Now to Discover If a Listings Subscription is Your Missing Link
          </p>
          <button
            onClick={() => setShowScanPage(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Scan my business for free
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            What we offer
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={32} className="text-primary-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">Listing Management</h4>
            </div>

            <div className="text-center p-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Link size={32} className="text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">Premium Backlinks</h4>
            </div>

            <div className="text-center p-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <RefreshCw size={32} className="text-primary-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">Sync Functionality</h4>
            </div>

            <div className="text-center p-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield size={32} className="text-red-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">Duplicate Suppression</h4>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Activate Listings
            </button>
          </div>
        </div>
      </div>

      <PricingModal 
        isOpen={isPricingModalOpen} 
        onClose={() => setIsPricingModalOpen(false)} 
      />
    </div>
  );
};

export default ListingsTab;