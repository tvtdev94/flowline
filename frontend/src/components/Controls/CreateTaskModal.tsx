import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { TaskStatus } from '../../types/task';
import { taskApi } from '../../services/api';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';

interface CreateTaskModalProps {
  userId: string;
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

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ userId, isOpen, onClose }) => {
  const { addTask } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [color, setColor] = useState(TASK_COLORS[0]);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.Active);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProjects(userId);
    }
  }, [isOpen, userId, fetchProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newTask = await taskApi.create({
        userId,
        title: title.trim(),
        description: description.trim() || undefined,
        projectId: projectId || undefined,
        color,
        status,
        isPrivate: false,
      });

      addTask(newTask);

      // Reset form
      setTitle('');
      setDescription('');
      setProjectId('');
      setColor(TASK_COLORS[0]);
      setStatus(TaskStatus.Active);

      toast.success('Task created successfully');
      onClose();
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to create task';
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
          <h2 className="text-xl font-semibold">Create New Task</h2>
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
              placeholder="e.g., Backend Development"
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
              placeholder="Optional description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Project */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project (Optional)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="">No Project</option>
              {projects.filter(p => !p.isArchived).map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
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
          <div className="flex gap-3 justify-end">
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
              {isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
