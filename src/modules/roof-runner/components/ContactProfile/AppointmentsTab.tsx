import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { contactModulesApi, Appointment } from '../../../../shared/store/services/contactModulesApi';
import { AppointmentModal } from './AppointmentModal';
import { getStaff, StaffMember } from '../../../../shared/store/services/staffApi';

interface AppointmentsTabProps {
  contactId: number;
}

const AppointmentsTab: React.FC<AppointmentsTabProps> = ({ contactId }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const fetchAppointments = async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      const response = await contactModulesApi.getAppointments(contactId);
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await getStaff(1, 100);
      setStaff(response.data || []);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchStaff();
  }, [contactId]);

  const handleCreate = () => {
    setEditingAppointment(null);
    setShowModal(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await contactModulesApi.deleteAppointment(id);
        fetchAppointments();
      } catch (error) {
        console.error('Failed to delete appointment:', error);
      }
    }
  };

  const getTeamMemberName = (id: number | string) => {
    const member = staff.find(s => s.id.toString() === id?.toString());
    return member ? `${member.first_name} ${member.last_name}` : 'Unknown';
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Appointments
          </h3>
          <button
            onClick={handleCreate}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            + Add
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {appointment.title}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => appointment.id && handleDelete(appointment.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{appointment.appointmentTime} ({appointment.duration} mins)</span>
                  </div>
                  {appointment.meetingLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{appointment.meetingLocation}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2 flex justify-between items-center">
                    <span className="text-xs">Assigned: {getTeamMemberName(appointment.teamMember)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400">
              <Calendar size={32} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-1">
              No appointments scheduled
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Create your first appointment for this contact
            </p>
            <button
              onClick={handleCreate}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium text-sm transition-colors"
            >
              Add Appointment
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <AppointmentModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchAppointments();
            setShowModal(false);
          }}
          contactId={contactId}
          editingAppointment={editingAppointment || undefined}
        />
      )}
    </>
  );
};

export default AppointmentsTab;