import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Phone, Check, Building, Search, ArrowRight } from 'lucide-react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { abcSupplyApi } from '../../abc-supply/services/api';
import { srsApi } from '../services/srsApi';
import { Branch, ShipTo } from '../../abc-supply/types';

// Helper component for Map
interface MapComponentProps {
  branches: any[];
  selectedBranch: any | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ branches, selectedBranch }) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<google.maps.Map | null>(null);
  const markersRef = React.useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 4,
      center: { lat: 39.8283, lng: -98.5795 }, // US Center
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

    branches.forEach(branch => {
      // Map ShipToBranch or regular Branch to coordinates if available
      // ShipToBranch usually doesn't have coordinates directly, need to check data model. 
      // API 'getBranches' returns coordinates. 'ShipToBranch' usually just has address.
      // If we don't have coordinates, we can't map. 
      // For this implementation, we will try to map if coords exist.
      const lat = branch.coordinates?.latitude;
      const lng = branch.coordinates?.longitude;

      if (lat && lng) {
        hasValidCoordinates = true;
        const isSelected = selectedBranch?.id === branch.id || selectedBranch?.number === branch.number;

        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          title: branch.name,
          icon: isSelected ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' : undefined
        });

        markersRef.current.push(marker);
        bounds.extend({ lat, lng });
      }
    });

    if (hasValidCoordinates && branches.length > 0) {
      if (selectedBranch && selectedBranch.coordinates) {
        mapInstanceRef.current.setCenter({
          lat: selectedBranch.coordinates.latitude,
          lng: selectedBranch.coordinates.longitude
        });
        mapInstanceRef.current.setZoom(12);
      } else {
        mapInstanceRef.current.fitBounds(bounds);
      }
    }
  }, [branches, selectedBranch]);

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
};

interface BranchLocatorProps {
  onBack: () => void;
  supplier?: string;
}

const BranchLocator: React.FC<BranchLocatorProps> = ({ onBack, supplier = 'ABC Supply' }) => {
  const [loading, setLoading] = useState(true);
  const [shipTos, setShipTos] = useState<ShipTo[]>([]);
  const [availableBranches, setAvailableBranches] = useState<any[]>([]); // ShipToBranch[]

  const [selectedShipTo, setSelectedShipTo] = useState<ShipTo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        if (supplier === 'ABC Supply') {
          // 1. Fetch ShipTos (User's accounts)
          const accounts = await abcSupplyApi.getShipTos();
          setShipTos(accounts);

          // 2. Load persisted selections
          const savedShipTo = localStorage.getItem('abc_selected_shipto');
          const savedBranch = localStorage.getItem('abc_selected_branch');

          if (savedShipTo) {
            const parsedShipTo = JSON.parse(savedShipTo);
            const matchedAccount = accounts.find(a => a.number === parsedShipTo.number);
            if (matchedAccount) {
              setSelectedShipTo(matchedAccount);
              // If ShipTo selected, set available branches
              const branches = matchedAccount.branches || [];
              // Filter to only 'abc' storefront if needed, or take all
              setAvailableBranches(branches);

              if (savedBranch) {
                const parsedBranch = JSON.parse(savedBranch);
                const matchedBranch = branches.find((b: any) => b.number === parsedBranch.number || b.number === parsedBranch.id);
                if (matchedBranch) {
                  setSelectedBranch(matchedBranch);
                }
              }
            }
          } else if (accounts.length === 1) {
            // Auto-select if only one account
            HandleShipToSelect(accounts[0]);
          }
        } else {
          // SRS Logic (fallback to old generic logic for SRS)
          // ... SRS logic can remain or be simplified
          // For now, focusing on ABC Supply as per user request
        }
      } catch (error) {
        console.error("Failed to load locator data", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [supplier]);

  const HandleShipToSelect = (account: ShipTo) => {
    setSelectedShipTo(account);
    setAvailableBranches(account.branches || []);
    setSelectedBranch(null); // Reset branch when account changes
    localStorage.setItem('abc_selected_shipto', JSON.stringify(account));
    localStorage.removeItem('abc_selected_branch');
  };

  const HandleBranchSelect = (branch: any) => {
    // Map ShipToBranch to a consistent structure (id/number) if needed
    // ABC 'ShipToBranch' has `number`, `name`.
    // Product Search needs `branch.number`.
    const branchData = {
      id: branch.number,
      number: branch.number,
      name: branch.name,
      // coordinates might differ or be missing in ShipToBranch vs Generic Branch
      coordinates: branch.coordinates // if any
    };

    setSelectedBranch(branchData);
    localStorage.setItem('abc_selected_branch', JSON.stringify(branchData));

    // Delay to show selection
    setTimeout(onBack, 150);
  };

  // Filter branches based on search
  const filteredBranches = useMemo(() => {
    if (!searchQuery.trim()) return availableBranches;
    const q = searchQuery.toLowerCase();
    return availableBranches.filter((b: any) =>
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.number && b.number.includes(q))
    );
  }, [availableBranches, searchQuery]);

  if (loading) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Loading your account details...</p>
      </div>
    );
  }

  // If no ShipTos found for ABC
  if (supplier === 'ABC Supply' && shipTos.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-red-200">
        <Building className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No ABC Supply Accounts Found</h3>
        <p className="text-gray-500 mt-2">Could not find any Ship-To accounts linked to your profile.</p>
        <button onClick={onBack} className="mt-4 text-primary-600 hover:text-primary-700">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-primary-700 dark:bg-primary-600 rounded-lg p-6">
        <button onClick={onBack} className="text-white hover:text-white text-sm mb-2">← Back</button>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-6 w-6 text-green-400" />
          <h1 className="text-2xl font-bold text-white">Select Branch</h1>
        </div>
        <p className="text-white/80 text-sm">Select your Account and Branch to view specific pricing and availability.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Select Account</h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {shipTos.map(account => (
                <div
                  key={account.number}
                  onClick={() => HandleShipToSelect(account)}
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${selectedShipTo?.number === account.number ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{account.name}</div>
                  <div className="text-xs text-gray-500">#{account.number}</div>
                  <div className="text-xs text-gray-500 truncate">{account.address?.line1}, {account.address?.city}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Branch Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-full">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Select Branch</h2>

            {!selectedShipTo ? (
              <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Please select an account first</p>
              </div>
            ) : (
              <>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search branches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                  />
                </div>

                {filteredBranches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No branches available for this account.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                    {filteredBranches.map((branch: any) => (
                      <div
                        key={branch.number}
                        className={`p-4 rounded-lg border flex flex-col justify-between ${selectedBranch?.number === branch.number ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900 dark:text-white">{branch.name}</h3>
                            {selectedBranch?.number === branch.number && <Check className="h-4 w-4 text-primary-600" />}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Branch #{branch.number}</div>
                          {/* Note: ShipToBranch might not have full address detail like standard API response, it varies */}
                          {branch.phoneNumber && <div className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Phone size={12} /> {branch.phoneNumber}</div>}
                        </div>
                        <button
                          onClick={() => HandleBranchSelect(branch)}
                          className={`mt-4 w-full py-1.5 px-3 rounded text-sm font-medium transition-colors ${selectedBranch?.number === branch.number ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'}`}
                        >
                          {selectedBranch?.number === branch.number ? 'Selected' : 'Select Branch'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchLocator;