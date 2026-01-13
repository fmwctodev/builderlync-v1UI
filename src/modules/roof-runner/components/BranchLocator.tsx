import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapPin, Phone, Clock, Navigation, Search } from 'lucide-react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { abcSupplyApi } from '../../abc-supply/services/api';
import { srsApi } from '../services/srsApi';
import { Branch } from '../../abc-supply/types';

interface MapComponentProps {
  branches: Branch[];
  selectedBranch: Branch | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ branches, selectedBranch }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 6,
      center: { lat: 39.8283, lng: -98.5795 },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });
    mapInstanceRef.current = map;

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || branches.length === 0) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasValidCoordinates = false;

    // Always show all branches
    branches.forEach(branch => {
      if (branch.coordinates && branch.coordinates.latitude && branch.coordinates.longitude) {
        hasValidCoordinates = true;

        const isSelected = selectedBranch?.id === branch.id;
        const marker = new google.maps.Marker({
          position: {
            lat: branch.coordinates.latitude,
            lng: branch.coordinates.longitude
          },
          map: mapInstanceRef.current,
          title: branch.name,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: black; padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold;">${branch.name}</h3>
              <p style="margin: 4px 0;">${branch.address.street1}</p>
              ${branch.address.street2 ? `<p style="margin: 4px 0;">${branch.address.street2}</p>` : ''}
              <p style="margin: 4px 0;">${branch.address.city}, ${branch.address.state} ${branch.address.zipCode}</p>
              <p style="margin: 4px 0;">📞 ${branch.phone}</p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
        bounds.extend({
          lat: branch.coordinates.latitude,
          lng: branch.coordinates.longitude
        });
      }
    });

    // Fit map to show all branches, or zoom to selected branch
    if (selectedBranch && selectedBranch.coordinates) {
      mapInstanceRef.current.setCenter({
        lat: selectedBranch.coordinates.latitude,
        lng: selectedBranch.coordinates.longitude
      });
      mapInstanceRef.current.setZoom(15);
    } else if (hasValidCoordinates) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [branches, selectedBranch]);

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
};

interface BranchLocatorProps {
  onBack: () => void;
  supplier?: string;
}

const BranchLocator: React.FC<BranchLocatorProps> = ({ onBack, supplier = 'ABC Supply' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [branchesPerPage] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const filteredBranches = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return branches.filter(branch => {
      if (supplier === 'SRS') {
        // SRS branch structure
        return (branch.name || '').toLowerCase().includes(query) ||
               (branch.address?.street || '').toLowerCase().includes(query) ||
               (branch.address?.city || '').toLowerCase().includes(query) ||
               (branch.address?.state || '').toLowerCase().includes(query) ||
               (branch.address?.zip || '').includes(query);
      } else {
        // ABC Supply branch structure
        return (branch.name || '').toLowerCase().includes(query) ||
               (branch.address?.street1 || '').toLowerCase().includes(query) ||
               (branch.address?.city || '').toLowerCase().includes(query) ||
               (branch.address?.state || '').toLowerCase().includes(query) ||
               (branch.address?.zipCode || '').includes(query);
      }
    }).slice(0, 5);
  }, [branches, searchQuery, supplier]);

  const handleBranchSelect = useCallback((branch: Branch) => {
    setSelectedBranch(branch);
    setSearchQuery(branch.name);
    setShowSuggestions(false);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.trim().length > 0);
    if (!value.trim()) {
      setSelectedBranch(null);
    }
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedBranch(null);
    setShowSuggestions(false);
  }, []);

  useEffect(() => {
    loadBranches(1);
  }, []);

  const geocodeAddress = async (address: string, city: string, state: string, zipCode: string) => {
    try {
      const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: fullAddress });
      
      if (result.results[0]) {
        const location = result.results[0].geometry.location;
        return {
          latitude: location.lat(),
          longitude: location.lng()
        };
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
    return null;
  };

  const loadBranches = async (page = 1) => {
    try {
      setLoading(true);
      if (supplier === 'SRS') {
        const response = await srsApi.getBranches(undefined, undefined, undefined, page, branchesPerPage);
        const srsData = response.data?.data || response.data || [];
        setBranches(srsData);
        
        // Update pagination info
        if (response.data?.pagination) {
          setPagination(response.data.pagination);
        } else if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        const data = await abcSupplyApi.getBranches();
        setBranches(data);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-6">
          <button
            onClick={onBack}
            className="text-primary-600 hover:text-primary-700 text-sm mb-2"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-green-400" />
            <h1 className="text-2xl font-bold text-white">Branch Locator</h1>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading branches...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-white">{supplier} Branch Locator</h1>
        </div>

        <div className="max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search branches by name or address..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
            if (searchQuery.trim()) {
              setShowSuggestions(true);
            }
          }}
          onBlur={(e) => {
            // Delay hiding suggestions to allow clicking on them
            setTimeout(() => {
              if (!e.currentTarget.contains(document.activeElement)) {
                setShowSuggestions(false);
              }
            }, 200);
          }}
            className="w-full pl-10 pr-20 py-2 bg-gray-800 dark:bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white px-2 py-1 text-sm"
            >
              Clear
            </button>
          )}

          {showSuggestions && filteredBranches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {filteredBranches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-600 last:border-b-0 focus:outline-none focus:bg-gray-700"
                >
                  <div className="text-white font-medium">{branch.name}</div>
                  <div className="text-gray-400 text-sm">
                    {branch.address.street1}, {branch.address.city}, {branch.address.state}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          {supplier === 'ABC Supply' ? (
            <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <MapComponent branches={branches} selectedBranch={selectedBranch} />
            </Wrapper>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Map view available for ABC Supply branches only</p>
            </div>
          )}
        </div>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {selectedBranch ? 'Selected Branch' : 'All Branches'}
        </h2>

        <div className="space-y-4">
          {branches.map((branch) => (
            <div key={branch.id} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">{branch.name}</h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin size={14} />
                  <span>
                    {supplier === 'SRS' ? 
                      `${branch.address?.street || branch.address?.full || ''}, ${branch.address?.city}, ${branch.address?.state} ${branch.address?.zip}` :
                      `${branch.address.street1}, ${branch.address.city}, ${branch.address.state} ${branch.address.zipCode}`
                    }
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone size={14} />
                  <span>{branch.phone}</span>
                </div>

                {branch.businessHours && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock size={14} />
                    <span>{branch.businessHours}</span>
                  </div>
                )}
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
        
        {supplier === 'SRS' && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} branches
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadBranches(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => loadBranches(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchLocator;