import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettingsConfig } from '../types/database';
import { defaultSettings } from '../lib/seedData';

const SETTINGS_KEY = '@gym_om_app_settings';

interface SettingsStore extends AppSettingsConfig {
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettingsConfig>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...defaultSettings,
  isLoaded: false,

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ ...parsed, isLoaded: true });
        return;
      }
    } catch {}
    set({ isLoaded: true });
  },

  updateSettings: async (newSettings) => {
    const updated = { ...get(), ...newSettings };
    set(newSettings);
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch {}
  },
}));
