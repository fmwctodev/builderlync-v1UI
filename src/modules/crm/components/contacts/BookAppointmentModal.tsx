import React, { useState, useEffect } from 'react';
import { X, Users, User, Clock, MapPin, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  contactName: string;
  contactEmail: string;
  contactId: number;
}

export function BookAppointmentModal({ isOpen, onClose, onSubmit, contactName, contactEmail, contactId }: BookAppointmentModalProps) {
  console.log('BookAppointmentModal rendered with isOpen:', isOpen);
  const [formData, setFormData] = useState({
    appointmentType: '',
    title: '',
    description: '',
    teamMember: '',
    timezone: '',
    date: '',
    startTime: '',
    endTime: '',
    locationType: 'default',
    customLocation: '',
    status: 'confirmed',
    attendees: 1,
    internalNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [appointmentTypes] = useState([
    'Christmas Light Booking',
    'Consultation',
    'Follow-up Meeting',
    'Site Visit',
    'Project Review'
  ]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [calendarSettings, setCalendarSettings] = useState(null);
  const [internalNotes, setInternalNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  useEffect(() => {
    console.log('Modal opened:', isOpen);
    if (isOpen) {
      console.log('Starting API calls...');
      fetchTeamMembers();
      fetchTimezones();
      fetchCalendarSettings();
      if (contactId) {
        fetchInternalNotes();
      }
      if (formData.date) {
        fetchAvailableSlots();
      }
    }
  }, [isOpen, formData.date, formData.teamMember, contactId]);

  const fetchTeamMembers = async () => {
    console.log('Fetching team members...');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/team-members`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      console.log('Team members response:', result);
      if (result.success) {
        setTeamMembers(result.data);
        console.log('Team members set:', result.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchTimezones = async () => {
    console.log('Fetching timezones...');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/calendar/timezones`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      console.log('Timezones response:', result);
      if (result.success) {
        setTimezones(result.data);
        console.log('Timezones set:', result.data);
      }
    } catch (error) {
      console.error('Error fetching timezones:', error);
    }
  };

  const fetchCalendarSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/calendar/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setCalendarSettings(result.data);
        setFormData(prev => ({
          ...prev,
          appointmentType: appointmentTypes[0] || '',
          timezone: result.data.timezone || 'GMT-06:00 America/Chicago (CST)'
        }));
      }
    } catch (error) {
      console.error('Error fetching calendar settings:', error);
    }
  };

  const fetchInternalNotes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contacts/${contactId}/internal-notes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setInternalNotes(result.data);
      }
    } catch (error) {
      console.error('Error fetching internal notes:', error);
    }
  };

  const addInternalNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/internal-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          contactId: contactId,
          content: newNote
        })
      });
      
      if (response.ok) {
        setNewNote('');
        setShowNoteInput(false);
        fetchInternalNotes();
      }
    } catch (error) {
      console.error('Error adding internal note:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!formData.date) return;
    
    const slots = [];
    const startHour = calendarSettings?.workingHours?.start ? parseInt(calendarSettings.workingHours.start.split(':')[0]) : 9;
    const endHour = calendarSettings?.workingHours?.end ? parseInt(calendarSettings.workingHours.end.split(':')[0]) : 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      const endTimeStr = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({
        start: timeStr,
        end: endTimeStr,
        display: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'} - ${hour + 1 > 12 ? hour + 1 - 12 : hour + 1}:00 ${hour + 1 >= 12 ? 'PM' : 'AM'}`
      });
    }
    setAvailableSlots(slots);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    console.log('Modal not open, returning null');
    return null;
  }
  
  console.log('Modal is open, rendering content');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Book Appointment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex">
          {/* Left Panel */}
          <div className="flex-1 p-6 space-y-6">
            <div>
              <select
                value={formData.appointmentType}
                onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select appointment type</option>
                {appointmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Appointment Title
              </label>
              <input
                type="text"
                placeholder={`Appointment with ${contactName}`}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <button className="text-blue-600 text-sm font-medium">Add Description</button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Team Member
              </label>
              <select
                value={formData.teamMember}
                onChange={(e) => setFormData({ ...formData, teamMember: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Calendar Default</option>
                {teamMembers.length === 0 ? (
                  <option disabled>Loading team members...</option>
                ) : (
                  teamMembers.map((member: any) => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date & Time
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Showing slots in this timezone: (Account Timezone)
                  </p>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select timezone</option>
                    {timezones.length === 0 ? (
                      <option disabled>Loading timezones...</option>
                    ) : (
                      timezones.map((tz: string) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="flex space-x-2 border-b">
                  <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-medium">Default</button>
                  <button className="px-4 py-2 text-gray-600">Custom</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slot</label>
                    <select
                      value={formData.startTime && formData.endTime ? `${formData.startTime} - ${formData.endTime}` : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const [start, end] = e.target.value.split(' - ');
                          setFormData({ ...formData, startTime: start, endTime: end });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select time slot</option>
                      {availableSlots.map((slot: any) => (
                        <option key={`${slot.start}-${slot.end}`} value={`${slot.start} - ${slot.end}`}>
                          {slot.display}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meeting Location
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="location"
                    value="default"
                    checked={formData.locationType === 'default'}
                    onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                    className="mr-2"
                  />
                  <div>
                    <div className="font-medium">{calendarSettings?.defaultLocation || 'Calendar Default'}</div>
                    <div className="text-sm text-gray-500">As configured in the calendar</div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="location"
                    value="custom"
                    checked={formData.locationType === 'custom'}
                    onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                    className="mr-2"
                  />
                  <div>
                    <div className="font-medium">Custom</div>
                    <div className="text-sm text-gray-500">Set specific to this appointment</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Status :</span>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Booking...' : 'Book Appointment'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-80 bg-gray-50 dark:bg-gray-700 p-6 space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Users size={16} />
                <span className="font-medium">Attendees</span>
              </div>
              <div className="text-2xl font-bold">{formData.attendees}</div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-3">
                <User size={16} />
                <span className="font-medium">Contact</span>
              </div>
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div>
                  <div className="font-medium">{contactEmail}</div>
                  <div className="text-sm text-gray-500">
                    {formData.date && formData.startTime && formData.endTime ? (
                      <>
                        {new Date(formData.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}, {formData.startTime} - {formData.endTime}<br />
                        Contact's Local Time<br />
                        (America/Chicago)
                      </>
                    ) : (
                      'Select date and time'
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Clock size={16} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MapPin size={16} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="font-medium mb-2">Internal Notes</div>
              
              {internalNotes.length > 0 && (
                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                  {internalNotes.map((note: any) => (
                    <div key={note.id} className="bg-white dark:bg-gray-800 p-2 rounded text-sm">
                      <div className="text-gray-600 dark:text-gray-400 text-xs">
                        {note.creator?.first_name} {note.creator?.last_name} - {new Date(note.created_at).toLocaleDateString()}
                      </div>
                      <div>{note.content}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {showNoteInput ? (
                <div className="space-y-2">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add internal note..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={addInternalNote}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowNoteInput(false);
                        setNewNote('');
                      }}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowNoteInput(true)}
                  className="flex items-center space-x-2 text-blue-600 text-sm"
                >
                  <span>+</span>
                  <span>Add Internal Note</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}