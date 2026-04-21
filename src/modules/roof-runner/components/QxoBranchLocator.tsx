import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, CheckCircle2, Building, ChevronLeft, Loader2 } from 'lucide-react';
import { qxoApi } from '../services/qxoApi';

interface QxoBranchLocatorProps {
  onBack?: () => void;
}

export default function QxoBranchLocator({ onBack }: QxoBranchLocatorProps) {
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('qxo_selected_branch');
    if (saved) {
      try {
        const branch = JSON.parse(saved);
        if (branch.id) setSelectedBranchId(branch.id);
      } catch (e) {
        console.error(e);
      }
    }
    
    // Only auto-search if we have a saved zip or can get location
  }, []);

  const handleSearch = async (e: React.FormEvent, initial = false) => {
    e?.preventDefault();
    if (!initial && !zipCode && !city) return;
    
    setLoading(true);
    setHasSearched(!initial);
    try {
      const result = await qxoApi.getBranches({ zipCode, city });
      if (result.success && result.data) {
        // Backend ResponseHandler might wrap the service output in another { success, data } object
        const extracted = Array.isArray(result.data) ? result.data : (result.data.data || []);
        setBranches(extracted);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error('Failed to search Beacon branches:', error);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBranch = (branch: any) => {
    const branchObj = {
      id: branch.branchNumber || branch.market || branch.branchName,
      name: branch.branchName || `Branch #${branch.branchNumber}`,
      address: branch.address || branch.branchAddressObj || {}
    };
    localStorage.setItem('qxo_selected_branch', JSON.stringify(branchObj));
    setSelectedBranchId(branchObj.id);
    
    setTimeout(() => {
        if (onBack) onBack();
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col min-h-[500px]">
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building className="h-7 w-7 text-primary-600" />
                Beacon Pro+ Branch Locator
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Find and connect to a local branch for precise inventory availability and pricing.</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ZIP Code
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>
            
            <div className="flex-1 w-full">
               <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 City
               </label>
               <input
                 type="text"
                 id="city"
                 value={city}
                 onChange={(e) => setCity(e.target.value)}
                 className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                 placeholder="Optional city"
               />
            </div>
            
            <div className="w-full sm:w-auto flex-shrink-0">
               <button
                type="submit"
                disabled={loading || (!zipCode && !city)}
                className="w-full sm:w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all active:scale-95 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : <><Search className="h-5 w-5 mr-2" /> Search Branches</>}
              </button>
            </div>

            <div className="w-full sm:w-auto flex-shrink-0">
               <button
                type="button"
                onClick={() => {
                   if (navigator.geolocation) {
                     setLoading(true);
                     navigator.geolocation.getCurrentPosition(async (pos) => {
                        // We'd ideally reverse geocode, but for now we can just search with current lat/lng if API supports it
                        // Or just show a message.
                        // Let's assume we want to encourage them to enter ZIP for accuracy.
                        alert("Please enter your ZIP code for the most accurate branch local results.");
                        setLoading(false);
                     }, () => setLoading(false));
                   }
                }}
                className="w-full sm:w-auto flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <MapPin className="h-5 w-5 mr-2" /> Use My Location
              </button>
            </div>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 dark:bg-gray-900/50">
          {loading ? (
            <div className="flex items-center justify-center p-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : branches.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {branches.map((branch, idx) => {
                const id = branch.branchNumber || branch.market || branch.branchName;
                const isSelected = selectedBranchId === id;
                const address = branch.address || branch.branchAddressObj || {};
                const branchName = branch.branchName || `Branch #${branch.branchNumber}`;
                
                return (
                  <div
                    key={id || idx}
                    className={`
                      relative p-6 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md
                      ${isSelected 
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700'}
                    `}
                    onClick={() => handleSelectBranch(branch)}
                  >
                    {isSelected && (
                      <div className="absolute top-5 right-5">
                        <CheckCircle2 className="h-7 w-7 text-primary-600" />
                      </div>
                    )}
                    
                    <div className="flex items-start gap-5">
                      <div className={`
                        h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0
                        ${isSelected ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                      `}>
                        <Building className="h-7 w-7" />
                      </div>
                      
                      <div className="pr-10">
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                           {branchName} {branch.branchNumber ? <span className="text-sm text-gray-400 font-normal">#{branch.branchNumber}</span> : null}
                         </h3>
                         <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1.5 mt-2">
                           <div className="flex items-start gap-2">
                             <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                             <span className="leading-tight">
                               {address.address1}<br />
                               {address.city}, {address.state} {address.postalCode}
                             </span>
                           </div>
                           {branch.branchPhone && (
                             <div className="flex items-center gap-2 mt-3 text-gray-800 dark:text-gray-300 font-medium">
                               <Phone className="h-4 w-4 text-gray-400" />
                               <span>{branch.branchPhone}</span>
                             </div>
                           )}
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : hasSearched ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <Building className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No branches found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your search criteria or switching Zip Codes.</p>
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <Search className="mx-auto h-16 w-16 text-gray-200 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Find a Branch</h3>
              <p className="mt-2 text-gray-500 max-w-sm mx-auto">Enter a ZIP code or City to find Beacon Pro+ branches near you.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
