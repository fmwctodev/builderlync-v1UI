import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { validatePitch } from '../../utils/pitchUtils';

interface PitchRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pitch: number) => void;
}

export function PitchRequiredModal({
  isOpen,
  onClose,
  onSubmit,
}: PitchRequiredModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setError(null);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError(null);
  };

  const handleSubmit = useCallback(() => {
    const validation = validatePitch(inputValue);
    if (!validation.valid) {
      setError(validation.error || 'Invalid pitch');
      return;
    }
    onSubmit(validation.numericValue!);
  }, [inputValue, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    },
    [onClose, handleSubmit]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Pitch needed
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          This calculation requires roof pitch. Enter it to continue.
        </p>

        <div className="mb-6">
          <label
            htmlFor="pitch-input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Roof Pitch
          </label>
          <div className="flex items-center gap-2">
            <input
              id="pitch-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="e.g., 6"
              className={`w-24 px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              autoFocus
            />
            <span className="text-gray-600 dark:text-gray-400">/12</span>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
