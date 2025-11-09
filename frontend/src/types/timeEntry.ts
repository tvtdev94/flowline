import { Task } from './task';

export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in seconds
  notes?: string;
  createdAt: string;
  task?: Task;
}

export interface StartTimerRequest {
  taskId: string;
}

export interface TimerTickEvent {
  id: string;
  taskId: string;
  startTime: string;
  duration: number;
  elapsedTime: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}
