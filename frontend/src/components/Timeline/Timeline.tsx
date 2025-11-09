import React, { useMemo } from 'react';
import { TimeEntry } from '../../types/timeEntry';
import { assignLanes, getXPosition, getWidth } from '../../utils/autoLayout';
import TaskBar from '../TaskBar/TaskBar';

interface TimelineProps {
  timeEntries: TimeEntry[];
  date: Date;
  pixelsPerHour?: number;
  laneHeight?: number;
}

const Timeline: React.FC<TimelineProps> = ({
  timeEntries,
  date,
  pixelsPerHour = 100,
  laneHeight = 60,
}) => {
  // Auto-layout: Assign lanes to time entries
  const timelineTasks = useMemo(() => {
    return assignLanes(timeEntries);
  }, [timeEntries]);

  // Calculate day start (00:00) and day end (23:59)
  const dayStart = useMemo(() => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [date]);

  // Calculate timeline dimensions
  const timelineWidth = 24 * pixelsPerHour; // 24 hours
  const maxLane = Math.max(...timelineTasks.map((t) => t.lane), 0);
  const timelineHeight = (maxLane + 1) * laneHeight;

  // Generate hour markers
  const hourMarkers = Array.from({ length: 25 }, (_, i) => i);

  return (
    <div className="timeline-container bg-gray-50 p-4 rounded-lg overflow-auto">
      <div className="relative" style={{ width: timelineWidth, minHeight: timelineHeight }}>
        {/* Hour markers */}
        <div className="absolute top-0 left-0 right-0 h-8 flex border-b border-gray-300">
          {hourMarkers.map((hour) => (
            <div
              key={hour}
              className="relative border-l border-gray-200"
              style={{ width: pixelsPerHour }}
            >
              <span className="absolute -top-1 -left-3 text-xs text-gray-600">
                {hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Timeline grid */}
        <svg
          className="absolute top-8 left-0"
          width={timelineWidth}
          height={timelineHeight}
          style={{ pointerEvents: 'none' }}
        >
          {/* Vertical hour lines */}
          {hourMarkers.map((hour) => (
            <line
              key={`vline-${hour}`}
              x1={hour * pixelsPerHour}
              y1={0}
              x2={hour * pixelsPerHour}
              y2={timelineHeight}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Horizontal lane lines */}
          {Array.from({ length: maxLane + 2 }, (_, i) => (
            <line
              key={`hline-${i}`}
              x1={0}
              y1={i * laneHeight}
              x2={timelineWidth}
              y2={i * laneHeight}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Task bars */}
        <div className="absolute top-8 left-0" style={{ width: timelineWidth, height: timelineHeight }}>
          {timelineTasks.map((task) => {
            const startTime = new Date(task.startTime);
            const x = getXPosition(startTime, dayStart, pixelsPerHour);
            const width = getWidth(task, pixelsPerHour);
            const y = task.lane * laneHeight;

            return (
              <TaskBar
                key={task.id}
                timeEntry={task}
                x={x}
                y={y}
                width={width}
                height={laneHeight - 10}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
