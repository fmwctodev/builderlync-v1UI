import React from 'react';

interface AppointmentsTabProps {
  onAddAppointment: () => void;
}

const AppointmentsTab: React.FC<AppointmentsTabProps> = ({ onAddAppointment }) => {
  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Appointments
          </h3>
          <button 
            onClick={onAddAppointment}
            className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded text-sm font-medium"
          >
            + Add
          </button>
        </div>

        <div className="text-center py-16">
          <div className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-1">
            No appointments for this contact
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Click <button 
              onClick={onAddAppointment}
              className="text-blue-600 hover:underline font-medium"
            >here</button> to create one
          </p>
        </div>
      </div>
    </>
  );
};

export default AppointmentsTab;