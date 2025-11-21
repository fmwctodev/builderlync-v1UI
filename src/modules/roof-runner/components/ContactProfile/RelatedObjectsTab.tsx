import React from 'react';

const RelatedObjectsTab: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-8">
          Related objects
        </h3>

        <div className="text-center py-16">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No association found
          </h4>
          <p className="text-primary-600 hover:text-primary-700 text-sm mb-8 cursor-pointer">
            Looks like a ghost town. Nothing to see here
          </p>
          
          <div className="w-32 h-32 mx-auto mb-8 relative">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
              <div className="w-20 h-24 bg-white border-2 border-gray-300 rounded-t-full relative">
                <div className="absolute top-6 left-4 w-2 h-2 bg-black rounded-full"></div>
                <div className="absolute top-6 right-4 w-2 h-2 bg-black rounded-full"></div>
                
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-white">
                  <svg className="w-full h-full" viewBox="0 0 80 12" fill="white" stroke="#d1d5db" strokeWidth="2">
                    <path d="M0,12 L0,6 Q10,0 20,6 Q30,12 40,6 Q50,0 60,6 Q70,12 80,6 L80,12 Z" />
                  </svg>
                </div>
              </div>
              
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                <div className="w-4 h-2 bg-primary-600 rounded"></div>
                <div className="w-4 h-2 bg-blue-400 rounded"></div>
              </div>
            </div>
            
            <div className="absolute top-4 left-8 text-blue-400 text-xs">BOO!</div>
            <div className="absolute top-12 right-6 w-1 h-1 bg-blue-400 rounded-full"></div>
            <div className="absolute top-6 right-12 w-1 h-1 bg-blue-300 rounded-full"></div>
            <div className="absolute bottom-16 left-4 w-1 h-1 bg-blue-400 rounded-full"></div>
            <div className="absolute bottom-8 right-8 w-1 h-1 bg-blue-300 rounded-full"></div>
            <div className="absolute top-16 left-12 text-gray-400 text-xs">✦</div>
            <div className="absolute bottom-12 right-4 text-gray-400 text-xs">✦</div>
          </div>
          
          <button className="px-6 py-2 bg-primary-100 dark:bg-primary-900/20 text-primary-600 hover:bg-primary-200 dark:hover:bg-primary-900/30 rounded-md text-sm font-medium flex items-center gap-2 mx-auto">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Go to object settings
          </button>
        </div>
      </div>
    </>
  );
};

export default RelatedObjectsTab;