import React, { useState, useEffect } from 'react';
import { Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { getJobTasks, deleteJobTask, updateJobTask, Task } from '../../../../shared/store/services/tasksApi';
import { getStaff, StaffMember } from '../../../../shared/store/services/staffApi';
import { TaskModal } from './TaskModal';

interface TasksTabProps {
  contactId?: number;
  onAddTask?: () => void;
}

const TasksTab: React.FC<TasksTabProps> = ({ contactId, onAddTask }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const jobId = 1; // Default job ID

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await getJobTasks(jobId);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await getStaff(1, 100);
      setStaff(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  const getAssigneeName = (assigneeId: string) => {
    const member = staff.find(s => s.id.toString() === assigneeId);
    return member ? `${member.first_name} ${member.last_name}` : assigneeId;
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteJobTask(jobId, taskId);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateJobTask(jobId, task.id!, {
        ...task,
        completed: !task.completed
      });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleAddTask = () => {
    if (onAddTask) {
      onAddTask();
    } else {
      setEditingTask(null);
      setShowModal(true);
    }
  };

  const handleModalSuccess = () => {
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
    fetchStaff();
  }, []);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tasks ({tasks.length})
          </h3>
        </div>

        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-4">
          <button 
            onClick={handleAddTask}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 w-full justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Task
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-1 text-gray-400 hover:text-primary-600"
                  >
                    {task.completed ? <CheckCircle size={20} className="text-green-600" /> : <Circle size={20} />}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      {task.text}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Assigned to: {getAssigneeName(task.assignee)}</span>
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      {task.blocking && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Blocking</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="text-gray-400 hover:text-primary-600"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id!)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No tasks found
          </h4>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            There are no tasks available
          </p>
          
          <button 
            onClick={handleAddTask}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md flex items-center gap-2 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Task
          </button>
        </div>
      )}

      <TaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
        jobId={jobId}
        editingTask={editingTask}
      />
    </>
  );
};

export default TasksTab;