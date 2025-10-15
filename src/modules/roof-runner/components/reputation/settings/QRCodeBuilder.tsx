import React, { useState } from 'react';
import { ArrowLeft, Download, Type, Image, QrCode } from 'lucide-react';

interface QRCodeBuilderProps {
  onBack: () => void;
}

const QRCodeBuilder: React.FC<QRCodeBuilderProps> = ({ onBack }) => {
  const [backgroundColor, setBackgroundColor] = useState('#2F4FFF');
  const [textColor, setTextColor] = useState('#000');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="text-gray-600 dark:text-gray-400">Back</span>
          </div>
          
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Review QR</h1>
          
          <div className="flex items-center gap-3">
            <button className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
              Download
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Elements</h3>
          
          <div className="space-y-3">
            <div className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <Type size={24} className="text-gray-600 dark:text-gray-400 mb-1" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Text</span>
            </div>
            
            <div className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <Image size={24} className="text-gray-600 dark:text-gray-400 mb-1" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Image</span>
            </div>
            
            <div className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <QrCode size={24} className="text-gray-600 dark:text-gray-400 mb-1" />
              <span className="text-xs text-gray-600 dark:text-gray-400">QR Code</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8">
          <div className="max-w-md mx-auto bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Drop a Review</h2>
            
            <div className="flex justify-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">f</span>
              </div>
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">G</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="w-48 h-48 mx-auto bg-black">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <rect width="200" height="200" fill="white"/>
                  <g fill="black">
                    <rect x="0" y="0" width="70" height="70"/>
                    <rect x="10" y="10" width="50" height="50" fill="white"/>
                    <rect x="20" y="20" width="30" height="30"/>
                    
                    <rect x="130" y="0" width="70" height="70"/>
                    <rect x="140" y="10" width="50" height="50" fill="white"/>
                    <rect x="150" y="20" width="30" height="30"/>
                    
                    <rect x="0" y="130" width="70" height="70"/>
                    <rect x="10" y="140" width="50" height="50" fill="white"/>
                    <rect x="20" y="150" width="30" height="30"/>
                    
                    <rect x="80" y="80" width="10" height="10"/>
                    <rect x="100" y="80" width="10" height="10"/>
                    <rect x="120" y="80" width="10" height="10"/>
                    <rect x="90" y="90" width="10" height="10"/>
                    <rect x="110" y="90" width="10" height="10"/>
                    <rect x="80" y="100" width="10" height="10"/>
                    <rect x="100" y="100" width="10" height="10"/>
                    <rect x="120" y="100" width="10" height="10"/>
                    <rect x="90" y="110" width="10" height="10"/>
                    <rect x="110" y="110" width="10" height="10"/>
                    <rect x="80" y="120" width="10" height="10"/>
                    <rect x="100" y="120" width="10" height="10"/>
                    <rect x="120" y="120" width="10" height="10"/>
                  </g>
                </svg>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-lg font-bold text-gray-800 mb-1">886</div>
              <div className="text-sm text-gray-600">DIGITAL</div>
            </div>

            <div className="text-center">
              <div className="font-medium text-gray-800 mb-1">886 Digital</div>
              <div className="text-sm text-gray-600">Carlton, VIC</div>
            </div>

            <div className="mt-4 text-xs text-blue-600">
              Powered by Automation Lab
            </div>

            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Properties</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded border border-gray-300"></div>
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeBuilder;