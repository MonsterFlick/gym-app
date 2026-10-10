import { create } from 'zustand';
import * as Haptics from 'expo-haptics';

interface TimerStore {
  isActive: boolean;
  isPaused: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  currentExerciseName: string | null;
  intervalId: ReturnType<typeof setInterval> | null;

  startTimer: (durationSeconds: number, exerciseName?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  skipTimer: () => void;
  addSeconds: (seconds: number) => void;
  resetTimer: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  isActive: false,
  isPaused: false,
  totalSeconds: 90,
  remainingSeconds: 90,
  currentExerciseName: null,
  intervalId: null,

  startTimer: (durationSeconds: number, exerciseName?: string) => {
    // Clear existing interval
    const existing = get().intervalId;
    if (existing) clearInterval(existing);

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    set({
      isActive: true,
      isPaused: false,
      totalSeconds: durationSeconds,
      remainingSeconds: durationSeconds,
      currentExerciseName: exerciseName || null,
    });

    const id = setInterval(() => {
      const state = get();
      if (!state.isActive || state.isPaused) return;

      if (state.remainingSeconds <= 1) {
        // Timer completed!
        clearInterval(state.intervalId!);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {}
        set({
          isActive: false,
          isPaused: false,
          remainingSeconds: 0,
          intervalId: null,
        });
      } else {
        set({ remainingSeconds: state.remainingSeconds - 1 });
      }
    }, 1000);

    set({ intervalId: id });
  },

  pauseTimer: () => {
    set({ isPaused: true });
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  },

  resumeTimer: () => {
    set({ isPaused: false });
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  },

  skipTimer: () => {
    const existing = get().intervalId;
    if (existing) clearInterval(existing);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    set({
      isActive: false,
      isPaused: false,
      remainingSeconds: 0,
      intervalId: null,
    });
  },

  addSeconds: (seconds: number) => {
    const state = get();
    const nextTotal = state.totalSeconds + seconds;
    const nextRemaining = state.remainingSeconds + seconds;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    set({
      totalSeconds: nextTotal,
      remainingSeconds: nextRemaining,
    });
  },

  resetTimer: () => {
    const state = get();
    const existing = state.intervalId;
    if (existing) clearInterval(existing);
    set({
      isActive: false,
      isPaused: false,
      remainingSeconds: state.totalSeconds,
      intervalId: null,
    });
  },
}));
