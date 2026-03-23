import React, { useState } from 'react';
import { ChevronDown, Building2, Check, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { useABCSupply } from '../../context/ABCSupplyContext';
import { ABCSupplyAccount } from '../../services/abcSupplyApi';

interface ShipToAccountSelectorProps {
  onAddAccount?: () => void;
  compact?: boolean;
  className?: string;
}

export default function ShipToAccountSelector({
  onAddAccount,
  compact = false,
  className = '',
}: ShipToAccountSelectorProps) {
  const {
    accounts,
    selectedAccount,
    selectAccount,
    isLoadingAccounts,
    accountsError,
    refreshAccounts,
  } = useABCSupply();

  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (account: ABCSupplyAccount) => {
    selectAccount(account);
    setIsOpen(false);
  };

  if (isLoadingAccounts) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading accounts...</span>
      </div>
    );
  }

  if (accountsError) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{accountsError}</span>
        </div>
        <button
          onClick={refreshAccounts}
          className="text-sm text-primary-400 hover:text-primary-300"
        >
          Retry
        </button>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2 text-gray-400">
          <Building2 className="h-4 w-4" />
          <span className="text-sm">No ABC Supply accounts configured</span>
        </div>
        {onAddAccount && (
          <button
            onClick={onAddAccount}
            className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-3 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition ${
          compact ? 'px-3 py-2' : 'px-4 py-3 w-full'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 h-8 w-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary-400" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs text-gray-400">Ship-To Account</p>
            <p className="text-sm font-medium text-white truncate">
              {selectedAccount
                ? selectedAccount.accountName || `Account ${selectedAccount.accountNumber}`
                : 'Select Account'}
            </p>
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Available Accounts
              </p>
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleSelect(account)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                    selectedAccount?.id === account.id
                      ? 'bg-primary-500/20 text-white'
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {account.accountName || `Account ${account.accountNumber}`}
                      </p>
                      {account.isDefault && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      #{account.accountNumber}
                      {account.city && account.state && ` - ${account.city}, ${account.state}`}
                    </p>
                    {account.accessibleBranchNumbers.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {account.accessibleBranchNumbers.length} branch{account.accessibleBranchNumbers.length !== 1 ? 'es' : ''} available
                      </p>
                    )}
                  </div>
                  {selectedAccount?.id === account.id && (
                    <Check className="h-5 w-5 text-primary-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            {onAddAccount && (
              <div className="border-t border-gray-700 p-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onAddAccount();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary-400 hover:bg-gray-700 rounded-lg transition"
                >
                  <Plus className="h-4 w-4" />
                  Add New Account
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
