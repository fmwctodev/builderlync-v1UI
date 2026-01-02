import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { createJobEvent, updateJobEvent, CreateEventRequest, getJobs } from '../../../../shared/store/services/eventsApi';

interface EventFormProps {
  jobId: number;
  onClose: () => void;
  onSuccess: () => void;
  editEvent?: any;
}

export function EventForm({ jobId, onClose, onSuccess, editEvent }: EventFormProps) {
  const [formData, setFormData] = useState<CreateEventRequest>({
    type: editEvent?.type || 'meeting',
    title: editEvent?.title || '',
    startDate: editEvent?.startDate || '',
    startTime: editEvent?.startTime || '',
    endDate: editEvent?.endDate || '',
    endTime: editEvent?.endTime || '',
    allDay: editEvent?.allDay || false,
    location: editEvent?.location || '',
    invitees: editEvent?.invitees || [],
    description: editEvent?.description || '',
    createdBy: editEvent?.createdBy || 1,
    createdByName: editEvent?.createdByName || 'Current User',
    assignedTo: editEvent?.assignedTo,
    jobId: editEvent?.jobId || jobId
  });
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getJobs();
        console.log('Full response:', response);
        const jobsData = response?.data?.data || response?.data || [];
        console.log('Extracted jobs:', jobsData);
        console.log('Jobs count:', jobsData.length);
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setJobs([]);
      }
    };
    fetchJobs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const targetJobId = formData.jobId || jobId;
      if (editEvent) {
        await updateJobEvent(targetJobId, editEvent.id, formData);
      } else {
        await createJobEvent(targetJobId, formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold">{editEvent ? 'Edit Event' : 'Create Event'}</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="meeting">Meeting</option>
              <option value="call">Call</option>
              <option value="task">Task</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Associated Job (Optional)</label>
            <select
              value={formData.jobId || ''}
              onChange={(e) => {
                const newJobId = e.target.value ? parseInt(e.target.value) : undefined;
                setFormData({ ...formData, jobId: newJobId });
              }}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">Select Job ({jobs.length} available)</option>
              {jobs.length === 0 && <option disabled>No jobs found</option>}
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.name || job.location || `Job #${job.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Assign Team Member</label>
            <select
              value={formData.assignedTo || ''}
              onChange={(e) => {
                const newAssignedTo = e.target.value ? parseInt(e.target.value) : undefined;
                setFormData({ ...formData, assignedTo: newAssignedTo });
              }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select Team Member</option>
              <option value="1">John Doe</option>
              <option value="2">Jane Smith</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Invitees (Optional)</label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={inviteeEmail}
                  onChange={(e) => setInviteeEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (inviteeEmail.trim() && !formData.invitees.includes(inviteeEmail.trim())) {
                      setFormData({
                        ...formData,
                        invitees: [...formData.invitees, inviteeEmail.trim()]
                      });
                      setInviteeEmail('');
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              {formData.invitees.length > 0 && (
                <div className="space-y-1">
                  {formData.invitees.map((invitee, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="text-sm">{invitee}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            invitees: formData.invitees.filter((_, i) => i !== index)
                          });
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (editEvent ? 'Updating...' : 'Creating...') : (editEvent ? 'Update Event' : 'Create Event')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}