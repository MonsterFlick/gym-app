import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLog, HabitStatus } from '../types/database';
import { defaultHabits } from '../lib/seedData';

const HABITS_KEY = '@gym_om_habits';
const HABIT_LOGS_KEY = '@gym_om_habit_logs';

interface HabitStore {
  habits: Habit[];
  logs: HabitLog[];
  isLoaded: boolean;

  loadHabits: () => Promise<void>;
  createHabit: (name: string, description?: string, days?: number[]) => Promise<Habit>;
  updateHabitStatus: (habitId: string, status: HabitStatus, date?: string) => Promise<void>;
  getStatusForDate: (habitId: string, date: string) => HabitStatus | null;
  getTodayCompletionRate: () => number;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: defaultHabits,
  logs: [],
  isLoaded: false,

  loadHabits: async () => {
    try {
      const storedHabits = await AsyncStorage.getItem(HABITS_KEY);
      const storedLogs = await AsyncStorage.getItem(HABIT_LOGS_KEY);

      const habits = storedHabits ? JSON.parse(storedHabits) : defaultHabits;
      const logs = storedLogs ? JSON.parse(storedLogs) : [];

      set({ habits, logs, isLoaded: true });
    } catch {
      set({ habits: defaultHabits, logs: [], isLoaded: true });
    }
  },

  createHabit: async (name, description, days = [1, 2, 3, 4, 5, 6, 7]) => {
    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      name,
      description: description || null,
      schedule_config: { days },
      reminder_config: { enabled: true, time: '20:00' },
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [...get().habits, newHabit];
    set({ habits: updated });
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
    return newHabit;
  },

  updateHabitStatus: async (habitId, status, date) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const { logs } = get();

    const existingIdx = logs.findIndex(
      (l) => l.habit_id === habitId && l.date === targetDate
    );

    let updatedLogs: HabitLog[];
    if (existingIdx >= 0) {
      updatedLogs = logs.map((l, idx) =>
        idx === existingIdx
          ? {
              ...l,
              status,
              completed_at: status === 'completed' ? new Date().toISOString() : null,
            }
          : l
      );
    } else {
      const newLog: HabitLog = {
        id: `hl-${Date.now()}`,
        habit_id: habitId,
        date: targetDate,
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        notes: null,
      };
      updatedLogs = [...logs, newLog];
    }

    set({ logs: updatedLogs });
    await AsyncStorage.setItem(HABIT_LOGS_KEY, JSON.stringify(updatedLogs));
  },

  getStatusForDate: (habitId, date) => {
    const log = get().logs.find((l) => l.habit_id === habitId && l.date === date);
    return log ? log.status : null;
  },

  getTodayCompletionRate: () => {
    const today = new Date().toISOString().split('T')[0];
    const { habits, logs } = get();
    const activeHabits = habits.filter((h) => h.is_active);
    if (activeHabits.length === 0) return 1;

    let completed = 0;
    for (const h of activeHabits) {
      const log = logs.find((l) => l.habit_id === h.id && l.date === today);
      if (log?.status === 'completed') completed++;
    }

    return completed / activeHabits.length;
  },
}));
