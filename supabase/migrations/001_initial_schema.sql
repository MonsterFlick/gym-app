-- ==============================================================================
-- 001_initial_schema.sql
-- Personal Fitness & Habit Tracker — Supabase Schema
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. HABITS
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  schedule_config JSONB NOT NULL DEFAULT '{"days": [1,2,3,4,5,6,7]}',
  reminder_config JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'missed', 'skipped')),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(habit_id, date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs(habit_id, date);

-- 2. HYDRATION
CREATE TABLE IF NOT EXISTS hydration_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quantity_ml INTEGER NOT NULL CHECK (quantity_ml > 0),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hydration_logged_at ON hydration_entries(logged_at);

-- 3. SUPPLEMENTS
CREATE TABLE IF NOT EXISTS supplements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  dose_value NUMERIC NOT NULL CHECK (dose_value > 0),
  dose_unit TEXT NOT NULL,
  schedule_config JSONB NOT NULL DEFAULT '{"days": [1,2,3,4,5,6,7], "times": ["08:00"]}',
  instructions TEXT,
  reminder_config JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplement_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplement_id UUID NOT NULL REFERENCES supplements(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('taken', 'missed', 'skipped')),
  taken_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(supplement_id, scheduled_at)
);

CREATE INDEX IF NOT EXISTS idx_supplement_logs_scheduled ON supplement_logs(scheduled_at);

-- 4. WEIGH-INS
CREATE TABLE IF NOT EXISTS weigh_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0),
  measurement_period TEXT NOT NULL CHECK (measurement_period IN ('morning', 'night')),
  measured_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weigh_ins_measured ON weigh_ins(measured_at);
CREATE INDEX IF NOT EXISTS idx_weigh_ins_period ON weigh_ins(measurement_period);

-- 5. WORKOUT DAYS (Templates)
CREATE TABLE IF NOT EXISTS workout_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 7),
  name TEXT NOT NULL,
  workout_type TEXT,
  is_rest_day BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(day_number)
);

-- 6. EXERCISES
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  instructions TEXT,
  video_url TEXT,
  default_rest_seconds INTEGER DEFAULT 90,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. WORKOUT EXERCISE ASSIGNMENTS
CREATE TABLE IF NOT EXISTS workout_exercise_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_day_id UUID NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  planned_sets INTEGER NOT NULL CHECK (planned_sets > 0),
  minimum_reps INTEGER,
  maximum_reps INTEGER,
  target_type TEXT NOT NULL DEFAULT 'rep_range' CHECK (target_type IN ('rep_range', 'to_failure')),
  execution_focus TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workout_day_id, exercise_id)
);

-- 8. WORKOUT SESSIONS
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_day_id UUID NOT NULL REFERENCES workout_days(id),
  workout_date DATE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(workout_date);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_status ON workout_sessions(status);

-- 9. WORKOUT SETS
CREATE TABLE IF NOT EXISTS workout_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  set_number INTEGER NOT NULL CHECK (set_number > 0),
  planned_weight NUMERIC(6,2),
  actual_weight NUMERIC(6,2),
  actual_reps INTEGER,
  rpe NUMERIC(3,1) CHECK (rpe BETWEEN 1 AND 10),
  difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'hard', 'very_hard', 'maximum')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'skipped')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workout_sets_session ON workout_sets(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise ON workout_sets(exercise_id);

-- 10. APP SETTINGS
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)
-- Single-user deployment: anon role has full access via client anon key.
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weigh_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercise_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon all on habits" ON habits FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on habit_logs" ON habit_logs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on hydration_entries" ON hydration_entries FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on supplements" ON supplements FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on supplement_logs" ON supplement_logs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on weigh_ins" ON weigh_ins FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on workout_days" ON workout_days FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on exercises" ON exercises FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on workout_exercise_assignments" ON workout_exercise_assignments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on workout_sessions" ON workout_sessions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on workout_sets" ON workout_sets FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on app_settings" ON app_settings FOR ALL TO anon USING (true) WITH CHECK (true);
