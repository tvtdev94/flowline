import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import toast from 'react-hot-toast';
import { TimeEntry } from '../../types/timeEntry';
import { formatDuration } from '../../utils/autoLayout';
import { timeEntryApi } from '../../services/api';

interface TaskBarDraggableProps {
  timeEntry: TimeEntry;
  x: number;
  y: number;
  width: number;
  height: number;
  pixelsPerHour: number;
  dayStart: Date;
  onUpdate: (timeEntryId: string, startTime: Date, endTime: Date) => void;
}

const TaskBarDraggable: React.FC<TaskBarDraggableProps> = ({
  timeEntry,
  x,
  y,
  width,
  height,
  pixelsPerHour,
  dayStart,
  onUpdate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const isRunning = !timeEntry.endTime;
  const taskColor = timeEntry.task?.color || '#3b82f6';
  const duration = timeEntry.duration || 0;
  const durationText = formatDuration(duration);

  // Convert pixels to time offset in milliseconds
  const pixelsToMs = (pixels: number): number => {
    return (pixels / pixelsPerHour) * 60 * 60 * 1000;
  };

  const handleDragStop = async (e: any, data: { x: number; y: number }) => {
    setIsDragging(false);

    // Don't allow dragging running timers
    if (isRunning) {
      toast.error('Cannot drag running timer');
      return;
    }

    // Calculate time offset from drag
    const timeOffsetMs = pixelsToMs(data.x - x);

    const newStartTime = new Date(new Date(timeEntry.startTime).getTime() + timeOffsetMs);
    const newEndTime = new Date(new Date(timeEntry.endTime!).getTime() + timeOffsetMs);

    // Validate: don't allow dragging outside the current day
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    if (newStartTime < dayStart || newEndTime > dayEnd) {
      toast.error('Cannot drag outside current day');
      return;
    }

    try {
      // Update via API
      await timeEntryApi.update(timeEntry.id, {
        ...timeEntry,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
      });

      onUpdate(timeEntry.id, newStartTime, newEndTime);
      toast.success('Time entry updated');
    } catch (error) {
      toast.error('Failed to update time entry');
      console.error('Error updating time entry:', error);
    }
  };

  const handleResizeStop = async (
    e: any,
    direction: string,
    ref: HTMLElement,
    delta: { width: number; height: number },
    position: { x: number; y: number }
  ) => {
    setIsResizing(false);

    // Don't allow resizing running timers
    if (isRunning) {
      toast.error('Cannot resize running timer');
      return;
    }

    const newWidth = width + delta.width;
    const durationMs = pixelsToMs(newWidth);

    const newStartTime = new Date(timeEntry.startTime);
    const newEndTime = new Date(newStartTime.getTime() + durationMs);

    // Validate
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    if (newEndTime > dayEnd) {
      toast.error('Cannot resize beyond current day');
      return;
    }

    if (durationMs < 60000) { // Minimum 1 minute
      toast.error('Duration must be at least 1 minute');
      return;
    }

    try {
      // Update via API
      await timeEntryApi.update(timeEntry.id, {
        ...timeEntry,
        endTime: newEndTime.toISOString(),
      });

      onUpdate(timeEntry.id, newStartTime, newEndTime);
      toast.success('Time entry resized');
    } catch (error) {
      toast.error('Failed to resize time entry');
      console.error('Error resizing time entry:', error);
    }
  };

  // If running timer, don't make it draggable
  if (isRunning) {
    return (
      <div
        className="absolute rounded-md shadow-md cursor-not-allowed transition-all animate-pulse"
        style={{
          left: x,
          top: y,
          width: Math.max(width, 40),
          height,
          backgroundColor: taskColor,
          opacity: 0.9,
        }}
      >
        <div className="px-2 py-1 h-full flex flex-col justify-between text-white text-xs overflow-hidden">
          <div className="font-semibold truncate">
            {timeEntry.task?.title || 'Untitled Task'}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-90">{durationText}</span>
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Rnd
      position={{ x, y }}
      size={{ width: Math.max(width, 40), height }}
      onDragStart={() => setIsDragging(true)}
      onDragStop={handleDragStop}
      onResizeStart={() => setIsResizing(true)}
      onResizeStop={handleResizeStop}
      enableResizing={{
        right: true,
        left: false,
        top: false,
        bottom: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      dragAxis="x" // Only allow horizontal dragging
      bounds="parent"
      className={`rounded-md shadow-md transition-all ${
        isDragging || isResizing ? 'shadow-2xl ring-2 ring-blue-400' : 'hover:shadow-lg'
      }`}
      style={{
        backgroundColor: taskColor,
        opacity: isDragging || isResizing ? 0.8 : 0.9,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <div className="px-2 py-1 h-full flex flex-col justify-between text-white text-xs overflow-hidden pointer-events-none">
        <div className="font-semibold truncate">
          {timeEntry.task?.title || 'Untitled Task'}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs opacity-90">{durationText}</span>
        </div>
      </div>
    </Rnd>
  );
};

export default TaskBarDraggable;
