import { create } from 'zustand';
import toast from 'react-hot-toast';
import { Task } from '../types/task';
import { taskApi } from '../services/api';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: (userId: string, projectId?: string) => Promise<void>;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (userId: string, projectId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskApi.getAll(userId, projectId);
      set({ tasks, isLoading: false });
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to fetch tasks';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  addTask: (task: Task) => {
    set((state) => ({ tasks: [...state.tasks, task] }));
  },

  updateTask: (taskId: string, updates: Partial<Task>) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    }));
  },

  removeTask: (taskId: string) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }));
  },
}));
