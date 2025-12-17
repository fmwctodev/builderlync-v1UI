import React, { useState, useEffect } from 'react';
import { X, User, Info } from 'lucide-react';
import { AddAppointmentModalProps, CreateAppointmentData } from '../../../types';

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<CreateAppointmentData>({
    calendar: '',
    title: '',
    description: '',
    teamMember: '',
    date: '',
    slot: '',
    timezone: '',
    location: 'Calendar Default',
    status: 'confirmed'
  });
  const [showDescription, setShowDescription] = useState(false);
  const [activeTab, setActiveTab] = useState<'default' | 'custom'>('default');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [timezones, setTimezones] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [calendarTypes] = useState([
    'Christmas Light Booking',
    'Consultation',
    'Follow-up Meeting',
    'Site Visit',
    'Project Review'
  ]);
  const [internalNotes, setInternalNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [contactData, setContactData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
      fetchTimezones();
      generateTimeSlots();
      fetchContactData();
      fetchInternalNotes();
    }
  }, [isOpen]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/team-members`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setTeamMembers(result.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchTimezones = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/calendar/timezones`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setTimezones(result.data);
        setFormData((prev: CreateAppointmentData) => ({ ...prev, timezone: result.data[6] || '' })); // Default to CST
      }
    } catch (error) {
      console.error('Error fetching timezones:', error);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      const time12 = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
      slots.push(time12);
    }
    setAvailableSlots(slots as string[]);
  };

  const fetchContactData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contacts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success && result.data.contacts.length > 0) {
        setContactData(result.data.contacts[0]); // Use first contact for demo
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
    }
  };

  const fetchInternalNotes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contacts/1/internal-notes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        console.log('Notes API response not ok:', response.status);
        return;
      }
      
      const result = await response.json();
      console.log('Notes API result:', result);
      
      if (result.success) {
        setInternalNotes(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching internal notes:', error);
      setInternalNotes([]); // Set empty array on error
    }
  };

  const addInternalNote = async () => {
    if (!newNote.trim()) return;
    
    console.log('Adding note:', newNote);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/internal-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          contactId: 1,
          content: newNote
        })
      });
      
      console.log('Add note response:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Note added successfully:', result);
        setNewNote('');
        setShowNoteInput(false);
        fetchInternalNotes();
      } else {
        console.error('Failed to add note:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error adding internal note:', error);
    }
  };

  const handleSave = () => {
    if (formData.title.trim() && formData.date && formData.slot) {
      onSave(formData);
      setFormData({
        calendar: '',
        title: '',
        description: '',
        teamMember: '',
        date: '',
        slot: '',
        timezone: '',
        location: 'Calendar Default',
        status: 'confirmed'
      });
      setShowDescription(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex">
          {/* Left Panel */}
          <div className="w-1/2 p-6 border-r border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Book Appointment</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calendar</label>
                <select
                  value={formData.calendar}
                  onChange={(e) => setFormData({...formData, calendar: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select calendar type</option>
                  {calendarTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Title</label>
                <input
                  type="text"
                  placeholder="(eg) Appointment with Bob"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowDescription(!showDescription)}
                className="text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                Add Description
              </button>
              {showDescription && (
                <textarea
                  placeholder="Add appointment description..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Member</label>
                <select
                  value={formData.teamMember}
                  onChange={(e) => setFormData({...formData, teamMember: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Calendar Default</option>
                  {teamMembers.map((member: any) => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                <p className="text-sm text-gray-600 mb-2">Showing slots in this timezone: (Account Timezone)</p>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-4"
                >
                  <option value="">Select timezone</option>
                  {timezones.map((tz: string) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>

                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('default')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'default'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('custom')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'custom'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slot</label>
                    <select
                      value={formData.slot}
                      onChange={(e) => setFormData({...formData, slot: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Please Select</option>
                      {availableSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Location</label>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 text-left border border-gray-300 rounded-md bg-primary-50 text-primary-700">
                    Calendar Default
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-md text-gray-700">
                    Custom
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status :</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'confirmed' | 'pending' | 'cancelled'})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="confirmed">✓ Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.title.trim() || !formData.date || !formData.slot}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Book Appointment
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-1/2 p-6 bg-gray-50">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Attendees</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">1</div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Contact</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {contactData ? contactData.full_name : 'Loading...'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {contactData ? contactData.email : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Info className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Internal Notes</div>
                
                {internalNotes.length > 0 && (
                  <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                    {internalNotes.map((note: any) => (
                      <div key={note.id} className="bg-white p-2 rounded border text-sm">
                        <div className="text-gray-600 text-xs mb-1">
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
                    <div className="flex gap-2">
                      <button
                        onClick={addInternalNote}
                        className="px-3 py-1 bg-primary-600 text-white rounded text-sm"
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
                    className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:text-primary-800 border border-dashed border-primary-300 rounded-md w-full"
                  >
                    <span className="text-lg">+</span>
                    Add Internal Note
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};