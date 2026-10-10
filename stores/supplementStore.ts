import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Supplement, SupplementLog, SupplementStatus } from '../types/database';
import { defaultSupplements } from '../lib/seedData';

const SUPPLEMENTS_KEY = '@gym_om_supplements';
const SUPPLEMENT_LOGS_KEY = '@gym_om_supplement_logs';

interface SupplementStore {
  supplements: Supplement[];
  logs: SupplementLog[];
  isLoaded: boolean;

  loadSupplements: () => Promise<void>;
  createSupplement: (data: Omit<Supplement, 'id' | 'created_at' | 'updated_at'>) => Promise<Supplement>;
  updateLogStatus: (supplementId: string, status: SupplementStatus, scheduledTime?: string) => Promise<void>;
  getTodayLogs: () => { supplement: Supplement; log: SupplementLog | null }[];
}

export const useSupplementStore = create<SupplementStore>((set, get) => ({
  supplements: defaultSupplements,
  logs: [],
  isLoaded: false,

  loadSupplements: async () => {
    try {
      const storedSupps = await AsyncStorage.getItem(SUPPLEMENTS_KEY);
      const storedLogs = await AsyncStorage.getItem(SUPPLEMENT_LOGS_KEY);

      const supplements = storedSupps ? JSON.parse(storedSupps) : defaultSupplements;
      const logs = storedLogs ? JSON.parse(storedLogs) : [];

      set({ supplements, logs, isLoaded: true });
    } catch {
      set({ supplements: defaultSupplements, logs: [], isLoaded: true });
    }
  },

  createSupplement: async (data) => {
    const newSupplement: Supplement = {
      ...data,
      id: `supp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [...get().supplements, newSupplement];
    set({ supplements: updated });
    await AsyncStorage.setItem(SUPPLEMENTS_KEY, JSON.stringify(updated));
    return newSupplement;
  },

  updateLogStatus: async (supplementId, status, scheduledTime) => {
    const today = new Date().toISOString().split('T')[0];
    const time = scheduledTime || '09:00';
    const scheduledAt = `${today}T${time}:00Z`;

    const { logs } = get();
    const existingIdx = logs.findIndex(
      (l) => l.supplement_id === supplementId && l.scheduled_at.startsWith(today)
    );

    let updated: SupplementLog[];
    if (existingIdx >= 0) {
      updated = logs.map((l, idx) =>
        idx === existingIdx
          ? {
              ...l,
              status,
              taken_at: status === 'taken' ? new Date().toISOString() : null,
            }
          : l
      );
    } else {
      const newLog: SupplementLog = {
        id: `slog-${Date.now()}`,
        supplement_id: supplementId,
        scheduled_at: scheduledAt,
        status,
        taken_at: status === 'taken' ? new Date().toISOString() : null,
        notes: null,
      };
      updated = [newLog, ...logs];
    }

    set({ logs: updated });
    await AsyncStorage.setItem(SUPPLEMENT_LOGS_KEY, JSON.stringify(updated));
  },

  getTodayLogs: () => {
    const today = new Date().toISOString().split('T')[0];
    const { supplements, logs } = get();

    return supplements
      .filter((s) => s.is_active)
      .map((supp) => {
        const log = logs.find(
          (l) => l.supplement_id === supp.id && l.scheduled_at.startsWith(today)
        ) || null;
        return { supplement: supp, log };
      });
  },
}));
