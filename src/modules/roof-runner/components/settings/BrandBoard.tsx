import React from 'react';

const BrandBoard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Brand Board</h2>
        <p className="text-gray-600 dark:text-gray-400">Define your brand identity for AI and creative assets</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Brand Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Website</label>
            <input
              type="url"
              defaultValue="https://builderlync.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Description</label>
            <textarea
              rows={4}
              defaultValue="Professional roofing and construction services specializing in residential and commercial projects. We provide quality workmanship with a focus on customer satisfaction and long-term relationships."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Voice & Tone</label>
            <textarea
              rows={3}
              placeholder="Describe your brand's personality, tone of voice, and communication style..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
            <textarea
              rows={3}
              placeholder="Describe your ideal customers and target market..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Brand Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo Upload</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center dark:border-gray-600">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded dark:bg-gray-700"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload your logo</p>
              <button className="text-primary-600 hover:underline dark:text-primary-400">Choose File</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Colors</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded"></div>
                <input
                  type="text"
                  defaultValue="#dc2626"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded"></div>
                <input
                  type="text"
                  defaultValue="#1f2937"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
          Save Brand Board
        </button>
      </div>
    </div>
  );
};

export default BrandBoard;