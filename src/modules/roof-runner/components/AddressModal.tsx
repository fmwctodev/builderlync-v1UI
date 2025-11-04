import React from 'react';
import { X } from 'lucide-react';
import GooglePlacesAutocomplete from '../../../shared/components/GooglePlacesAutocomplete';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobAddress: string;
  setJobAddress: (address: string, lat?: number, lng?: number) => void;
  onContinue: () => void;
  onCreateFromCompanyCam: () => void;
}

const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  jobAddress,
  setJobAddress,
  onContinue,
  onCreateFromCompanyCam
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">New job</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Job address</p>
          
          <div className="space-y-4">
            <GooglePlacesAutocomplete
              value={jobAddress}
              onChange={(address: string, lat: number, lng: number) => setJobAddress(address, lat, lng)}
              placeholder="Enter address and select"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={onContinue}
                disabled={!jobAddress.trim()}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-all duration-200"
              >
                Continue
              </button>
              
              <div className="text-gray-400 dark:text-gray-500 text-sm">or</div>
              
              <button
                onClick={onCreateFromCompanyCam}
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                Create from CompanyCam
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;