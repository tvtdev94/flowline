import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Task, TaskStatus } from '../../types/task';
import { taskApi } from '../../services/api';
import { useTaskStore } from '../../store/taskStore';

interface EditTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const TASK_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose }) => {
  const { updateTask, removeTask } = useTaskStore();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [color, setColor] = useState(task.color);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update task via API
      const updatedTask = await taskApi.update(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        color,
        status,
      });

      updateTask(task.id, updatedTask);
      toast.success('Task updated successfully');
      onClose();
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to update task';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task? This will also delete all associated time entries.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await taskApi.delete(task.id);
      removeTask(task.id);
      toast.success('Task deleted successfully');
      onClose();
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to delete task';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Color Picker */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {TASK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full border-2 ${
                    color === c ? 'border-gray-900 scale-110' : 'border-gray-300'
                  } transition-transform`}
                  style={{ backgroundColor: c }}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value={TaskStatus.Active}>Active</option>
              <option value={TaskStatus.Paused}>Paused</option>
              <option value={TaskStatus.Stuck}>Stuck</option>
              <option value={TaskStatus.Done}>Done</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-red-700 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"
              disabled={isLoading}
            >
              Delete Task
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
