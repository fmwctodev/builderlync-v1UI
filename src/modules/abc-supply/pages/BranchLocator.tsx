import React from 'react';
import { MapPin } from 'lucide-react';

const BranchLocator: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Branch Locator</h1>
      </div>

      <div className="bg-primary-700 rounded-lg p-8 text-center">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Find ABC Supply Branches</h3>
        <p className="text-gray-400">Locate the nearest ABC Supply branch to you</p>
      </div>
    </div>
  );
};

export default BranchLocator;