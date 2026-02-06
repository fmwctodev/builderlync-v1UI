import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { contactModulesApi, ContactTask } from '../../../../shared/store/services/contactModulesApi';
import { getStaff, StaffMember } from '../../../../shared/store/services/staffApi';
import Toast from "../../../../shared/components/Toast";
import { getErrorMessage } from "../../../../shared/utils/errorHandler";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contactId: number;
  editingTask?: ContactTask | null;
}

export function TaskModal({ isOpen, onClose, onSuccess, contactId, editingTask }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    assignedTo: '' as string | number,
    dueDate: '',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    description: '',
    isRecurring: false
  });
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
      if (editingTask) {
        setFormData({
          title: editingTask.title || '',
          assignedTo: editingTask.assignedTo || 0,
          dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : '',
          status: editingTask.status || 'pending',
          description: editingTask.description || '',
          isRecurring: editingTask.isRecurring || false
        });
      } else {
        setFormData({
          title: '',
          assignedTo: '',
          dueDate: '',
          status: 'pending',
          description: '',
          isRecurring: false
        });
      }
    }
  }, [isOpen, editingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title.trim(),
      assignedTo: Number(formData.assignedTo),
      dueDate: formData.dueDate,
      status: formData.status,
      description: formData.description.trim(),
      isRecurring: formData.isRecurring,
      contactId: contactId
    };

    if (!payload.title) {
      setToast({ message: 'Task title is required', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      if (editingTask) {
        await contactModulesApi.updateTask(editingTask.id!, payload as any);
        setToast({ message: 'Task updated successfully', type: 'success' });
      } else {
        await contactModulesApi.createTask(contactId, payload as any);
        setToast({ message: 'Task created successfully', type: 'success' });
      }
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to save task');
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{editingTask ? 'Edit Task' : 'Add Task'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Task Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Assignee <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value ? parseInt(e.target.value) : '' })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select assignee</option>
              {staff.map(member => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="mr-2"
              />
              Recurring Task
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (editingTask ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}