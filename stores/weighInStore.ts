import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeighIn, MeasurementPeriod } from '../types/database';

const WEIGH_INS_KEY = '@gym_om_weigh_ins';

interface WeighInStore {
  entries: WeighIn[];
  isLoaded: boolean;

  loadWeighIns: () => Promise<void>;
  logWeight: (params: {
    weightKg: number;
    period: MeasurementPeriod;
    notes?: string;
    measuredAt?: string;
  }) => Promise<WeighIn>;
  deleteEntry: (id: string) => Promise<void>;
  getTodayWeighIn: (period: MeasurementPeriod) => WeighIn | null;
  getRecentEntries: (limit?: number) => WeighIn[];
}

export const useWeighInStore = create<WeighInStore>((set, get) => ({
  entries: [],
  isLoaded: false,

  loadWeighIns: async () => {
    try {
      const stored = await AsyncStorage.getItem(WEIGH_INS_KEY);
      const entries = stored ? JSON.parse(stored) : [];
      set({ entries, isLoaded: true });
    } catch {
      set({ entries: [], isLoaded: true });
    }
  },

  logWeight: async ({ weightKg, period, notes, measuredAt }) => {
    const time = measuredAt || new Date().toISOString();
    const today = time.split('T')[0];

    // Check if an entry already exists for this period today
    const { entries } = get();
    const existingIdx = entries.findIndex(
      (e) => e.measurement_period === period && e.measured_at.startsWith(today)
    );

    let updated: WeighIn[];
    let targetEntry: WeighIn;

    if (existingIdx >= 0) {
      targetEntry = {
        ...entries[existingIdx],
        weight_kg: weightKg,
        notes: notes || entries[existingIdx].notes,
        updated_at: new Date().toISOString(),
      };
      updated = entries.map((e, idx) => (idx === existingIdx ? targetEntry : e));
    } else {
      targetEntry = {
        id: `wgh-${Date.now()}`,
        weight_kg: weightKg,
        measurement_period: period,
        measured_at: time,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      updated = [targetEntry, ...entries];
    }

    set({ entries: updated });
    await AsyncStorage.setItem(WEIGH_INS_KEY, JSON.stringify(updated));
    return targetEntry;
  },

  deleteEntry: async (id) => {
    const updated = get().entries.filter((e) => e.id !== id);
    set({ entries: updated });
    await AsyncStorage.setItem(WEIGH_INS_KEY, JSON.stringify(updated));
  },

  getTodayWeighIn: (period) => {
    const today = new Date().toISOString().split('T')[0];
    return (
      get().entries.find(
        (e) => e.measurement_period === period && e.measured_at.startsWith(today)
      ) || null
    );
  },

  getRecentEntries: (limit = 30) => {
    return get().entries.slice(0, limit);
  },
}));
