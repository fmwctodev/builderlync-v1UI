import React from 'react';

const ActivityTab: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Activity <span className="text-sm font-normal text-gray-500">(EDT)</span>
        </h3>
      </div>

      <div className="text-center py-12">
        <div className="w-32 h-24 mx-auto mb-6 relative">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-3 shadow-sm">
            <div className="flex items-center gap-1 mb-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
              <div className="w-8 h-8 mx-auto bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 110 5H9V10z" />
            </svg>
          </div>
          
          <div className="absolute top-8 -right-4 w-6 h-6 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </div>
          
          <div className="absolute top-2 -left-4 w-4 h-4 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            </svg>
          </div>
        </div>
        
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No activities yet!
        </h4>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Page visits, form submissions, appointments, calls, and more will appear here. Engage now to start tracking!
        </p>
      </div>
    </>
  );
};

export default ActivityTab;