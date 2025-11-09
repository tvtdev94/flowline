import { create } from 'zustand';
import { Project } from '../types/project';
import { projectApi } from '../services/api';

interface ProjectStore {
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  fetchProjects: (userId: string, includeArchived?: boolean) => Promise<void>;
  createProject: (userId: string, name: string, color: string) => Promise<void>;
  updateProject: (projectId: string, userId: string, updates: { name?: string; color?: string; isArchived?: boolean }) => Promise<void>;
  deleteProject: (projectId: string, userId: string) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async (userId: string, includeArchived = false) => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectApi.getAll(userId, includeArchived);
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch projects', isLoading: false });
      console.error('Error fetching projects:', error);
    }
  },

  createProject: async (userId: string, name: string, color: string) => {
    set({ isLoading: true, error: null });
    try {
      await projectApi.create({ userId, name, color });
      // Re-fetch projects after creation
      const projects = await projectApi.getAll(userId);
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to create project', isLoading: false });
      console.error('Error creating project:', error);
      throw error;
    }
  },

  updateProject: async (projectId: string, userId: string, updates: { name?: string; color?: string; isArchived?: boolean }) => {
    set({ isLoading: true, error: null });
    try {
      await projectApi.update(projectId, { userId, ...updates });
      // Re-fetch projects after update
      const projects = await projectApi.getAll(userId);
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update project', isLoading: false });
      console.error('Error updating project:', error);
      throw error;
    }
  },

  deleteProject: async (projectId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      await projectApi.delete(projectId, userId);
      // Re-fetch projects after deletion
      const projects = await projectApi.getAll(userId);
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to delete project', isLoading: false });
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
