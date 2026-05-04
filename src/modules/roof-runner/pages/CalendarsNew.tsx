import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import AppointmentListView from '../components/calendar/AppointmentListView';
import CalendarSettingsView from '../components/calendar/CalendarSettingsView';
import NewAppointmentModal from '../components/calendar/NewAppointmentModal';
import NewCalendarModal from '../components/calendar/NewCalendarModal';
import CalendarsOld from './Calendars';

type ViewMode = 'calendar' | 'appointments' | 'settings';

const CalendarsNew: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>('calendar');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showNewCalendarModal, setShowNewCalendarModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAppointmentSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCalendarSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="h-full flex flex-col bg-paper dark:bg-canvas">
      {/* Top Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView('calendar')}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeView === 'calendar'
                ? 'bg-primary-600 text-white rounded-t-lg'
                : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700'
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setActiveView('appointments')}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeView === 'appointments'
                ? 'bg-primary-600 text-white rounded-t-lg'
                : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700'
            }`}
          >
            Appointment List View
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className={`px-6 py-3 font-medium transition-all relative flex items-center gap-2 ${
              activeView === 'settings'
                ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-lg'
                : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            Calendar Settings
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'calendar' && (
          <CalendarsOld />
        )}
        {activeView === 'appointments' && (
          <AppointmentListView
            key={`appointments-${refreshKey}`}
            onNewAppointment={() => setShowNewAppointmentModal(true)}
          />
        )}
        {activeView === 'settings' && (
          <CalendarSettingsView
            key={`settings-${refreshKey}`}
            onNewCalendar={() => setShowNewCalendarModal(true)}
          />
        )}
      </div>

      {/* Modals */}
      <NewAppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        onSuccess={handleAppointmentSuccess}
      />
      <NewCalendarModal
        isOpen={showNewCalendarModal}
        onClose={() => setShowNewCalendarModal(false)}
        onSuccess={handleCalendarSuccess}
      />
    </div>
  );
};

export default CalendarsNew;
