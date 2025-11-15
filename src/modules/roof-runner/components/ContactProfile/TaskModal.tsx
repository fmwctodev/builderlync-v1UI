import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createJobTask, updateJobTask, CreateTaskRequest, Task } from '../../../../shared/store/services/tasksApi';
import { getStaff, StaffMember } from '../../../../shared/store/services/staffApi';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jobId: number;
  editingTask?: Task | null;
}

export function TaskModal({ isOpen, onClose, onSuccess, jobId, editingTask }: TaskModalProps) {
  const [formData, setFormData] = useState<CreateTaskRequest>({
    text: editingTask?.text || '',
    assignee: editingTask?.assignee || '',
    dueDate: editingTask?.dueDate || '',
    blocking: editingTask?.blocking || false,
    completed: editingTask?.completed || false,
    createdBy: 1,
    createdByName: 'Current User'
  });
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const fetchStaff = async () => {
    try {
      const response = await getStaff(1, 100);
      setStaff(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStaff();
      if (editingTask) {
        setFormData({
          text: editingTask.text || editingTask.text || '',
          assignee: editingTask.assignee || '',
          dueDate: editingTask.dueDate || editingTask.dueDate || '',
          blocking: editingTask.blocking || false,
          completed: editingTask.completed || false,
          createdBy: 1,
          createdByName: 'Current User'
        });
      } else {
        setFormData({
          text: '',
          assignee: '',
          dueDate: '',
          blocking: false,
          completed: false,
          createdBy: 1,
          createdByName: 'Current User'
        });
      }
    }
  }, [isOpen, editingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingTask) {
        await updateJobTask(jobId, editingTask.id!, formData);
      } else {
        await createJobTask(jobId, formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
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
            <label className="block text-sm font-medium mb-1">Task Title</label>
            <input
              type="text"
              required
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Assignee</label>
            <select
              required
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select assignee</option>
              {staff.map(member => (
                <option key={member.id} value={member.id.toString()}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.blocking}
                onChange={(e) => setFormData({ ...formData, blocking: e.target.checked })}
                className="mr-2"
              />
              Blocking
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.completed}
                onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                className="mr-2"
              />
              Completed
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
    </div>
  );
}