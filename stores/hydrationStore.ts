import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HydrationEntry } from '../types/database';

const HYDRATION_KEY = '@gym_om_hydration';

interface HydrationStore {
  entries: HydrationEntry[];
  isLoaded: boolean;

  loadHydration: () => Promise<void>;
  logWater: (quantityMl: number, notes?: string) => Promise<HydrationEntry>;
  deleteEntry: (id: string) => Promise<void>;
  removeLatestWater: (quantityMl?: number) => Promise<void>;
  getTodayTotalMl: () => number;
  getTodayEntries: () => HydrationEntry[];
  getEntriesForDate: (date: string) => HydrationEntry[];
}

export const useHydrationStore = create<HydrationStore>((set, get) => ({
  entries: [],
  isLoaded: false,

  loadHydration: async () => {
    try {
      const stored = await AsyncStorage.getItem(HYDRATION_KEY);
      const entries = stored ? JSON.parse(stored) : [];
      set({ entries, isLoaded: true });
    } catch {
      set({ entries: [], isLoaded: true });
    }
  },

  logWater: async (quantityMl, notes) => {
    const newEntry: HydrationEntry = {
      id: `w-${Date.now()}`,
      quantity_ml: quantityMl,
      logged_at: new Date().toISOString(),
      notes: notes || null,
      created_at: new Date().toISOString(),
    };

    const updated = [newEntry, ...get().entries];
    set({ entries: updated });
    await AsyncStorage.setItem(HYDRATION_KEY, JSON.stringify(updated));
    return newEntry;
  },

  deleteEntry: async (id) => {
    const updated = get().entries.filter((e) => e.id !== id);
    set({ entries: updated });
    await AsyncStorage.setItem(HYDRATION_KEY, JSON.stringify(updated));
  },

  removeLatestWater: async (quantityMl) => {
    const today = new Date().toISOString().split('T')[0];
    const entries = get().entries;
    const todayEntries = entries.filter((e) => e.logged_at.startsWith(today));
    if (todayEntries.length === 0) return;

    const latest = todayEntries[0];
    if (!quantityMl || latest.quantity_ml <= quantityMl) {
      // Remove latest entry
      const updated = entries.filter((e) => e.id !== latest.id);
      set({ entries: updated });
      await AsyncStorage.setItem(HYDRATION_KEY, JSON.stringify(updated));
    } else {
      // Subtract quantityMl from latest entry
      const updated = entries.map((e) =>
        e.id === latest.id ? { ...e, quantity_ml: e.quantity_ml - quantityMl } : e
      );
      set({ entries: updated });
      await AsyncStorage.setItem(HYDRATION_KEY, JSON.stringify(updated));
    }
  },

  getTodayTotalMl: () => {
    const today = new Date().toISOString().split('T')[0];
    const total = get()
      .entries.filter((e) => e.logged_at.startsWith(today))
      .reduce((sum, e) => sum + e.quantity_ml, 0);
    return Math.max(0, total);
  },

  getTodayEntries: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().entries.filter((e) => e.logged_at.startsWith(today));
  },

  getEntriesForDate: (date: string) => {
    return get().entries.filter((e) => e.logged_at.startsWith(date));
  },
}));
