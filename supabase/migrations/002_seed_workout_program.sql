-- ==============================================================================
-- 002_seed_workout_program.sql
-- Seed the 6-day workout program, default habits, and app settings
-- ==============================================================================

-- 1. SEED DEFAULT SETTINGS
INSERT INTO app_settings (key, value)
VALUES (
  'general_config',
  '{
    "water_target_ml": 3000,
    "water_unit": "ml",
    "water_quick_amounts": [100, 250, 500],
    "water_reminder_mode": "target_based",
    "water_reminder_interval_min": 30,
    "waking_hours": { "start": "06:00", "end": "23:00" },
    "quiet_hours": { "start": "23:00", "end": "06:00" },
    "morning_weighin_time": "07:00",
    "night_weighin_time": "22:00",
    "default_rest_seconds": 90,
    "weight_increment_kg": 2.5,
    "notifications_enabled": true
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- 2. SEED DEFAULT HABITS
INSERT INTO habits (name, description, schedule_config)
VALUES 
  ('No Sugar', 'Avoid added sugar, sweets, sugary drinks, and desserts.', '{"days": [1,2,3,4,5,6,7]}'::jsonb),
  ('No Fast Food', 'Eat clean, home-prepared or wholesome meals only.', '{"days": [1,2,3,4,5,6,7]}'::jsonb)
ON CONFLICT DO NOTHING;

-- 3. SEED DEFAULT SUPPLEMENTS
INSERT INTO supplements (name, dose_value, dose_unit, schedule_config, instructions)
VALUES
  ('Creatine Monohydrate', 5, 'g', '{"days": [1,2,3,4,5,6,7], "times": ["09:00"]}'::jsonb, 'Take with water or post-workout shake.'),
  ('Vitamin D3', 5000, 'IU', '{"days": [1,2,3,4,5,6,7], "times": ["08:00"]}'::jsonb, 'Take with a meal containing healthy fats.')
ON CONFLICT DO NOTHING;

-- 4. SEED WORKOUT DAYS
INSERT INTO workout_days (day_number, name, workout_type, is_rest_day)
VALUES
  (1, 'Pull — Maximum Lat Width', 'Pull', FALSE),
  (2, 'Push — Shoulder Caps & Upper Chest', 'Push', FALSE),
  (3, 'Legs', 'Legs', FALSE),
  (4, 'Pull — Maximum Lat Width', 'Pull', FALSE),
  (5, 'Push — Shoulder Caps & Upper Chest', 'Push', FALSE),
  (6, 'V-Taper Amplifier', 'V-Taper', FALSE),
  (7, 'Rest / Recovery', 'Rest', TRUE)
ON CONFLICT (day_number) DO NOTHING;

-- 5. SEED EXERCISES
INSERT INTO exercises (id, name, instructions, video_url, default_rest_seconds)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'Single-Arm Kneeling Cable Pulldown', 'Drive the elbow toward the hip.', 'https://www.youtube.com', 90),
  ('e1000000-0000-0000-0000-000000000002', 'Chest-Supported Machine Row', 'Flared elbows to emphasize upper back and rear delts.', 'https://www.youtube.com', 90),
  ('e1000000-0000-0000-0000-000000000003', 'Neutral Grip Cable Pulldown', 'Use a V-bar or MAG grip and stretch fully at the top.', 'https://www.youtube.com', 90),
  ('e1000000-0000-0000-0000-000000000004', 'Single-Arm Cable Curls (Facing Away)', 'Maintain tension through the biceps stretch.', 'https://www.youtube.com', 75),
  ('e1000000-0000-0000-0000-000000000005', 'Lat Pulldown Cable Crunch (Face-Away)', 'Bring the ribs toward the pelvis with a controlled crunch.', 'https://www.youtube.com', 60),
  ('e1000000-0000-0000-0000-000000000006', 'Reverse Crunch With Ab Mat', 'Bring knees toward the chest and lift the glutes off the mat.', 'https://www.youtube.com', 60),
  ('e2000000-0000-0000-0000-000000000001', 'Low-Incline Dumbbell Press (30°)', 'Emphasize the upper chest.', 'https://www.youtube.com', 120),
  ('e2000000-0000-0000-0000-000000000002', 'Seated Dumbbell Shoulder Press', 'Compound shoulder exercise.', 'https://www.youtube.com', 105),
  ('e2000000-0000-0000-0000-000000000003', 'Cable Lateral Raises (Behind Back)', 'Maintain constant tension on the side deltoid.', 'https://www.youtube.com', 60),
  ('e2000000-0000-0000-0000-000000000004', 'Pec Deck Fly Machine', 'Control the stretch and contraction.', 'https://www.youtube.com', 75),
  ('e2000000-0000-0000-0000-000000000005', 'Cross-Body Cable Tricep Extensions', 'Pull across the body with controlled movement.', 'https://www.youtube.com', 60),
  ('e3000000-0000-0000-0000-000000000001', 'Hack Squat', 'Use a controlled, comfortable range of motion.', 'https://www.youtube.com', 120),
  ('e3000000-0000-0000-0000-000000000002', 'Leg Extensions', 'Hold the contraction at the top for one second.', 'https://www.youtube.com', 75),
  ('e3000000-0000-0000-0000-000000000003', 'Seated Leg Curls', 'Lean forward to emphasize the hamstring stretch, where comfortable.', 'https://www.youtube.com', 75),
  ('e3000000-0000-0000-0000-000000000004', 'Seated Calf Raises', 'Pause at the bottom stretch for two seconds.', 'https://www.youtube.com', 60),
  ('e6000000-0000-0000-0000-000000000001', 'Dumbbell Lateral Raises (Heavy)', 'Controlled lowering phase.', 'https://www.youtube.com', 90),
  ('e6000000-0000-0000-0000-000000000002', 'Wide Grip Lat Pulldowns', 'Pull toward the upper chest with controlled movement.', 'https://www.youtube.com', 90),
  ('e6000000-0000-0000-0000-000000000003', 'Cable Face Pulls', 'Emphasize rear delts with controlled form.', 'https://www.youtube.com', 75)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED ASSIGNMENTS (Days 1 & 4: Pull)
