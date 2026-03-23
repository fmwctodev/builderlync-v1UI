import { useState, useRef } from 'react';
import {
  MapPin,
  ArrowRight,
  Camera,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  Image,
  X,
  AlertTriangle,
} from 'lucide-react';
import type { Door, CanvassOutcome } from '../../types';

export interface CanvassingModePanelProps {
  currentDoor: Door | null;
  turfName?: string;
  doorsRemaining: number;
  isOnline: boolean;
  pendingSyncCount: number;
  pendingMediaCount?: number;
  onOutcomeSelect: (outcome: CanvassOutcome, notes?: string, tags?: string[]) => void;
  onNextDoor: () => void;
  onPhotoCapture?: (file: File, doorId: string) => void;
  onExitCanvassingMode: () => void;
  isSubmitting?: boolean;
}

const OUTCOME_OPTIONS: Array<{
  outcome: CanvassOutcome;
  label: string;
  color: string;
  bgColor: string;
}> = [
  { outcome: 'INTERESTED', label: 'Interested', color: 'text-white', bgColor: 'bg-green-600 hover:bg-green-700' },
  { outcome: 'NOT_INTERESTED', label: 'Not Interested', color: 'text-white', bgColor: 'bg-red-600 hover:bg-red-700' },
  { outcome: 'NO_ANSWER', label: 'No Answer', color: 'text-gray-900', bgColor: 'bg-yellow-400 hover:bg-yellow-500' },
  { outcome: 'FOLLOW_UP', label: 'Follow Up', color: 'text-white', bgColor: 'bg-orange-500 hover:bg-orange-600' },
  { outcome: 'APPOINTMENT_SET', label: 'Appointment', color: 'text-white', bgColor: 'bg-primary-600 hover:bg-primary-700' },
  { outcome: 'DO_NOT_KNOCK', label: 'Do Not Knock', color: 'text-white', bgColor: 'bg-gray-800 hover:bg-gray-900' },
];

const OBJECTION_TAGS = [
  'No damage visible',
  'Already has contractor',
  'Renter - not owner',
  'Just repaired',
  'No insurance',
  'Will call back',
  'Hostile',
  'No English',
];

export function CanvassingModePanel({
  currentDoor,
  turfName,
  doorsRemaining,
  isOnline,
  pendingSyncCount,
  pendingMediaCount = 0,
  onOutcomeSelect,
  onNextDoor,
  onPhotoCapture,
  onExitCanvassingMode,
  isSubmitting,
}: CanvassingModePanelProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<CanvassOutcome | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTags, setShowTags] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOutcomeClick = (outcome: CanvassOutcome) => {
    if (showNotes && selectedOutcome === outcome) {
      handleSubmit(outcome);
    } else {
      setSelectedOutcome(outcome);
      setShowNotes(true);
      const isObjection = ['NOT_INTERESTED', 'DO_NOT_KNOCK'].includes(outcome);
      setShowTags(isObjection);
    }
  };

  const handleSubmit = (outcome: CanvassOutcome) => {
    onOutcomeSelect(outcome, notes || undefined, selectedTags.length > 0 ? selectedTags : undefined);
    setNotes('');
    setShowNotes(false);
    setSelectedOutcome(null);
    setSelectedTags([]);
    setShowTags(false);
  };

  const handleSkipNotes = () => {
    if (selectedOutcome) {
      handleSubmit(selectedOutcome);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentDoor) return;

    setCapturedPhoto(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    onPhotoCapture?.(file, currentDoor.id);
  };

  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setCapturedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {turfName}
          </span>
          <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full">
            {doorsRemaining} remaining
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          {(pendingSyncCount > 0 || pendingMediaCount > 0) && (
            <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
              {isOnline ? (
                <Cloud className="w-3 h-3" />
              ) : (
                <CloudOff className="w-3 h-3" />
              )}
              {pendingSyncCount + pendingMediaCount}
            </span>
          )}
          <button
            onClick={onExitCanvassingMode}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Exit
          </button>
        </div>
      </div>

      <div className="p-4">
        {currentDoor ? (
          <>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <MapPin className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {currentDoor.address1}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentDoor.city}, {currentDoor.state} {currentDoor.zip}
                </p>
                {currentDoor.storm_match && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {currentDoor.storm_match.hail_size_inches
                      ? `${currentDoor.storm_match.hail_size_inches}" hail`
                      : 'Storm affected'}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleCameraClick}
                  className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative"
                >
                  <Camera className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  {pendingMediaCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                      {pendingMediaCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoChange}
            />

            {photoPreview && (
              <div className="relative mb-4 rounded-xl overflow-hidden">
                <img
                  src={photoPreview}
                  alt="Captured"
                  className="w-full h-32 object-cover"
                />
                <button
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
                  <Image className="w-3 h-3 text-white" />
                  <span className="text-xs text-white">{capturedPhoto?.name}</span>
                </div>
              </div>
            )}

            {showNotes && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setShowNotes(false)}
                    className="flex items-center gap-1 text-sm text-gray-500"
                  >
                    <ChevronUp className="w-4 h-4" />
                    Hide notes
                  </button>
                  <button
                    onClick={handleSkipNotes}
                    className="text-sm text-primary-600 dark:text-primary-400"
                  >
                    Skip & Submit
                  </button>
                </div>

                {showTags && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Objection tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {OBJECTION_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 border-gray-800 dark:border-gray-200'
                              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this visit..."
                  rows={2}
                  className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                {selectedOutcome && (
                  <button
                    onClick={() => handleSubmit(selectedOutcome)}
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Submit with Notes'}
                  </button>
                )}
              </div>
            )}

            {!showNotes && (
              <button
                onClick={() => setShowNotes(true)}
                className="flex items-center justify-center gap-1 w-full mb-4 py-2 text-sm text-gray-500 dark:text-gray-400"
              >
                <ChevronDown className="w-4 h-4" />
                Add notes
              </button>
            )}

            <div className="grid grid-cols-3 gap-2 mb-4">
              {OUTCOME_OPTIONS.map(({ outcome, label, color, bgColor }) => (
                <button
                  key={outcome}
                  onClick={() => handleOutcomeClick(outcome)}
                  disabled={isSubmitting}
                  className={`py-4 px-2 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${bgColor} ${color} ${
                    selectedOutcome === outcome ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={onNextDoor}
              disabled={isSubmitting || doorsRemaining === 0}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Skip to Next Door
              <ArrowRight className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              All Doors Visited!
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              You've completed all doors in this turf.
            </p>
            <button
              onClick={onExitCanvassingMode}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Finish Canvassing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
