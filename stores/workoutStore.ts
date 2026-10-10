import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WorkoutDay,
  Exercise,
  WorkoutExerciseAssignment,
  WorkoutSession,
  WorkoutSet,
  SetDifficulty,
  SetStatus,
} from '../types/database';
import {
  defaultWorkoutDays,
  defaultExercises,
  defaultAssignments,
} from '../lib/seedData';
import { useTimerStore } from './timerStore';

const ACTIVE_WORKOUT_KEY = '@gym_om_active_session';
const COMPLETED_SESSIONS_KEY = '@gym_om_completed_sessions';

export interface ExerciseWithAssignment {
  exercise: Exercise;
  assignment: WorkoutExerciseAssignment;
  sets: WorkoutSet[];
  previousSets?: WorkoutSet[];
}

interface WorkoutStore {
  workoutDays: WorkoutDay[];
  exercises: Exercise[];
  assignments: WorkoutExerciseAssignment[];
  activeSession: WorkoutSession | null;
  activeExercises: ExerciseWithAssignment[];
  completedSessions: WorkoutSession[];
  isLoaded: boolean;

  // Actions
  initialize: () => Promise<void>;
  startWorkout: (dayNumber: number) => Promise<WorkoutSession>;
  logSet: (params: {
    exerciseId: string;
    setNumber: number;
    weight: number;
    reps: number;
    rpe?: number;
    difficulty?: SetDifficulty;
    status: SetStatus;
    notes?: string;
  }) => Promise<void>;
  finishWorkout: (notes?: string) => Promise<WorkoutSession | null>;
  abandonWorkout: () => Promise<void>;
  getPreviousPerformance: (exerciseId: string) => WorkoutSet[];
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  workoutDays: defaultWorkoutDays,
  exercises: defaultExercises,
  assignments: defaultAssignments,
  activeSession: null,
  activeExercises: [],
  completedSessions: [],
  isLoaded: false,

  initialize: async () => {
    try {
      const storedActive = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);
      const storedCompleted = await AsyncStorage.getItem(COMPLETED_SESSIONS_KEY);

      const completedSessions: WorkoutSession[] = storedCompleted
        ? JSON.parse(storedCompleted)
        : [];

      if (storedActive) {
        const { session, activeExercises } = JSON.parse(storedActive);
        set({
          activeSession: session,
          activeExercises,
          completedSessions,
          isLoaded: true,
        });
        return;
      }

      set({ completedSessions, isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  getPreviousPerformance: (exerciseId: string): WorkoutSet[] => {
    const { completedSessions } = get();
    // Search backward through completed sessions
    for (let i = completedSessions.length - 1; i >= 0; i--) {
      const sess = completedSessions[i];
      if (sess.sets && sess.sets.length > 0) {
        const matchingSets = sess.sets.filter((s) => s.exercise_id === exerciseId);
        if (matchingSets.length > 0) {
          return matchingSets;
        }
      }
    }
    return [];
  },

  startWorkout: async (dayNumber: number) => {
    const { workoutDays, assignments, exercises, getPreviousPerformance } = get();
    const day = workoutDays.find((d) => d.day_number === dayNumber) || workoutDays[0];

    const todayDate = new Date().toISOString().split('T')[0];

    const session: WorkoutSession = {
      id: `sess-${Date.now()}`,
      workout_day_id: day.id,
      workout_date: todayDate,
      started_at: new Date().toISOString(),
      finished_at: null,
      status: 'in_progress',
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      workout_day: day,
      sets: [],
    };

    // Filter assignments for this day
    const dayAssignments = assignments
      .filter((a) => a.workout_day_id === day.id)
      .sort((a, b) => a.sort_order - b.sort_order);

    const activeExercises: ExerciseWithAssignment[] = dayAssignments.map((assignment) => {
      const ex = exercises.find((e) => e.id === assignment.exercise_id)!;
      const prevSets = getPreviousPerformance(ex.id);

      // Prepopulate planned sets
      const plannedSets: WorkoutSet[] = Array.from({ length: assignment.planned_sets }).map(
        (_, idx) => {
          const prevSet = prevSets[idx];
          return {
            id: `set-${assignment.id}-${idx + 1}-${Date.now()}`,
            workout_session_id: session.id,
            exercise_id: ex.id,
            set_number: idx + 1,
            planned_weight: prevSet?.actual_weight || null,
            actual_weight: prevSet?.actual_weight || null,
            actual_reps: null,
            rpe: null,
            difficulty: null,
            status: 'pending',
            notes: null,
            completed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      );

      return {
        exercise: ex,
        assignment,
        sets: plannedSets,
        previousSets: prevSets,
      };
    });

    set({ activeSession: session, activeExercises });

    await AsyncStorage.setItem(
      ACTIVE_WORKOUT_KEY,
      JSON.stringify({ session, activeExercises })
    );

    return session;
  },

  logSet: async ({ exerciseId, setNumber, weight, reps, rpe, difficulty, status, notes }) => {
    const { activeSession, activeExercises } = get();
    if (!activeSession) return;

    let targetRestSeconds = 90;

    const updatedExercises = activeExercises.map((ae) => {
      if (ae.exercise.id !== exerciseId) return ae;

      targetRestSeconds = ae.exercise.default_rest_seconds || 90;

      const updatedSets = ae.sets.map((s) => {
        if (s.set_number !== setNumber) return s;
        return {
          ...s,
          actual_weight: weight,
          actual_reps: reps,
          rpe: rpe || null,
          difficulty: difficulty || null,
          status,
          notes: notes || null,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      return {
        ...ae,
        sets: updatedSets,
      };
    });

    // Flatten all sets into session
    const allSets = updatedExercises.flatMap((ae) => ae.sets);
    const updatedSession = { ...activeSession, sets: allSets };

    set({ activeSession: updatedSession, activeExercises: updatedExercises });

    await AsyncStorage.setItem(
      ACTIVE_WORKOUT_KEY,
      JSON.stringify({ session: updatedSession, activeExercises: updatedExercises })
    );

    // Auto-trigger rest timer if set was completed
    if (status === 'completed') {
      const ex = updatedExercises.find((ae) => ae.exercise.id === exerciseId)?.exercise;
      useTimerStore.getState().startTimer(targetRestSeconds, ex?.name);
    }
  },

  finishWorkout: async (notes) => {
    const { activeSession, activeExercises, completedSessions } = get();
    if (!activeSession) return null;

    const allSets = activeExercises.flatMap((ae) => ae.sets);
    const finished: WorkoutSession = {
      ...activeSession,
      finished_at: new Date().toISOString(),
      status: 'completed',
      notes: notes || activeSession.notes,
      sets: allSets,
    };

    const nextCompleted = [...completedSessions, finished];

    set({
      activeSession: null,
      activeExercises: [],
      completedSessions: nextCompleted,
    });

    await AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
    await AsyncStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(nextCompleted));

    return finished;
  },

  abandonWorkout: async () => {
    const { activeSession, activeExercises, completedSessions } = get();
    if (activeSession) {
      const abandoned: WorkoutSession = {
        ...activeSession,
        finished_at: new Date().toISOString(),
        status: 'abandoned',
        sets: activeExercises.flatMap((ae) => ae.sets),
      };
      const nextCompleted = [...completedSessions, abandoned];
      set({
        activeSession: null,
        activeExercises: [],
        completedSessions: nextCompleted,
      });
      await AsyncStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(nextCompleted));
    }
    await AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
  },
}));
