import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapPin, Phone, Clock, Loader2, Search } from 'lucide-react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { abcSupplyApi } from '../services/api';
import { Branch } from '../types';

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
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const branchesToShow = selectedBranch ? [selectedBranch] : branches;
    const bounds = new google.maps.LatLngBounds();

    branchesToShow.forEach(branch => {
      if (branch.coordinates) {
        const marker = new google.maps.Marker({
          position: { lat: branch.coordinates.latitude, lng: branch.coordinates.longitude },
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
        bounds.extend({ lat: branch.coordinates.latitude, lng: branch.coordinates.longitude });
      }
    });

    if (branchesToShow.length > 0) {
      if (branchesToShow.length === 1) {
        mapInstanceRef.current.setCenter({
          lat: branchesToShow[0].coordinates.latitude,
          lng: branchesToShow[0].coordinates.longitude
        });
        mapInstanceRef.current.setZoom(15);
      } else {
        mapInstanceRef.current.fitBounds(bounds);
      }
    }
  }, [branches, selectedBranch]);

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
};

const BranchLocator: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredBranches = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return branches.filter(branch =>
      branch.name.toLowerCase().includes(query) ||
      branch.address.street1.toLowerCase().includes(query) ||
      branch.address.city.toLowerCase().includes(query) ||
      branch.address.state.toLowerCase().includes(query) ||
      branch.address.zipCode.includes(query)
    ).slice(0, 5);
  }, [branches, searchQuery]);

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
    const fetchBranches = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await abcSupplyApi.getBranches();
        setBranches(data);
      } catch (err) {
        setError('Failed to load branches');
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Branch Locator</h1>
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading branches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Branch Locator</h1>
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <MapPin className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Branches</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Branch Locator</h1>
        <div className="text-sm text-gray-400">
          {selectedBranch ? '1 branch selected' : `${branches.length} branches`}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search branches by name or address..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => searchQuery && setShowSuggestions(true)}
          className="w-full pl-10 pr-20 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {filteredBranches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => handleBranchSelect(branch)}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-700 last:border-b-0 focus:outline-none focus:bg-gray-700"
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

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <MapComponent branches={branches} selectedBranch={selectedBranch} />
        </Wrapper>
      </div>

      {selectedBranch && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{selectedBranch.name}</h3>
            <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-gray-300">
                <p>{selectedBranch.address.street1}</p>
                {selectedBranch.address.street2 && <p>{selectedBranch.address.street2}</p>}
                <p>{selectedBranch.address.city}, {selectedBranch.address.state} {selectedBranch.address.zipCode}</p>
              </div>

              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{selectedBranch.phone}</span>
              </div>
            </div>

            {selectedBranch.services && selectedBranch.services.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-2">Services</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBranch.services.map((service, index) => (
                    <span key={index} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchLocator;