import { create } from 'zustand';
import { TimeEntry } from '../types/timeEntry';
import { timeEntryApi } from '../services/api';

interface TimerState {
  timeEntries: TimeEntry[];
  runningTimers: Map<string, TimeEntry>; // taskId -> TimeEntry
  isLoading: boolean;
  error: string | null;

  // Actions
  startTimer: (taskId: string) => Promise<TimeEntry | null>;
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

  startTimer: async (taskId: string) => {
    set({ isLoading: true, error: null });
    try {
      const timeEntry = await timeEntryApi.start({ taskId });

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
