import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Plus, Calendar as CalendarIcon } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  type: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  job: string;
  guests: string[];
  description: string;
}

const Calendars: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    job: '',
    teamMember: '',
    clientName: '',
    clientEmail: '',
    guests: [] as string[],
    description: ''
  });

  const jobs = [
    { id: '1', name: 'Job 1 - Main Street Roof', client: { name: 'John Smith', email: 'john.smith@email.com' } },
    { id: '2', name: 'Job 2 - Oak Avenue Repair', client: { name: 'Sarah Johnson', email: 'sarah.j@email.com' } },
    { id: '3', name: 'Job 3 - Pine Street Installation', client: { name: 'Mike Wilson', email: 'mike.w@email.com' } }
  ];
  const teamMembers = ['John Doe - Sales Rep', 'Jane Smith - Project Manager', 'Mike Johnson - Installer', 'Sarah Wilson - Admin'];
  const guests = ['Additional Guest 1', 'Additional Guest 2', 'Contractor Partner'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setFormData({
      ...formData,
      startDate: clickedDate.toISOString().split('T')[0],
      endDate: clickedDate.toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Event = {
      id: Date.now().toString(),
      ...formData
    };
    setEvents([...events, newEvent]);
    setShowModal(false);
    setFormData({
      type: '',
      title: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      job: '',
      teamMember: '',
      clientName: '',
      clientEmail: '',
      guests: [],
      description: ''
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] border-r border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.getDate() === day &&
               eventDate.getMonth() === currentDate.getMonth() &&
               eventDate.getFullYear() === currentDate.getFullYear();
      });

      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`min-h-[120px] border-r border-b border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-750 transition-all duration-200 group ${
            isToday ? 'bg-primary-50 dark:bg-primary-900/20' : ''
          }`}
        >
          <div className={`flex items-center justify-between mb-2`}>
            <span className={`text-sm font-semibold ${
              isToday
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-900 dark:text-white'
            }`}>
              {day}
            </span>
            {isToday && (
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            )}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map(event => (
              <div
                key={event.id}
                className="text-xs bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-md px-2 py-1 truncate shadow-sm hover:shadow-md transition-shadow"
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2">
            <Plus className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Calendar Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all duration-200 shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white min-w-[200px] text-center px-4">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all duration-200 shadow-sm"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedDate(new Date());
                setFormData({...formData, startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0]});
                setShowModal(true);
              }}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid - Wider Layout */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col" style={{minHeight: '600px'}}>
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex-shrink-0">
          {dayNames.map(day => (
            <div key={day} className="p-4 text-center font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
          <div className="grid grid-cols-7">
            {renderCalendar()}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">New Event</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Event Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select event type</option>
                  <option value="meeting">📋 Meeting</option>
                  <option value="appointment">📅 Appointment</option>
                  <option value="inspection">🔍 Inspection</option>
                  <option value="installation">🔧 Installation</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Event Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter event title..."
                  required
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Start Time
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  End Time
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Associated Job</label>
                <select
                  value={formData.job}
                  onChange={(e) => {
                    const selectedJob = jobs.find(job => job.id === e.target.value);
                    setFormData({
                      ...formData, 
                      job: e.target.value,
                      clientName: selectedJob?.client.name || '',
                      clientEmail: selectedJob?.client.email || ''
                    });
                  }}
                  className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">🏠 Select a job (optional)</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>🔨 {job.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Assign Team Member</label>
                <select
                  value={formData.teamMember}
                  onChange={(e) => setFormData({...formData, teamMember: e.target.value})}
                  className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">👥 Select team member</option>
                  {teamMembers.map(member => (
                    <option key={member} value={member}>👤 {member}</option>
                  ))}
                </select>
              </div>

              {formData.job && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Client Information (Auto-filled)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-blue-600 dark:text-blue-400">Client Name</label>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                        className="input w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Client name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-blue-600 dark:text-blue-400">Client Email</label>
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                        className="input w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="client@email.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Additional Guests (Optional)</label>
                <select
                  multiple
                  value={formData.guests}
                  onChange={(e) => setFormData({...formData, guests: Array.from(e.target.selectedOptions, option => option.value)})}
                  className="input w-full h-24 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {guests.map(guest => (
                    <option key={guest} value={guest} className="py-2">👤 {guest}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">💡 Hold Ctrl/Cmd to select multiple additional guests</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input w-full h-28 resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add event details, notes, or agenda..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Create Event
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendars;