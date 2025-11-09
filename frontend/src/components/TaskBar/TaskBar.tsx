import React from 'react';
import { TimeEntry } from '../../types/timeEntry';
import { formatDuration } from '../../utils/autoLayout';

interface TaskBarProps {
  timeEntry: TimeEntry;
  x: number;
  y: number;
  width: number;
  height: number;
}

const TaskBar: React.FC<TaskBarProps> = ({ timeEntry, x, y, width, height }) => {
  const isRunning = !timeEntry.endTime;

  // Get task color (default to blue if not set)
  const taskColor = timeEntry.task?.color || '#3b82f6';

  // Format duration
  const duration = timeEntry.duration || 0;
  const durationText = formatDuration(duration);

  return (
    <div
      className={`absolute rounded-md shadow-md cursor-pointer transition-all hover:shadow-lg ${
        isRunning ? 'animate-pulse' : ''
      }`}
      style={{
        left: x,
        top: y,
        width: Math.max(width, 40), // Minimum width for visibility
        height,
        backgroundColor: taskColor,
        opacity: 0.9,
      }}
    >
      <div className="px-2 py-1 h-full flex flex-col justify-between text-white text-xs overflow-hidden">
        {/* Task title */}
        <div className="font-semibold truncate">
          {timeEntry.task?.title || 'Untitled Task'}
        </div>

        {/* Duration */}
        <div className="flex items-center justify-between">
          <span className="text-xs opacity-90">{durationText}</span>
          {isRunning && (
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskBar;