DO $$
DECLARE
  day1_id UUID;
  day4_id UUID;
  day2_id UUID;
  day5_id UUID;
  day3_id UUID;
  day6_id UUID;
BEGIN
  SELECT id INTO day1_id FROM workout_days WHERE day_number = 1;
  SELECT id INTO day4_id FROM workout_days WHERE day_number = 4;
  SELECT id INTO day2_id FROM workout_days WHERE day_number = 2;
  SELECT id INTO day5_id FROM workout_days WHERE day_number = 5;
  SELECT id INTO day3_id FROM workout_days WHERE day_number = 3;
  SELECT id INTO day6_id FROM workout_days WHERE day_number = 6;

  -- Day 1 & Day 4: Pull
  INSERT INTO workout_exercise_assignments (workout_day_id, exercise_id, sort_order, planned_sets, minimum_reps, maximum_reps, target_type, execution_focus)
  VALUES
    (day1_id, 'e1000000-0000-0000-0000-000000000001', 1, 4, 8, 12, 'rep_range', 'Drive the elbow toward the hip.'),
    (day1_id, 'e1000000-0000-0000-0000-000000000002', 2, 4, 8, 10, 'rep_range', 'Flared elbows to emphasize upper back and rear delts.'),
    (day1_id, 'e1000000-0000-0000-0000-000000000003', 3, 3, 10, 12, 'rep_range', 'Use a V-bar or MAG grip and stretch fully at the top.'),
    (day1_id, 'e1000000-0000-0000-0000-000000000004', 4, 3, 10, 12, 'rep_range', 'Maintain tension through the biceps stretch.'),
    (day1_id, 'e1000000-0000-0000-0000-000000000005', 5, 4, 12, 15, 'rep_range', 'Bring the ribs toward the pelvis with a controlled crunch.'),
    (day1_id, 'e1000000-0000-0000-0000-000000000006', 6, 4, 15, 20, 'rep_range', 'Bring knees toward the chest and lift the glutes off the mat.'),
    
    (day4_id, 'e1000000-0000-0000-0000-000000000001', 1, 4, 8, 12, 'rep_range', 'Drive the elbow toward the hip.'),
    (day4_id, 'e1000000-0000-0000-0000-000000000002', 2, 4, 8, 10, 'rep_range', 'Flared elbows to emphasize upper back and rear delts.'),
    (day4_id, 'e1000000-0000-0000-0000-000000000003', 3, 3, 10, 12, 'rep_range', 'Use a V-bar or MAG grip and stretch fully at the top.'),
    (day4_id, 'e1000000-0000-0000-0000-000000000004', 4, 3, 10, 12, 'rep_range', 'Maintain tension through the biceps stretch.'),
    (day4_id, 'e1000000-0000-0000-0000-000000000005', 5, 4, 12, 15, 'rep_range', 'Bring the ribs toward the pelvis with a controlled crunch.'),
    (day4_id, 'e1000000-0000-0000-0000-000000000006', 6, 4, 15, 20, 'rep_range', 'Bring knees toward the chest and lift the glutes off the mat.')
  ON CONFLICT DO NOTHING;

  -- Day 2 & Day 5: Push
  INSERT INTO workout_exercise_assignments (workout_day_id, exercise_id, sort_order, planned_sets, minimum_reps, maximum_reps, target_type, execution_focus)
  VALUES
    (day2_id, 'e2000000-0000-0000-0000-000000000001', 1, 4, 8, 10, 'rep_range', 'Emphasize the upper chest.'),
    (day2_id, 'e2000000-0000-0000-0000-000000000002', 2, 4, 8, 10, 'rep_range', 'Compound shoulder exercise.'),
    (day2_id, 'e2000000-0000-0000-0000-000000000003', 3, 4, 12, 15, 'rep_range', 'Maintain constant tension on the side deltoid.'),
    (day2_id, 'e2000000-0000-0000-0000-000000000004', 4, 3, 10, 12, 'rep_range', 'Control the stretch and contraction.'),
    (day2_id, 'e2000000-0000-0000-0000-000000000005', 5, 4, 12, 15, 'rep_range', 'Pull across the body with controlled movement.'),

    (day5_id, 'e2000000-0000-0000-0000-000000000001', 1, 4, 8, 10, 'rep_range', 'Emphasize the upper chest.'),
    (day5_id, 'e2000000-0000-0000-0000-000000000002', 2, 4, 8, 10, 'rep_range', 'Compound shoulder exercise.'),
    (day5_id, 'e2000000-0000-0000-0000-000000000003', 3, 4, 12, 15, 'rep_range', 'Maintain constant tension on the side deltoid.'),
    (day5_id, 'e2000000-0000-0000-0000-000000000004', 4, 3, 10, 12, 'rep_range', 'Control the stretch and contraction.'),
    (day5_id, 'e2000000-0000-0000-0000-000000000005', 5, 4, 12, 15, 'rep_range', 'Pull across the body with controlled movement.')
  ON CONFLICT DO NOTHING;

  -- Day 3: Legs
  INSERT INTO workout_exercise_assignments (workout_day_id, exercise_id, sort_order, planned_sets, minimum_reps, maximum_reps, target_type, execution_focus)
  VALUES
    (day3_id, 'e3000000-0000-0000-0000-000000000001', 1, 4, 8, 12, 'rep_range', 'Use a controlled, comfortable range of motion.'),
    (day3_id, 'e3000000-0000-0000-0000-000000000002', 2, 3, 12, 15, 'rep_range', 'Hold the contraction at the top for one second.'),
    (day3_id, 'e3000000-0000-0000-0000-000000000003', 3, 4, 10, 12, 'rep_range', 'Lean forward to emphasize the hamstring stretch, where comfortable.'),
    (day3_id, 'e3000000-0000-0000-0000-000000000004', 4, 4, 15, 20, 'rep_range', 'Pause at the bottom stretch for two seconds.'),
    (day3_id, 'e1000000-0000-0000-0000-000000000005', 5, 4, 12, 15, 'rep_range', 'Focus on controlled spinal flexion rather than pulling with the arms.'),
    (day3_id, 'e1000000-0000-0000-0000-000000000006', 6, 4, 15, 20, 'rep_range', 'Control the lowering phase.')
  ON CONFLICT DO NOTHING;

  -- Day 6: V-Taper Amplifier
  INSERT INTO workout_exercise_assignments (workout_day_id, exercise_id, sort_order, planned_sets, minimum_reps, maximum_reps, target_type, execution_focus)
  VALUES
    (day6_id, 'e6000000-0000-0000-0000-000000000001', 1, 5, 10, 15, 'rep_range', 'Controlled lowering phase.'),
    (day6_id, 'e6000000-0000-0000-0000-000000000002', 2, 4, 10, 12, 'rep_range', 'Pull toward the upper chest with controlled movement.'),
    (day6_id, 'e6000000-0000-0000-0000-000000000003', 3, 3, 15, 15, 'rep_range', 'Emphasize rear delts with controlled form.'),
    (day6_id, 'e1000000-0000-0000-0000-000000000005', 4, 4, NULL, NULL, 'to_failure', 'Use a load and range of motion that can be controlled.'),
    (day6_id, 'e1000000-0000-0000-0000-000000000006', 5, 4, NULL, NULL, 'to_failure', 'Control the movement and contract the lower abs.')
  ON CONFLICT DO NOTHING;
END $$;
