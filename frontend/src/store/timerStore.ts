import { create } from 'zustand';
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
      set({ error: (error as Error).message, isLoading: false });
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

      return timeEntry;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
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
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateTimerTick: (timeEntryId: string, duration: number) => {
    set((state) => ({
      timeEntries: state.timeEntries.map((entry) =>
        entry.id === timeEntryId ? { ...entry, duration } : entry
      ),
    }));
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
