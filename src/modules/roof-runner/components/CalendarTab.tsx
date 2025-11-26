import React, { useState, useEffect } from 'react';
import { Plus, ExternalLink, Calendar as CalendarIcon, X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Job } from '../../../shared/store/services/jobsApi';
import { StaffMember } from '../../../shared/store/services/staffApi';
import { createJobEvent, getAllEvents, Event } from '../../../shared/store/services/eventsApi';

interface CalendarTabProps {
  jobId?: number;
  jobData?: Job;
  staff?: StaffMember[];
}

const CalendarTab: React.FC<CalendarTabProps> = ({ jobId, jobData, staff = [] }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    contactId: undefined as number | undefined,
    contactName: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: false,
    location: '',
    teamMember: '',
    invitees: [] as string[],
    description: ''
  });

  const fetchEvents = async () => {
    try {
      const response = await getAllEvents();
      const allEvents = response.data || [];
      if (jobId) {
        const jobEvents = allEvents.filter((event: any) => event.job_id === jobId);
        setEvents(jobEvents);
      } else {
        setEvents(allEvents);
      }
    } catch (error: any) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [jobId]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (showModal && !formData.allDay) {
      const timer = setTimeout(() => {
        initAutocomplete();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showModal, formData.allDay]);

  const initAutocomplete = () => {
    if (window.google?.maps?.places) {
      const input = document.getElementById('calendar-location-input') as HTMLInputElement;
      if (input) {
        const autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            setFormData(prev => ({...prev, location: place.formatted_address || ''}));
          }
        });
      }
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.onload = () => {
        setTimeout(initAutocomplete, 100);
      };
      document.head.appendChild(script);
    }
  };

  const handleOpenEventModal = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const defaultAssignee = jobData?.assignees && jobData.assignees.length > 0
      ? staff.find(s => s.id === parseInt(jobData.assignees[0]))
      : jobData?.jobOwner
        ? staff.find(s => `${s.first_name} ${s.last_name}` === jobData.jobOwner)
        : staff[0];

    setFormData({
      type: '',
      title: '',
      contactId: jobData?.contactId || undefined,
      contactName: jobData?.contactName || '',
      startDate: dateStr,
      startTime: '',
      endDate: dateStr,
      endTime: '',
      allDay: false,
      location: jobData?.location || '',
      teamMember: defaultAssignee ? `${defaultAssignee.first_name} ${defaultAssignee.last_name}` : '',
      invitees: [],
      description: jobData ? `Event for job: ${jobData.name}` : ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!jobId) {
        setToast({ message: 'Job ID is required to create an event', type: 'error' });
        setLoading(false);
        return;
      }

      const eventData = {
        type: formData.type,
        title: formData.title,
        contactId: formData.contactId,
        contactName: formData.contactName,
        startDate: formData.startDate,
        startTime: formData.allDay ? '00:00' : formData.startTime,
        endDate: formData.endDate,
        endTime: formData.allDay ? '23:59' : formData.endTime,
        allDay: formData.allDay,
        location: formData.location,
        invitees: formData.invitees,
        description: formData.description,
        createdBy: 1,
        createdByName: 'Current User'
      };

      await createJobEvent(jobId, eventData);
      setToast({ message: 'Event created successfully!', type: 'success' });
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      setToast({ message: 'Failed to create event', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewCalendar = () => {
    navigate('/calendars');
  };

  return (
    <div className="h-full flex flex-col">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Calendar</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleViewCalendar}
              className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View calendar</span>
            </button>
            <button
              onClick={handleOpenEventModal}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Event</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {jobData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Job Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Contact:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{jobData.contactName || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Location:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{jobData.location || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Owner:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{jobData.jobOwner || 'Not assigned'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Stage:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{jobData.workflowStages || 'Not specified'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Events</h3>
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {event.contactName && (
                          <div>
                            <span className="font-medium">Contact:</span> {event.contactName}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Date:</span> {(event as any).start_date || event.startDate}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {(event as any).start_time || event.startTime}
                        </div>
                        {event.location && (
                          <div>
                            <span className="font-medium">Location:</span> {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No events scheduled for this job yet.</p>
              <p className="text-sm mt-1">Click "+ Event" to schedule your first event.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
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

            <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Event Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select event type</option>
                    <option value="meeting">Meeting</option>
                    <option value="appointment">Appointment</option>
                    <option value="inspection">Inspection</option>
                    <option value="installation">Installation</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Event Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter event title..."
                    required
                  />
                </div>

                {jobData && formData.contactName && (
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-primary-700 dark:text-primary-300 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Contact (Auto-filled from job)
                    </h4>
                    <div className="text-sm text-primary-600 dark:text-primary-400 flex items-center">
                      <span className="font-medium">{formData.contactName}</span>
                    </div>
                  </div>
                )}

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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Time</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required={!formData.allDay}
                        disabled={formData.allDay}
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Time</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required={!formData.allDay}
                        disabled={formData.allDay}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allDay}
                      onChange={(e) => setFormData({...formData, allDay: e.target.checked})}
                      className="mr-2 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">All Day Event</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Location {jobData && <span className="text-xs text-primary-600 dark:text-primary-400">(Auto-filled from job)</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter event location..."
                    id="calendar-location-input"
                  />
                </div>

                {jobData && (
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-primary-700 dark:text-primary-300 flex items-center">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                      Associated Job (Optional)
                    </h4>
                    <div className="text-sm text-primary-600 dark:text-primary-400">
                      <span className="font-medium">{jobData.name}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Assign Team Member {jobData && <span className="text-xs text-primary-600 dark:text-primary-400">(Auto-filled from job)</span>}
                  </label>
                  <select
                    value={formData.teamMember}
                    onChange={(e) => setFormData({...formData, teamMember: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select team member</option>
                    {staff.map(member => (
                      <option key={member.id} value={`${member.first_name} ${member.last_name}`}>
                        {member.first_name} {member.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full h-28 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    disabled={loading}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Event'}
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

export default CalendarTab;
