import { useState, useEffect } from 'react';
import { X, Phone, MessageSquare, Image, Search, Check } from 'lucide-react';
import {
  fetchTwilioPhoneNumbers,
  importPhoneNumbers,
  fetchOrganizationPhoneNumbers,
  type TwilioPhoneNumber
} from '../services/phoneNumbersService';

interface ImportPhoneNumbersModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onImportSuccess: () => void;
}

type PhoneNumberType = 'all' | 'local' | 'toll-free' | 'mobile' | 'short-code';

export function ImportPhoneNumbersModal({
  isOpen,
  onClose,
  organizationId,
  onImportSuccess,
}: ImportPhoneNumbersModalProps) {
  const [loading, setLoading] = useState(false);
  const [twilioNumbers, setTwilioNumbers] = useState<TwilioPhoneNumber[]>([]);
  const [existingNumbers, setExistingNumbers] = useState<Set<string>>(new Set());
  const [selectedNumbers, setSelectedNumbers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<PhoneNumberType>('all');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPhoneNumbers();
    }
  }, [isOpen, organizationId]);

  const loadPhoneNumbers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch numbers from Twilio
      const twilioData = await fetchTwilioPhoneNumbers(organizationId);
      setTwilioNumbers(twilioData);

      // Fetch existing numbers from database
      const existingData = await fetchOrganizationPhoneNumbers(organizationId);
      const existingSet = new Set(existingData.map((n) => n.phone_number));
      setExistingNumbers(existingSet);
    } catch (err) {
      console.error('Error loading phone numbers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load phone numbers');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (selectedNumbers.size === 0) return;

    setImporting(true);
    setError(null);
    try {
      const numbersToImport = twilioNumbers.filter((n) =>
        selectedNumbers.has(n.sid) && !existingNumbers.has(n.phoneNumber)
      );

      await importPhoneNumbers(organizationId, numbersToImport);
      onImportSuccess();
      onClose();
    } catch (err) {
      console.error('Error importing phone numbers:', err);
      setError(err instanceof Error ? err.message : 'Failed to import phone numbers');
    } finally {
      setImporting(false);
    }
  };

  const handleToggleNumber = (sid: string) => {
    const newSelected = new Set(selectedNumbers);
    if (newSelected.has(sid)) {
      newSelected.delete(sid);
    } else {
      newSelected.add(sid);
    }
    setSelectedNumbers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedNumbers.size === filteredNumbers.filter(n => !existingNumbers.has(n.phoneNumber)).length) {
      setSelectedNumbers(new Set());
    } else {
      const allAvailable = filteredNumbers
        .filter((n) => !existingNumbers.has(n.phoneNumber))
        .map((n) => n.sid);
      setSelectedNumbers(new Set(allAvailable));
    }
  };

  const filteredNumbers = twilioNumbers.filter((number) => {
    // Filter by type
    if (filterType !== 'all' && number.phoneNumberType !== filterType) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        number.phoneNumber.toLowerCase().includes(query) ||
        number.friendlyName.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'local':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'toll-free':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'mobile':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'short-code':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Import Phone Numbers from Twilio
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search phone numbers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as PhoneNumberType)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Types</option>
              <option value="local">Local</option>
              <option value="toll-free">Toll-Free</option>
              <option value="mobile">Mobile</option>
              <option value="short-code">Short Code</option>
            </select>
          </div>

          {filteredNumbers.length > 0 && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="select-all"
                checked={
                  selectedNumbers.size > 0 &&
                  selectedNumbers.size === filteredNumbers.filter(n => !existingNumbers.has(n.phoneNumber)).length
                }
                onChange={handleSelectAll}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label
                htmlFor="select-all"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Select All Available
              </label>
              {selectedNumbers.size > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({selectedNumbers.size} selected)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : filteredNumbers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || filterType !== 'all'
                  ? 'No phone numbers match your filters'
                  : 'No phone numbers available in your Twilio account'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNumbers.map((number) => {
                const isExisting = existingNumbers.has(number.phoneNumber);
                const isSelected = selectedNumbers.has(number.sid);

                return (
                  <div
                    key={number.sid}
                    className={`flex items-center gap-4 p-4 border rounded-lg ${
                      isExisting
                        ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 opacity-60'
                        : isSelected
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleNumber(number.sid)}
                      disabled={isExisting}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {number.phoneNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeBadgeColor(
                            number.phoneNumberType
                          )}`}
                        >
                          {number.phoneNumberType.replace('-', ' ')}
                        </span>
                        {isExisting && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            Already imported
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {number.friendlyName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {number.capabilities.voice && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4" />
                        </div>
                      )}
                      {number.capabilities.sms && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                      )}
                      {number.capabilities.mms && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Image className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedNumbers.size > 0 && (
              <span>{selectedNumbers.size} number(s) selected for import</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={importing}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedNumbers.size === 0 || importing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Import {selectedNumbers.size > 0 ? `(${selectedNumbers.size})` : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
