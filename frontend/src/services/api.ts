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
