import { useState } from 'react';
import { ChevronDown, Cloud, Calendar, MapPin, Check } from 'lucide-react';
import type { StormEvent } from '../../types';

export interface StormEventSelectorProps {
  events: StormEvent[];
  selectedEventId?: string | null;
  onEventSelect: (event: StormEvent | null) => void;
  isLoading?: boolean;
}

export function StormEventSelector({
  events,
  selectedEventId,
  onEventSelect,
  isLoading,
}: StormEventSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors disabled:opacity-50"
      >
        <div className="flex items-center gap-3">
          <Cloud className="w-5 h-5 text-blue-500" />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedEvent ? selectedEvent.name : 'Select Storm Event'}
            </p>
            {selectedEvent && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedEvent.event_date || 'Date unknown'}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
            <button
              onClick={() => {
                onEventSelect(null);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                !selectedEventId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <Cloud className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">All Events</span>
              {!selectedEventId && <Check className="w-4 h-4 text-blue-500 ml-auto" />}
            </button>

            {events.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No storm events found</p>
              </div>
            ) : (
              events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    onEventSelect(event);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border-t border-gray-100 dark:border-gray-700 ${
                    selectedEventId === event.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <Cloud className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {event.event_date && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {event.event_date}
                        </span>
                      )}
                      {event.center_lat && event.center_lng && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin className="w-3 h-3" />
                          {event.center_lat.toFixed(2)}, {event.center_lng.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  {selectedEventId === event.id && (
                    <Check className="w-4 h-4 text-blue-500 mt-1" />
                  )}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
