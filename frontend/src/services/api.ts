import axios from 'axios';
import { Task, CreateTaskRequest } from '../types/task';
import { TimeEntry, StartTimerRequest } from '../types/timeEntry';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../types/project';

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

  update: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/api/tasks/${taskId}`, updates);
    return response.data;
  },

  delete: async (taskId: string): Promise<void> => {
    await api.delete(`/api/tasks/${taskId}`);
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

  update: async (timeEntryId: string, updates: Partial<TimeEntry>): Promise<TimeEntry> => {
    const response = await api.put(`/api/time-entries/${timeEntryId}`, updates);
    return response.data;
  },

  delete: async (timeEntryId: string): Promise<void> => {
    await api.delete(`/api/time-entries/${timeEntryId}`);
  },
};

// Team API
export const teamApi = {
  getAll: async (userId: string): Promise<any[]> => {
    const params = new URLSearchParams({ userId });
    const response = await api.get(`/api/teams?${params.toString()}`);
    return response.data;
  },

  getById: async (teamId: string, userId: string): Promise<any> => {
    const params = new URLSearchParams({ userId });
    const response = await api.get(`/api/teams/${teamId}?${params.toString()}`);
    return response.data;
  },

  create: async (userId: string, name: string): Promise<any> => {
    const response = await api.post('/api/teams', { userId, name });
    return response.data;
  },

  update: async (teamId: string, userId: string, name: string): Promise<any> => {
    const response = await api.put(`/api/teams/${teamId}`, { userId, name });
    return response.data;
  },

  delete: async (teamId: string, userId: string): Promise<void> => {
    const params = new URLSearchParams({ userId });
    await api.delete(`/api/teams/${teamId}?${params.toString()}`);
  },

  // Team Members
  getMembers: async (teamId: string, userId: string): Promise<any[]> => {
    const params = new URLSearchParams({ userId });
    const response = await api.get(`/api/teams/${teamId}/members?${params.toString()}`);
    return response.data;
  },

  addMember: async (teamId: string, requesterId: string, userEmail: string, role: string): Promise<any> => {
    const response = await api.post(`/api/teams/${teamId}/members`, {
      requesterId,
      userEmail,
      role,
    });
    return response.data;
  },

  removeMember: async (teamId: string, userId: string, requesterId: string): Promise<void> => {
    const params = new URLSearchParams({ requesterId });
    await api.delete(`/api/teams/${teamId}/members/${userId}?${params.toString()}`);
  },
};

// Project API
export const projectApi = {
  getAll: async (userId: string, includeArchived = false): Promise<Project[]> => {
    const params = new URLSearchParams({ userId, includeArchived: String(includeArchived) });
    const response = await api.get(`/api/projects?${params.toString()}`);
    return response.data;
  },

  create: async (project: CreateProjectRequest): Promise<Project> => {
    const response = await api.post('/api/projects', project);
    return response.data;
  },

  update: async (projectId: string, updates: UpdateProjectRequest): Promise<Project> => {
    const response = await api.put(`/api/projects/${projectId}`, updates);
    return response.data;
  },

  delete: async (projectId: string, userId: string): Promise<void> => {
    const params = new URLSearchParams({ userId });
    await api.delete(`/api/projects/${projectId}?${params.toString()}`);
  },
};

export default api;
