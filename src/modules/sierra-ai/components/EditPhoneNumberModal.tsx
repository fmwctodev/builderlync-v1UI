import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { updatePhoneNumber, type PhoneNumber } from '../services/phoneNumbersService';

interface EditPhoneNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: PhoneNumber;
  onEditSuccess: () => void;
}

export function EditPhoneNumberModal({
  isOpen,
  onClose,
  phoneNumber,
  onEditSuccess,
}: EditPhoneNumberModalProps) {
  const [friendlyName, setFriendlyName] = useState(phoneNumber.friendly_name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!friendlyName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updatePhoneNumber(phoneNumber.id, {
        friendly_name: friendlyName.trim(),
      });
      onEditSuccess();
    } catch (err) {
      console.error('Error updating phone number:', err);
      setError(err instanceof Error ? err.message : 'Failed to update phone number');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !saving) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Phone Number
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <div className="px-3 py-2 bg-paper dark:bg-canvas border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
              {phoneNumber.phone_number}
            </div>
          </div>

          <div>
            <label
              htmlFor="friendly-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Friendly Name
            </label>
            <input
              id="friendly-name"
              type="text"
              value={friendlyName}
              onChange={(e) => setFriendlyName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a friendly name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !friendlyName.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
