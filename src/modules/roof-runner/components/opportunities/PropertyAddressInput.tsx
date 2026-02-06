import { useState } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import GooglePlacesAutocomplete from '../../../../shared/components/GooglePlacesAutocomplete';

interface PropertyAddressInputProps {
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  propertyCountry: string;
  onAddressChange: (field: string, value: string | number) => void;
}

export default function PropertyAddressInput({
  propertyAddress,
  propertyCity,
  propertyState,
  propertyZip,
  propertyCountry,
  onAddressChange,
}: PropertyAddressInputProps) {
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleGoogleAddressSelect = (address: string, isFromAutocomplete: boolean, lat?: number, lng?: number) => {
    onAddressChange('property_address', address);
    if (isFromAutocomplete && lat && lng) {
      onAddressChange('property_latitude', lat);
      onAddressChange('property_longitude', lng);

      const parts = address.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        const streetAddress = parts[0];
        const cityPart = parts[1];
        const stateZipCountry = parts[2];

        onAddressChange('property_address', streetAddress);
        onAddressChange('property_city', cityPart);

        const stateZipMatch = stateZipCountry.match(/([A-Z]{2})\s+(\d{5}(-\d{4})?)/);
        if (stateZipMatch) {
          onAddressChange('property_state', stateZipMatch[1]);
          onAddressChange('property_zip', stateZipMatch[2]);
        }

        if (parts.length > 3) {
          onAddressChange('property_country', parts[3]);
        }
      }

      setShowDetails(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Property Address
        </label>
        <button
          type="button"
          onClick={() => {
            setUseManualEntry(!useManualEntry);
            if (!useManualEntry) {
              setShowDetails(true);
            }
          }}
          className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        >
          {useManualEntry ? 'Use Map Search' : 'Enter Manually'}
        </button>
      </div>

      {useManualEntry ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={propertyAddress}
              onChange={(e) => onAddressChange('property_address', e.target.value)}
              placeholder="Enter street address"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                City
              </label>
              <input
                type="text"
                value={propertyCity}
                onChange={(e) => onAddressChange('property_city', e.target.value)}
                placeholder="City"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                State
              </label>
              <input
                type="text"
                value={propertyState}
                onChange={(e) => onAddressChange('property_state', e.target.value)}
                placeholder="State"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                value={propertyZip}
                onChange={(e) => onAddressChange('property_zip', e.target.value)}
                placeholder="ZIP"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Country
              </label>
              <input
                type="text"
                value={propertyCountry}
                onChange={(e) => onAddressChange('property_country', e.target.value)}
                placeholder="Country"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
            <GooglePlacesAutocomplete
              value={propertyAddress}
              onChange={handleGoogleAddressSelect}
              placeholder="Search for property address"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {(propertyAddress || propertyCity || propertyState || propertyZip) && (
            <div className="border border-gray-200 dark:border-gray-600 rounded-md">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span>Address Details</span>
                {showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showDetails && (
                <div className="px-3 pb-3 space-y-2 border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={propertyAddress}
                        onChange={(e) => onAddressChange('property_address', e.target.value)}
                        placeholder="Street address"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={propertyCity}
                        onChange={(e) => onAddressChange('property_city', e.target.value)}
                        placeholder="City"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={propertyState}
                        onChange={(e) => onAddressChange('property_state', e.target.value)}
                        placeholder="State"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={propertyZip}
                        onChange={(e) => onAddressChange('property_zip', e.target.value)}
                        placeholder="ZIP"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={propertyCountry}
                      onChange={(e) => onAddressChange('property_country', e.target.value)}
                      placeholder="Country"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
