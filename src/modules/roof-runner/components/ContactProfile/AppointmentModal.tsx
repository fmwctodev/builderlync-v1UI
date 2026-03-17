import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { contactModulesApi, Appointment } from '../../../../shared/store/services/contactModulesApi';
import { getStaff, StaffMember } from '../../../../shared/store/services/staffApi';
import GooglePlacesAutocomplete from '../../../../shared/components/GooglePlacesAutocomplete';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contactId: number;
    editingAppointment?: Appointment | null;
}

export function AppointmentModal({ isOpen, onClose, onSuccess, contactId, editingAppointment }: AppointmentModalProps) {
    const [formData, setFormData] = useState<Partial<Appointment>>({
        title: '',
        description: '',
        teamMember: 0,
        appointmentDate: '',
        appointmentTime: '',
        duration: 30,
        meetingLocation: '',
        status: 'unconfirmed',
        internalNotes: ''
    });
    const [loading, setLoading] = useState(false);
    const [staff, setStaff] = useState<StaffMember[]>([]);

    const fetchStaff = async () => {
        try {
            const response = await getStaff(1, 100);
            setStaff(response.data || []);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchStaff();
            if (editingAppointment) {
                setFormData({
                    title: editingAppointment.title,
                    description: editingAppointment.description,
                    teamMember: editingAppointment.teamMember,
                    appointmentDate: new Date(editingAppointment.appointmentDate).toISOString().split('T')[0],
                    appointmentTime: editingAppointment.appointmentTime,
                    duration: editingAppointment.duration,
                    meetingLocation: editingAppointment.meetingLocation,
                    status: editingAppointment.status,
                    internalNotes: editingAppointment.internalNotes
                });
            } else {
                setFormData({
                    title: '',
                    description: '',
                    teamMember: 0,
                    appointmentDate: '',
                    appointmentTime: '',
                    duration: 30,
                    meetingLocation: '',
                    status: 'unconfirmed',
                    internalNotes: ''
                });
            }
        }
    }, [isOpen, editingAppointment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingAppointment) {
                await contactModulesApi.updateAppointment(editingAppointment.id!, formData);
            } else {
                await contactModulesApi.createAppointment(contactId, formData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save appointment:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold dark:text-white">
                        {editingAppointment ? 'Edit Appointment' : 'Schedule Appointment'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="e.g. Initial Consultation"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Staff Member</label>
                        <select
                            required
                            value={formData.teamMember}
                            onChange={(e) => setFormData({ ...formData, teamMember: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="0">Select staff member</option>
                            {staff.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.first_name} {member.last_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date</label>
                            <input
                                type="date"
                                required
                                value={formData.appointmentDate}
                                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Time</label>
                            <input
                                type="time"
                                required
                                value={formData.appointmentTime}
                                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Duration (min)</label>
                            <input
                                type="number"
                                required
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="unconfirmed">Unconfirmed</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Location</label>
                        <GooglePlacesAutocomplete
                            value={formData.meetingLocation || ''}
                            onChange={(address: string) => setFormData({ ...formData, meetingLocation: address })}
                            placeholder="Physical address or meeting link"
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Internal Notes</label>
                        <textarea
                            value={formData.internalNotes}
                            onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white h-20"
                            placeholder="Private notes for the team"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (editingAppointment ? 'Update' : 'Schedule')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
