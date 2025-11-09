import { TimeEntry } from '../types/timeEntry';

export interface TimelineTask extends TimeEntry {
  lane: number; // Auto-assigned lane for display
}

/**
 * Auto-layout algorithm for timeline tasks
 * Assigns lanes to time entries to prevent visual overlap
 * Based on the algorithm described in PLAN.md
 */
export function assignLanes(entries: TimeEntry[]): TimelineTask[] {
  // Sort by start time
  const sorted = [...entries].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const lanes: { endTime: Date | null }[] = [];
  const result: TimelineTask[] = [];

  for (const entry of sorted) {
    const startTime = new Date(entry.startTime);
    const endTime = entry.endTime ? new Date(entry.endTime) : new Date();

    // Find first available lane
    let assignedLane = -1;

    for (let i = 0; i < lanes.length; i++) {
      // Lane is available if its last task ended before this one starts
      if (!lanes[i].endTime || lanes[i].endTime! <= startTime) {
        assignedLane = i;
        break;
      }
    }

    // If no lane available, create new one
    if (assignedLane === -1) {
      assignedLane = lanes.length;
      lanes.push({ endTime: null });
    }

    // Assign task to lane
    const timelineTask: TimelineTask = {
      ...entry,
      lane: assignedLane,
    };

    result.push(timelineTask);

    // Update lane's end time
    lanes[assignedLane].endTime = endTime;
  }

  return result;
}

/**
 * Calculate the X position (in pixels) for a given time on the timeline
 * @param time - The time to convert to X position
 * @param dayStart - The start of the day (00:00)
 * @param pixelsPerHour - How many pixels represent one hour
 */
export function getXPosition(
  time: Date,
  dayStart: Date,
  pixelsPerHour: number
): number {
  const msPerHour = 1000 * 60 * 60;
  const hoursSinceDayStart = (time.getTime() - dayStart.getTime()) / msPerHour;
  return hoursSinceDayStart * pixelsPerHour;
}

/**
 * Calculate the width (in pixels) for a time entry
 * @param entry - The time entry
 * @param pixelsPerHour - How many pixels represent one hour
 */
export function getWidth(entry: TimeEntry, pixelsPerHour: number): number {
  const startTime = new Date(entry.startTime);
  const endTime = entry.endTime ? new Date(entry.endTime) : new Date();

  const durationMs = endTime.getTime() - startTime.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);

  return durationHours * pixelsPerHour;
}

/**
 * Format duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
