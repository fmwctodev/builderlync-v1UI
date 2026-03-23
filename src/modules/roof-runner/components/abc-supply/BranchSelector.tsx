import React, { useState } from 'react';
import { ChevronDown, MapPin, Check, AlertCircle, RefreshCw, Phone, Clock } from 'lucide-react';
import { useABCSupply } from '../../context/ABCSupplyContext';
import { ABCSupplyBranch } from '../../services/abcSupplyApi';

interface BranchSelectorProps {
  compact?: boolean;
  className?: string;
  showHours?: boolean;
}

export default function BranchSelector({
  compact = false,
  className = '',
  showHours = false,
}: BranchSelectorProps) {
  const {
    branches,
    selectedAccount,
    selectedBranch,
    selectBranch,
    isLoadingBranches,
    branchesError,
    refreshBranches,
    cartItems,
  } = useABCSupply();

  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (branch: ABCSupplyBranch) => {
    selectBranch(branch);
    setIsOpen(false);
  };

  if (!selectedAccount) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <MapPin className="h-4 w-4" />
        <span className="text-sm">Select an account first</span>
      </div>
    );
  }

  if (isLoadingBranches) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading branches...</span>
      </div>
    );
  }

  if (branchesError) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{branchesError}</span>
        </div>
        <button
          onClick={refreshBranches}
          className="text-sm text-primary-400 hover:text-primary-300"
        >
          Retry
        </button>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <MapPin className="h-4 w-4" />
        <span className="text-sm">No branches available for this account</span>
      </div>
    );
  }

  const formatHours = (hours: Record<string, string>) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return hours[today] || 'Hours not available';
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-3 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition ${
          compact ? 'px-3 py-2' : 'px-4 py-3 w-full'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 h-8 w-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <MapPin className="h-4 w-4 text-green-400" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs text-gray-400">Branch Location</p>
            {selectedBranch ? (
              <>
                <p className="text-sm font-medium text-white truncate">
                  {selectedBranch.branchName}
                </p>
                {showHours && selectedBranch.hours && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {formatHours(selectedBranch.hours)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm font-medium text-amber-400">
                Select a Branch
              </p>
            )}
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {!selectedBranch && cartItems.length > 0 && (
        <p className="mt-1 text-xs text-amber-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Select a branch to view pricing for your cart items
        </p>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Available Branches ({branches.length})
              </p>
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleSelect(branch)}
                  className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg transition text-left ${
                    selectedBranch?.id === branch.id
                      ? 'bg-primary-500/20 text-white'
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-lg flex items-center justify-center mt-0.5">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {branch.branchName}
                      </p>
                      <span className="flex-shrink-0 px-1.5 py-0.5 text-xs bg-gray-600 text-gray-300 rounded">
                        #{branch.branchNumber}
                      </span>
                    </div>
                    {branch.addressLine1 && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {branch.addressLine1}
                        {branch.city && `, ${branch.city}`}
                        {branch.state && `, ${branch.state}`}
                        {branch.zipCode && ` ${branch.zipCode}`}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                      {branch.phone && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {branch.phone}
                        </span>
                      )}
                      {branch.hours && Object.keys(branch.hours).length > 0 && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Today: {formatHours(branch.hours)}
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedBranch?.id === branch.id && (
                    <Check className="h-5 w-5 text-primary-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
