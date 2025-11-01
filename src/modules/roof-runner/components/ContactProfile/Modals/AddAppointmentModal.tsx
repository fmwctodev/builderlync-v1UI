import React, { useState } from 'react';
import { X, User, Info } from 'lucide-react';
import { AddAppointmentModalProps, CreateAppointmentData } from '../../types';

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<CreateAppointmentData>({
    calendar: 'AI Ads Manager Demo',
    title: '',
    description: '',
    teamMember: 'Calendar Default',
    date: '',
    slot: '',
    timezone: 'GMT-04:00 America/New_York (EDT)',
    location: 'Calendar Default',
    status: 'confirmed'
  });
  const [showDescription, setShowDescription] = useState(false);
  const [activeTab, setActiveTab] = useState<'default' | 'custom'>('default');

  const handleSave = () => {
    if (formData.title.trim() && formData.date && formData.slot) {
      onSave(formData);
      setFormData({
        calendar: 'AI Ads Manager Demo',
        title: '',
        description: '',
        teamMember: 'Calendar Default',
        date: '',
        slot: '',
        timezone: 'GMT-04:00 America/New_York (EDT)',
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="AI Ads Manager Demo">AI Ads Manager Demo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Title</label>
                <input
                  type="text"
                  placeholder="(eg) Appointment with Bob"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowDescription(!showDescription)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Add Description
              </button>
              {showDescription && (
                <textarea
                  placeholder="Add appointment description..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Member</label>
                <select
                  value={formData.teamMember}
                  onChange={(e) => setFormData({...formData, teamMember: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Calendar Default">Calendar Default</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                <p className="text-sm text-gray-600 mb-2">Showing slots in this timezone: (Account Timezone)</p>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                >
                  <option value="GMT-04:00 America/New_York (EDT)">GMT-04:00 America/New_York (EDT)</option>
                </select>

                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('default')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'default'
                        ? 'bg-blue-100 text-blue-700'
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
                        ? 'bg-blue-100 text-blue-700'
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slot</label>
                    <select
                      value={formData.slot}
                      onChange={(e) => setFormData({...formData, slot: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Please Select</option>
                      <option value="9:00 AM">9:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="3:00 PM">3:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Location</label>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 text-left border border-gray-300 rounded-md bg-blue-50 text-blue-700">
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
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <span className="font-medium text-gray-900">John Doe</span>
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
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-dashed border-blue-300 rounded-md w-full">
                  <span className="text-lg">+</span>
                  Add Internal Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};