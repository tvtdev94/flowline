import { create } from 'zustand';
import toast from 'react-hot-toast';
import { TimeEntry } from '../types/timeEntry';
import { timeEntryApi } from '../services/api';

interface TimerState {
  timeEntries: TimeEntry[];
  runningTimers: Map<string, TimeEntry>; // taskId -> TimeEntry
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTimeEntries: (userId: string, date?: Date) => Promise<void>;
  fetchRunningTimers: (userId: string) => Promise<void>;
  startTimer: (taskId: string, userId: string) => Promise<TimeEntry | null>;
  stopTimer: (timeEntryId: string) => Promise<void>;
  updateTimerTick: (timeEntryId: string, duration: number) => void;
  updateLocalElapsedTime: () => void; // Client-side timer update
  syncTimersFromServer: (updates: Array<{ id: string; elapsedSeconds: number }>) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  getRunningTimer: (taskId: string) => TimeEntry | undefined;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  timeEntries: [],
  runningTimers: new Map(),
  isLoading: false,
  error: null,

  fetchTimeEntries: async (userId: string, date?: Date) => {
    set({ isLoading: true, error: null });
    try {
      const entries = await timeEntryApi.getAll(userId, date);

      // Populate running timers map
      const runningTimersMap = new Map<string, TimeEntry>();
      entries.forEach((entry) => {
        if (!entry.endTime) {
          runningTimersMap.set(entry.taskId, entry);
        }
      });

      set({
        timeEntries: entries,
        runningTimers: runningTimersMap,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to fetch time entries';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchRunningTimers: async (userId: string) => {
    try {
      const runningEntries = await timeEntryApi.getRunning(userId);
      const runningTimersMap = new Map<string, TimeEntry>();

      runningEntries.forEach((entry) => {
        runningTimersMap.set(entry.taskId, entry);
      });

      set({ runningTimers: runningTimersMap });
    } catch (error) {
      console.error('Failed to fetch running timers:', error);
    }
  },

  startTimer: async (taskId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const timeEntry = await timeEntryApi.start({ taskId, userId });

      set((state) => ({
        timeEntries: [...state.timeEntries, timeEntry],
        runningTimers: new Map(state.runningTimers).set(taskId, timeEntry),
        isLoading: false,
      }));

      toast.success('Timer started');
      return timeEntry;
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to start timer';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  stopTimer: async (timeEntryId: string) => {
    set({ isLoading: true, error: null });
    try {
      const stoppedEntry = await timeEntryApi.stop(timeEntryId);

      set((state) => {
        const newRunningTimers = new Map(state.runningTimers);
        newRunningTimers.delete(stoppedEntry.taskId);

        return {
          timeEntries: state.timeEntries.map((entry) =>
            entry.id === timeEntryId ? stoppedEntry : entry
          ),
          runningTimers: newRunningTimers,
          isLoading: false,
        };
      });

      toast.success('Timer stopped');
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to stop timer';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  updateTimerTick: (timeEntryId: string, duration: number) => {
    set((state) => ({
      timeEntries: state.timeEntries.map((entry) =>
        entry.id === timeEntryId ? { ...entry, duration } : entry
      ),
    }));
  },

  /**
   * Update elapsed time for all running timers (client-side calculation)
   * Called every second by client-side interval
   */
  updateLocalElapsedTime: () => {
    set((state) => {
      const now = new Date();
      const updatedEntries = state.timeEntries.map((entry) => {
        // Only update running timers (no endTime)
        if (!entry.endTime && entry.startTime) {
          const start = new Date(entry.startTime);
          const elapsedSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
          return { ...entry, duration: elapsedSeconds };
        }
        return entry;
      });

      return { timeEntries: updatedEntries };
    });
  },

  /**
   * Sync timers with server data (called every 30s from SignalR)
   * Ensures client stays in sync with server
   */
  syncTimersFromServer: (updates) => {
    set((state) => {
      const updatedEntries = state.timeEntries.map((entry) => {
        const serverUpdate = updates.find((u) => u.id === entry.id);
        if (serverUpdate) {
          return { ...entry, duration: Math.floor(serverUpdate.elapsedSeconds) };
        }
        return entry;
      });

      return { timeEntries: updatedEntries };
    });
  },

  addTimeEntry: (entry: TimeEntry) => {
    set((state) => ({
      timeEntries: [...state.timeEntries, entry],
    }));
  },

  getRunningTimer: (taskId: string) => {
    return get().runningTimers.get(taskId);
  },
}));
