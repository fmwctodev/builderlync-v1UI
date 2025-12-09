import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Edit } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

interface AddressSearchProps {
  onAddressSelect: (address: string, addressComponents?: any) => void;
  buildingId: string;
  setBuildingId: React.Dispatch<React.SetStateAction<string>>;
}

const AddressSearch: React.FC<AddressSearchProps> = ({ onAddressSelect, buildingId, setBuildingId }) => {
  const [country, setCountry] = useState('United States');
  const [address, setAddress] = useState('');
  const [isAddressSelected, setIsAddressSelected] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap();
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (mapRef.current && window.google && !map) {
        const newMap = new window.google.maps.Map(mapRef.current, {
          center: { lat: 37.0902, lng: -95.7129 },
          zoom: 4,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_TOP }
        });
        setMap(newMap);
        
        if (autocompleteInputRef.current) {
          const autocomplete = new window.google.maps.places.Autocomplete(autocompleteInputRef.current, {
            types: ['address'],
            componentRestrictions: { country: country === 'United States' ? 'us' : 'ca' }
          });
          
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry?.location) return;

            const selectedAddress = place.formatted_address || '';
            const addressComponents = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              components: place.address_components
            };
            
            setAddress(selectedAddress);
            onAddressSelect(selectedAddress, addressComponents);
            setBuildingId(selectedAddress);
            setIsAddressSelected(true);
            setShowAlert(true);

            newMap.setCenter(place.geometry.location);
            newMap.setZoom(21);
            newMap.setMapTypeId('satellite');

            if (marker) {
              marker.setPosition(place.geometry.location);
            } else {
              const newMarker = new window.google.maps.Marker({
                map: newMap,
                position: place.geometry.location,
                draggable: true,
                animation: window.google.maps.Animation.DROP
              });
              setMarker(newMarker);
            }
          });
        }
      }
    };

    loadGoogleMaps();
  }, [country, onAddressSelect, map, marker]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value);
    setAddress('');
    setIsAddressSelected(false);
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/4">
          <select
            className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
            value={country}
            onChange={handleCountryChange}
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
          </select>
        </div>

        <div className="w-full md:w-3/4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={autocompleteInputRef}
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              placeholder="Enter address"
              value={address}
              onChange={handleAddressChange}
            />
          </div>
        </div>
      </div>

      {isAddressSelected && showAlert && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 relative">
          <div className="flex">
            <div className="flex-shrink-0">
              <MapPin className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Check that the address is accurate, then drag the marker over the correct structure.
              </p>
            </div>
            <button
              className="absolute top-2 right-2"
              onClick={() => setShowAlert(false)}
            >
              <X className="h-4 w-4 text-blue-400" />
            </button>
          </div>
        </div>
      )}

      {isAddressSelected && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-grow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">BUILDING ID</h3>
              <div className="flex items-center">
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={buildingId}
                  disabled
                />
                <button
                  type="button"
                  className="ml-2 p-2 text-blue-600 hover:text-blue-700"
                  onClick={() => setShowEditForm(true)}
                >
                  <Edit className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {showEditForm && (
            <div className="mt-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Building Name/ID
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Building Address *
                  </label>
                  <input
                    type="text"
                    value={buildingId}
                    onChange={(e) => setBuildingId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => setShowEditForm(false)}
                >
                  Update
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div
        ref={mapRef}
        className="rounded-md border border-gray-300 dark:border-gray-600 h-96 bg-gray-100 dark:bg-gray-700"
      />
    </div>
  );
};

export default AddressSearch;