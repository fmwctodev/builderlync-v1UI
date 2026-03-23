import React, { useState } from 'react';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';

interface BranchLocatorProps {
  onBack: () => void;
}

const BranchLocator: React.FC<BranchLocatorProps> = ({ onBack }) => {
  const [searchLocation, setSearchLocation] = useState('');

  const branches = [
    {
      id: '1',
      name: 'ABC Supply - Austin North',
      address: '8319 North Lamar Boulevard, Austin, TX 78753',
      city: 'Austin',
      state: 'TX',
      phone: '(512) 555-0123',
      distance: '2.5 km',
      hours: 'Mon-Fri: 7:00 AM - 5:00 PM'
    },
    {
      id: '2',
      name: 'ABC Supply - Austin South',
      address: '4700 South Congress Ave, Austin, TX 78745',
      city: 'Austin',
      state: 'TX',
      phone: '(512) 555-0124',
      distance: '3.2 km',
      hours: 'Mon-Fri: 7:00 AM - 5:00 PM'
    },
    {
      id: '3',
      name: 'ABC Supply - Round Rock',
      address: '1821 Central Commerce Court, Round Rock, TX 78664',
      city: 'Round Rock',
      state: 'TX',
      phone: '(512) 555-0125',
      distance: '15.8 km',
      hours: 'Mon-Fri: 7:00 AM - 5:00 PM'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-primary-700 dark:bg-primary-600 rounded-lg p-6">
        <button 
          onClick={onBack}
          className="text-white hover:text-white text-sm mb-2"
        >
          ← Back to Dashboard
        </button>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-6 w-6 text-green-400" />
          <h1 className="text-2xl font-bold text-white">Branch Locator</h1>
        </div>
        
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Enter your location"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="w-full px-4 py-2 bg-primary-800 dark:bg-primary-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-primary-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-[400px] bg-primary-100 dark:bg-primary-700 rounded-lg flex items-center justify-center mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900">
            {/* Simulated map with branch markers */}
            <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute top-2/3 left-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
            
            {/* Map grid */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-gray-400"></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-2 left-2 bg-white dark:bg-primary-800 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400">
            Interactive Map
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nearby Branches</h2>
        <div className="space-y-4">
          {branches.map((branch) => (
            <div key={branch.id} className="bg-primary-50 dark:bg-primary-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-primary-100 dark:hover:bg-primary-600 transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">{branch.name}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{branch.distance} away</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin size={14} />
                  <span>{branch.address}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone size={14} />
                  <span>{branch.phone}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock size={14} />
                  <span>{branch.hours}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <button className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                  <Navigation size={14} />
                  Get Directions
                </button>
                <button className="px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Call Store
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BranchLocator;