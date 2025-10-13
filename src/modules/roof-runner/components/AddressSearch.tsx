import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

interface AddressSearchProps {
  onAddressSelect: (address: string) => void;
  buildingId: string;
}

const AddressSearch: React.FC<AddressSearchProps> = ({ onAddressSelect, buildingId }) => {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions] = useState([
    '29 Burnside Dr, Palm Coast, FL, 32137',
    '123 Main St, Austin, TX, 78701',
    '456 Oak Ave, Dallas, TX, 75201'
  ]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Property Address</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Enter property address"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {searchValue && (
            <div className="space-y-2 mb-4">
              {suggestions
                .filter(addr => addr.toLowerCase().includes(searchValue.toLowerCase()))
                .map((address, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onAddressSelect(address);
                      setSearchValue(address);
                    }}
                    className="w-full flex items-center gap-2 p-3 text-left border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{address}</span>
                  </button>
                ))}
            </div>
          )}

          {buildingId && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">Selected Address:</p>
              <p className="font-medium text-gray-900 dark:text-white">{buildingId}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <div className="h-64 bg-gradient-to-br from-green-400 to-blue-500 relative">
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600">
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 relative">
                {/* Simulated map with property marker */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                {/* Map grid lines */}
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="border border-gray-400 dark:border-gray-500"></div>
                    ))}
                  </div>
                </div>
                
                {/* Simulated roads */}
                <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-400 dark:bg-gray-500"></div>
                <div className="absolute top-0 bottom-0 left-2/3 w-1 bg-gray-400 dark:bg-gray-500"></div>
              </div>
            </div>
            
            <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400">
              Satellite View
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSearch;