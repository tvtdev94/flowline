import axios from 'axios';
import { Task, CreateTaskRequest } from '../types/task';
import { TimeEntry, StartTimerRequest } from '../types/timeEntry';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Task API
export const taskApi = {
  getAll: async (userId: string, projectId?: string): Promise<Task[]> => {
    const params = new URLSearchParams({ userId });
    if (projectId) params.append('projectId', projectId);

    const response = await api.get(`/api/tasks?${params.toString()}`);
    return response.data;
  },

  create: async (task: CreateTaskRequest): Promise<Task> => {
    const response = await api.post('/api/tasks', task);
    return response.data;
  },
};

// Time Entry API
export const timeEntryApi = {
  getAll: async (userId: string, date?: Date): Promise<TimeEntry[]> => {
    const params = new URLSearchParams({ userId });
    if (date) {
      params.append('date', date.toISOString());
    }

    const response = await api.get(`/api/time-entries?${params.toString()}`);
    return response.data;
  },

  getRunning: async (userId: string): Promise<TimeEntry[]> => {
    const params = new URLSearchParams({ userId });
    const response = await api.get(`/api/time-entries/running?${params.toString()}`);
    return response.data;
  },

  start: async (request: StartTimerRequest): Promise<TimeEntry> => {
    const response = await api.post('/api/time-entries/start', request);
    return response.data;
  },

  stop: async (timeEntryId: string): Promise<TimeEntry> => {
    const response = await api.patch(`/api/time-entries/${timeEntryId}/stop`);
    return response.data;
  },
};

export default api;
