export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type HabitStatus = 'completed' | 'missed' | 'skipped';
export type SupplementStatus = 'taken' | 'missed' | 'skipped';
export type MeasurementPeriod = 'morning' | 'night';
export type TargetType = 'rep_range' | 'to_failure';
export type WorkoutSessionStatus = 'in_progress' | 'completed' | 'abandoned';
export type SetDifficulty = 'easy' | 'moderate' | 'hard' | 'very_hard' | 'maximum';
export type SetStatus = 'pending' | 'completed' | 'failed' | 'skipped';

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  schedule_config: {
    days: number[]; // 1 = Monday, 7 = Sunday
  };
  reminder_config: {
    enabled: boolean;
    time: string; // HH:mm
  } | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  status: HabitStatus;
  completed_at: string | null;
  notes: string | null;
}

export interface HydrationEntry {
  id: string;
  quantity_ml: number;
  logged_at: string;
  notes: string | null;
  created_at: string;
}

export interface Supplement {
  id: string;
  name: string;
  dose_value: number;
  dose_unit: string;
  schedule_config: {
    days: number[];
    times: string[]; // ['08:00', '20:00']
  };
  instructions: string | null;
  reminder_config: {
    enabled: boolean;
  } | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplementLog {
  id: string;
  supplement_id: string;
  scheduled_at: string;
  status: SupplementStatus;
  taken_at: string | null;
  notes: string | null;
}

export interface WeighIn {
  id: string;
  weight_kg: number;
  measurement_period: MeasurementPeriod;
  measured_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutDay {
  id: string;
  day_number: number; // 1 to 7
  name: string;
  workout_type: string;
  is_rest_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  instructions: string | null;
  video_url: string | null;
  default_rest_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExerciseAssignment {
  id: string;
  workout_day_id: string;
  exercise_id: string;
  sort_order: number;
  planned_sets: number;
  minimum_reps: number | null;
  maximum_reps: number | null;
  target_type: TargetType;
  execution_focus: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  exercise?: Exercise;
}

export interface WorkoutSession {
  id: string;
  workout_day_id: string;
  workout_date: string; // YYYY-MM-DD
  started_at: string;
  finished_at: string | null;
  status: WorkoutSessionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  workout_day?: WorkoutDay;
  sets?: WorkoutSet[];
}

export interface WorkoutSet {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  set_number: number;
  planned_weight: number | null;
  actual_weight: number | null;
  actual_reps: number | null;
  rpe: number | null; // 1 to 10
  difficulty: SetDifficulty | null;
  status: SetStatus;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  exercise?: Exercise;
}

export interface AppSettingsConfig {
  water_target_ml: number;
  water_unit: 'ml' | 'l';
  water_quick_amounts: number[];
  water_reminder_mode: 'target_based' | 'fixed_interval';
  water_reminder_interval_min: number;
  waking_hours: { start: string; end: string };
  quiet_hours: { start: string; end: string };
  morning_weighin_time: string;
  night_weighin_time: string;
  default_rest_seconds: number;
  weight_increment_kg: number;
  notifications_enabled: boolean;
}
