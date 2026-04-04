import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreHorizontal, ChevronDown, User, Calendar as CalendarIcon, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getJobTasks,
  createJobTask,
  updateJobTask,
  deleteJobTask,
  toggleTaskComplete,
  JobTask,
  getOptionalTasksForStage,
  JobStageTask
} from '../../../shared/store/services/jobTasksApi';
import { getStaff, StaffMember } from '../../../shared/store/services/staffApi';

interface TasksTabProps {
  jobId: number;
  currentStage: string;
  onTasksChange?: () => void;
}

const TasksTab: React.FC<TasksTabProps> = ({ jobId, currentStage, onTasksChange }) => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [tasks, setTasks] = useState<JobTask[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showOptionalTasksModal, setShowOptionalTasksModal] = useState(false);
  const [optionalTasks, setOptionalTasks] = useState<JobStageTask[]>([]);
  const [editingTask, setEditingTask] = useState<JobTask | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchStaff();
  }, [jobId]);

  const formatDateForInput = (dateString: string | undefined | null): string => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getJobTasks(jobId);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await getStaff(1, 100);
      setStaff(response.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchOptionalTasks = async () => {
    try {
      const data = await getOptionalTasksForStage(currentStage);
      setOptionalTasks(data);
      setShowOptionalTasksModal(true);
    } catch (error) {
      console.error('Error fetching optional tasks:', error);
    }
  };

  const handleToggleComplete = async (task: JobTask) => {
    try {
      await toggleTaskComplete(task.id, task.status);
      await fetchTasks();
      onTasksChange?.();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleAssignStaff = async (taskId: string, staffId: string | null) => {
    try {
      await updateJobTask(taskId, { assigned_to: staffId });
      await fetchTasks();
      onTasksChange?.();
    } catch (error) {
      console.error('Error assigning staff:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteJobTask(taskId);
      await fetchTasks();
      onTasksChange?.();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCreateCustomTask = async () => {
    if (!newTaskName.trim()) return;

    try {
      await createJobTask({
        job_id: jobId,
        task_name: newTaskName,
        task_description: newTaskDescription || undefined,
        status: 'pending'
      });
      setNewTaskName('');
      setNewTaskDescription('');
      setShowAddTaskModal(false);
      await fetchTasks();
      onTasksChange?.();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleAddOptionalTask = async (template: JobStageTask) => {
    try {
      await createJobTask({
        job_id: jobId,
        stage_task_id: template.id,
        task_name: template.task_name,
        task_description: template.task_description || undefined,
        status: 'pending',
        task_order: template.task_order
      });
      await fetchTasks();
      onTasksChange?.();
    } catch (error) {
      console.error('Error adding optional task:', error);
    }
  };

  const handleUpdateDueDate = async (taskId: string, dueDate: string) => {
    try {
      await updateJobTask(taskId, { due_date: dueDate });
      await fetchTasks();
      onTasksChange?.();
    } catch (error) {
      console.error('Error updating due date:', error);
    }
  };

  const filteredTasks = hideCompleted
    ? tasks.filter(task => task.status !== 'completed')
    : tasks;

  const completedCount = tasks.filter(task => task.status === 'completed').length;
  const completionPercentage = tasks.length > 0
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {completedCount} of {tasks.length} completed ({completionPercentage}%)
            </p>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Hide completed</span>
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchOptionalTasks}
            className="flex items-center space-x-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Plus className="w-4 h-4" />
            <span>Add from Templates</span>
          </button>
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Custom Task</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {hideCompleted && tasks.length > 0
              ? 'All tasks completed!'
              : 'No tasks for this job yet'}
          </p>
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="text-primary-500 hover:text-primary-600 text-sm font-medium"
          >
            Add your first task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-opacity ${
                task.status === 'completed' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex items-center space-x-2 pt-1">
                  <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-grab" />
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => handleToggleComplete(task)}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4
                        className={`text-sm font-medium ${
                          task.status === 'completed'
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {task.task_name}
                      </h4>
                      {task.task_description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {task.task_description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="relative">
                          <select
                            value={task.assigned_to || ''}
                            onChange={(e) => handleAssignStaff(task.id, e.target.value || null)}
                            className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 pr-8 appearance-none cursor-pointer text-gray-700 dark:text-gray-200"
                          >
                            <option value="">Unassigned</option>
                            {staff.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.first_name} {member.last_name}
                              </option>
                            ))}
                          </select>
                          <User className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="relative">
                          <input
                            type="date"
                            value={formatDateForInput(task.due_date)}
                            onChange={(e) => handleUpdateDueDate(task.id, e.target.value)}
                            className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 pr-8 text-gray-700 dark:text-gray-200"
                          />
                          <CalendarIcon className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {task.staff && (
                          <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {task.staff.first_name} {task.staff.last_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Custom Task</h3>
              <button
                onClick={() => {
                  setShowAddTaskModal(false);
                  setNewTaskName('');
                  setNewTaskDescription('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Task Name*
                </label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter task name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add task description"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    setShowAddTaskModal(false);
                    setNewTaskName('');
                    setNewTaskDescription('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustomTask}
                  disabled={!newTaskName.trim()}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOptionalTasksModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Task from Templates
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Optional tasks for {currentStage} stage
                </p>
              </div>
              <button
                onClick={() => setShowOptionalTasksModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {optionalTasks.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No optional task templates available for this stage
                </p>
              ) : (
                <div className="space-y-3">
                  {optionalTasks.map((template) => {
                    const isAlreadyAdded = tasks.some(t => t.stage_task_id === template.id);
                    return (
                      <div
                        key={template.id}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {template.task_name}
                            </h4>
                            {template.task_description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {template.task_description}
                              </p>
                            )}
                            <span className="inline-block text-xs text-gray-500 dark:text-gray-400 mt-2 px-2 py-1 bg-white dark:bg-gray-800 rounded">
                              {template.task_category.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddOptionalTask(template)}
                            disabled={isAlreadyAdded}
                            className={`ml-4 px-3 py-1.5 text-xs rounded ${
                              isAlreadyAdded
                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : 'bg-primary-500 text-white hover:bg-primary-600'
                            }`}
                          >
                            {isAlreadyAdded ? 'Added' : 'Add'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksTab;
