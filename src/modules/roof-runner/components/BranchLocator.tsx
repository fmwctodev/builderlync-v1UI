import React, { useState, useEffect, useMemo } from 'react';
import { abcSupplyApi } from '../../abc-supply/services/api';
import { srsApi } from '../services/srsApi';
import { Search, MapPin, Phone, Check, Building, X, Navigation } from 'lucide-react';
import { ShipTo } from '../../abc-supply/types';
import GooglePlacesAutocomplete from '../../../shared/components/GooglePlacesAutocomplete';


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
  const [shippingLocation, setShippingLocation] = useState<{ address: string; lat: number; lng: number } | null>(() => {
    const saved = localStorage.getItem('srs_shipping_location');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLocating, setIsLocating] = useState(false);
  const autocompleteInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoading(true);
      try {
        if (supplier === 'ABC Supply') {
          // 1. Fetch ShipTos (User's accounts)
          const accounts = await abcSupplyApi.getShipTos();
          if (!isMounted) return;
          setShipTos(accounts);

          // 2. Load persisted selections
          const savedShipTo = localStorage.getItem('abc_selected_shipto');
          const savedBranch = localStorage.getItem('abc_selected_branch');

          if (savedShipTo) {
            const parsedShipTo = JSON.parse(savedShipTo);
            const matchedAccount = accounts.find(a => a.number === parsedShipTo.number);
            if (matchedAccount) {
              setSelectedShipTo(matchedAccount);
              const branches = matchedAccount.branches || [];
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
            HandleShipToSelect(accounts[0]);
          }
        } else if (supplier === 'SRS') {
          // SRS Branch Logic - Only fetch if we have coordinates
          const lat = shippingLocation?.lat;
          const lng = shippingLocation?.lng;

          if (typeof lat === 'number' && typeof lng === 'number' && (Math.abs(lat) > 0.0001 || Math.abs(lng) > 0.0001)) {
            const response = await srsApi.getBranches(lat, lng);
            if (!isMounted) return;

            if (response && response.success) {
              const branches = response.data || [];
              const branchesArray = Array.isArray(branches) ? branches : (Array.isArray(response.data?.data) ? response.data.data : []);
              setAvailableBranches(branchesArray);
              
              if (branchesArray.length > 0) {
                const savedBranch = localStorage.getItem('srs_selected_branch');
                if (savedBranch) {
                  try {
                    const parsedBranch = JSON.parse(savedBranch);
                    const matchedBranch = branchesArray.find((b: any) => (b.id === parsedBranch.id || b.branchCode === parsedBranch.id || b.number === parsedBranch.id));
                    if (matchedBranch) {
                      setSelectedBranch(matchedBranch);
                    }
                  } catch (e) {}
                }
              }
            } else {
              setAvailableBranches([]);
            }
          } else {
            // No coordinates, clear branches
            setAvailableBranches([]);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to load locator data", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    init();

    return () => {
      isMounted = false;
    };
  }, [supplier, shippingLocation?.lat, shippingLocation?.lng]);

  const handleAddressChange = (address: string, isFromAutocomplete: boolean, lat?: number, lng?: number) => {
    if (isFromAutocomplete && typeof lat === 'number' && typeof lng === 'number') {
      const loc = { address, lat, lng };
      setShippingLocation(loc);
      localStorage.setItem('srs_shipping_location', JSON.stringify(loc));
    } else {
      // Manual typing - keep existing coordinates if they exist to prevent UI reset
      setShippingLocation(prev => ({
        address,
        lat: prev?.lat ?? 0,
        lng: prev?.lng ?? 0
      }));
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const loc = {
                address: "Current Location",
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            setShippingLocation(loc);
            localStorage.setItem('srs_shipping_location', JSON.stringify(loc));
            setIsLocating(false);
        },
        () => {
            setIsLocating(false);
            alert("Could not get your location. Please enter an address manually.");
        }
    );
  };

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
      id: branch.number || branch.id || branch.branchCode,
      number: branch.number || branch.branchCode,
      name: branch.name || branch.branchName,
      coordinates: branch.coordinates
    };

    setSelectedBranch(branchData);
    
    if (supplier === 'ABC Supply') {
      localStorage.setItem('abc_selected_branch', JSON.stringify(branchData));
    } else {
      localStorage.setItem('srs_selected_branch', JSON.stringify(branchData));
    }

    // Delay to show selection
    setTimeout(onBack, 150);
  };

  const [pagination, setPagination] = useState<{ page: number; limit: number }>({
    page: 1,
    limit: 12,
  });

  // Filter branches based on search
  const filteredBranches = useMemo(() => {
    if (!searchQuery.trim()) return availableBranches;
    // Strip "Branch #" prefix so users can search "Branch #55BCH" or just "55BCH"
    const rawQ = searchQuery.trim().replace(/^branch\s*#?\s*/i, '').toLowerCase();
    const q = rawQ || searchQuery.trim().toLowerCase();
    return availableBranches.filter((b: any) =>
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.branchName && b.branchName.toLowerCase().includes(q)) ||
      (b.number && b.number.toString().toLowerCase().includes(q)) ||
      (b.branchCode && b.branchCode.toString().toLowerCase().includes(q)) ||
      (b.address?.city && b.address.city.toLowerCase().includes(q))
    );
  }, [availableBranches, searchQuery]);

  const paginatedBranches = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return filteredBranches.slice(startIndex, startIndex + pagination.limit);
  }, [filteredBranches, pagination.page, pagination.limit]);

  const totalPages = Math.ceil(filteredBranches.length / pagination.limit);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchQuery]);

  // Removed top-level loading return to prevent flickering

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
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <button onClick={onBack} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 flex items-center gap-1 text-sm font-medium transition-colors">
          &larr; Back to Dashboard
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary-600" />
          {supplier} Branch Locator
        </h1>
        <div className="w-20"></div> {/* Spacer for balance */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Account (ABC) or Location (SRS) */}
        <div className="lg:col-span-1 space-y-4">
          {supplier === 'ABC Supply' ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Building className="h-5 w-5 text-primary-600" />
                1. Select Account
              </h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {shipTos.map(account => (
                  <div
                    key={account.number}
                    onClick={() => HandleShipToSelect(account)}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${selectedShipTo?.number === account.number ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{account.name}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-tighter">#{account.number}</div>
                    <div className="text-[11px] text-gray-500 truncate">{account.address?.city}, {account.address?.state}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-primary-100 dark:border-primary-900/40 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary-600" />
                Set Location
              </h2>
              <p className="text-xs text-gray-500 mb-4">Finding branches near your job site.</p>
              
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block px-1">Job Site Address</label>
                    <div className="relative">
                      <GooglePlacesAutocomplete
                        value={shippingLocation?.address || ''}
                        onChange={handleAddressChange}
                        placeholder="Enter Address or Zip"
                        className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                      />
                      <MapPin className="absolute left-2.5 top-3 text-primary-500 h-4 w-4 pointer-events-none" />
                      <button
                        onClick={handleUseCurrentLocation}
                        disabled={isLocating}
                        title="Use Current Location"
                        className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-primary-600 transition-colors z-20"
                      >
                        {isLocating ? (
                          <div className="animate-spin h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full" />
                        ) : <Navigation className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {shippingLocation && (
                    <div className="px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800/50 flex items-start gap-2">
                       <Check className="h-3 w-3 text-primary-600 mt-0.5 flex-shrink-0" />
                       <div className="text-[11px] text-primary-700 dark:text-primary-300 leading-tight">
                         Results filtered for branches near: <span className="font-bold">{shippingLocation.address}</span>
                       </div>
                    </div>
                  )}
                </div>

                <style>{`
                  .pac-container { 
                      z-index: 9999 !important; 
                      border-radius: 8px;
                      margin-top: 4px;
                      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                      border: 1px solid #e5e7eb;
                  }
                `}</style>
            </div>
          )}
        </div>

        {/* Right Content: Branch List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 min-h-[600px] border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Select Branch Results
            </h2>

            {supplier === 'ABC Supply' && !selectedShipTo ? (
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

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Fetching local branches...</p>
                  </div>
                ) : isLocating ? (
                  <div className="flex flex-col items-center justify-center py-20 text-primary-500/50">
                    <div className="relative mb-4">
                      <Navigation className="w-12 h-12 animate-pulse" />
                      <div className="absolute inset-0 bg-primary-400/20 rounded-full animate-ping" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest">Determining Location...</p>
                    <p className="text-xs text-gray-400 mt-2">Checking GPS signal for nearby branches</p>
                  </div>
                ) : supplier === 'SRS' && (!shippingLocation?.lat || !shippingLocation?.lng) ? (
                  <div className="flex flex-col items-center justify-center py-20 text-blue-500/50">
                    <Navigation className="w-12 h-12 mb-4 animate-bounce" />
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-2">Ready to locate</p>
                    <p className="text-xs text-gray-400 mb-6 max-w-[200px] text-center">Enter an address above or use your GPS to find stores near you.</p>
                    <button
                      onClick={handleUseCurrentLocation}
                      disabled={isLocating}
                      className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-primary-600/20 active:scale-95 transition-all group"
                    >
                      <Navigation className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                      Auto-Detect My Location
                    </button>
                  </div>
                ) : paginatedBranches.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <X className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      {searchQuery ? `No branches found for "${searchQuery}"` : "No SRS branches found in this area."}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Try increasing the search radius or checking a different zip code.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-2">
                      {paginatedBranches.map((branch: any) => {
                        // Compute a normalized key for this branch
                        const branchKey = branch.number || branch.branchCode || branch.id;
                        const isSelected = !!(selectedBranch?.id && branchKey && selectedBranch.id === branchKey);
                        return (
                          <div
                            key={branchKey || Math.random()}
                            className={`p-4 rounded-lg border flex flex-col justify-between ${isSelected ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 transition-colors'}`}
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">{branch.name || branch.branchName}</h3>
                                {isSelected && <Check className="h-4 w-4 text-primary-600 flex-shrink-0" />}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Branch #{branchKey}</div>
                                {branch.address?.city && (
                                  <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                    {branch.address.city}, {branch.address.state}
                                  </div>
                                )}
                                {branch.phoneNumber && (
                                  <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                                    <Phone size={8} /> {branch.phoneNumber}
                                  </div>
                                )}
                                {branch.distance > 0 && (
                                  <div className="mt-2 text-[10px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/40 px-1.5 py-0.5 rounded w-fit capitalize">
                                    {Number(branch.distance).toFixed(1)} miles away
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => HandleBranchSelect(branch)}
                                className={`mt-3 w-full py-1.5 px-3 rounded text-sm font-medium transition-colors ${isSelected ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'}`}
                              >
                                {isSelected ? 'Selected' : 'Select Branch'}
                              </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Branch Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                        <span className="text-sm text-gray-500">
                          Page {pagination.page} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                          <button
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                            className="px-3 py-1 bg-gray-700 text-white rounded text-sm disabled:opacity-50 hover:bg-gray-600"
                          >
                            Previous
                          </button>
                          <button
                            disabled={pagination.page === totalPages}
                            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                            className="px-3 py-1 bg-gray-700 text-white rounded text-sm disabled:opacity-50 hover:bg-gray-600"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
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