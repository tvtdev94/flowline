import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types/task';
import { useTimerStore } from '../../store/timerStore';
import { formatDuration } from '../../utils/autoLayout';
import EditTaskModal from './EditTaskModal';

interface TaskControlsProps {
  task: Task;
  userId: string;
}

const TaskControls: React.FC<TaskControlsProps> = ({ task, userId }) => {
  const { startTimer, stopTimer, getRunningTimer } = useTimerStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const runningTimer = getRunningTimer(task.id);
  const isRunning = !!runningTimer;

  const handleStart = async () => {
    setIsLoading(true);
    await startTimer(task.id, userId);
    setIsLoading(false);
  };

  const handleStop = async () => {
    if (!runningTimer) return;

    setIsLoading(true);
    await stopTimer(runningTimer.id);
    setIsLoading(false);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.Active:
        return 'bg-green-500';
      case TaskStatus.Paused:
        return 'bg-yellow-500';
      case TaskStatus.Stuck:
        return 'bg-red-500';
      case TaskStatus.Done:
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
      {/* Task Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">{task.title}</h3>
          <span className={`px-2 py-1 text-xs text-white rounded ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
        {task.description && (
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        )}
      </div>

      {/* Timer Display */}
      {isRunning && runningTimer && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          <span className="font-mono text-lg font-semibold text-blue-600">
            {formatDuration(runningTimer.duration || 0)}
          </span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          title="Edit task"
        >
          Edit
        </button>
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Starting...' : 'Start'}
          </button>
        ) : (
          <button
            onClick={handleStop}
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Stopping...' : 'Stop'}
          </button>
        )}
      </div>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={task}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default TaskControls;
