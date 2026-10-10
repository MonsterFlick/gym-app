# Product Requirements Document (PRD)
## Personal Fitness & Habit Tracker

**Version:** 1.0  
**Status:** Ready for implementation  
**Product type:** Single-user, mobile-first fitness application  
**Database and backup:** Supabase  
**Authentication:** Not required

---

# 1. Product Overview

Build a personal fitness application that combines workout tracking, progressive overload, daily habits, hydration reminders, supplement schedules, body-weight tracking, and fitness analytics in one place.

The primary goal is to make it easy to follow a structured fitness routine, record actual performance, maintain consistency, and make informed adjustments to future workouts.

The application must be fast to use during workouts. Recording a set should require only a few interactions, and historical performance should be visible before starting the next set.

## 1.1 Core Principles

- Mobile-first design optimized for use inside a gym.
- One dashboard for daily fitness activities.
- Exercise history available directly from the workout screen.
- Automatic weight and rep suggestions, always optional.
- Flexible habits, reminder schedules, and workout configurations.
- Reliable storage and backup through Supabase.
- No login, signup, user profiles, or multi-user functionality.
- Historical records must remain available when routines change.

# 2. Goals and Success Criteria

The application should enable the user to:

1. Follow a six-day workout plan.
2. Record every exercise set with actual weight and reps.
3. View previous performance before performing an exercise.
4. Receive suggestions for the next set and future workouts.
5. Track water intake and receive reminders.
6. Track habits such as no sugar and no fast food.
7. Take supplements according to a configured schedule.
8. Record body weight every morning and night.
9. Review workout history through a calendar.
10. Measure consistency and progress through weekly and monthly analytics.

## 2.1 Out of Scope

The following are not part of this product:

- User authentication or account management.
- Multi-user support.
- Calorie and macronutrient tracking.
- Meal logging.
- Sleep tracking.
- Step counting.
- Body measurement tracking.
- Progress photo management.
- Social features or leaderboards.
- Drop-set tracking.

# 3. Platform and Technical Requirements

## 3.1 User Interface

The application must use a mobile-first, responsive interface.

Primary target: mobile phones, especially during active gym sessions.

Desktop support should remain available, but desktop layouts must not compromise the mobile experience.

### General UI requirements

- Large touch targets.
- Minimal typing during workouts.
- Clear typography and high contrast.
- Fast navigation between exercises.
- Persistent workout progress when navigating away from the workout screen.
- Confirmation before destructive actions.
- Loading, empty, success, and error states for important screens.
- Clear distinction between planned and completed workout data.

## 3.2 Database and Backup

**Supabase PostgreSQL** will be the primary persistent data store.

Requirements:

- Store all habits, hydration records, supplement schedules, weigh-ins, workout programs, exercise sets, workout sessions, and preferences in Supabase.
- Preserve historical data when records or workout templates are edited.
- Use database constraints and validation to prevent invalid records.
- Include database migrations and versioned schema changes.
- Provide a way to export personal fitness data.
- Configure and verify database backup and recovery procedures appropriate to the deployed Supabase plan.
- Do not rely exclusively on browser storage for important records.

The application does not require application-level authentication. However, the Supabase service-role key must never be exposed in the client. Database access must be designed so that publicly accessible endpoints cannot provide unrestricted access to the database. Because the application has no login, its deployment should be private or protected at the infrastructure level.

## 3.3 Date and Time

- Use the device's local timezone for schedules and reminders.
- Store timestamps consistently in the database.
- Calculate daily, weekly, and monthly summaries using the user's local calendar.
- Support date transitions without duplicating or losing records.

# 4. Main Navigation

The application should have five primary navigation destinations:

1. **Dashboard**
2. **Workout**
3. **Habits**
4. **Progress**
5. **Settings**

Supplement schedules, hydration, and weight logging should also be accessible from the dashboard without requiring users to navigate through several screens.

# 5. Dashboard

The dashboard is the primary screen and should summarize what needs attention today.

## 5.1 Dashboard Components

### Daily overview

Display:

- Current date.
- Today's scheduled workout or rest day.
- Workout completion status.
- Daily habit completion.
- Water consumed versus the daily target.
- Supplement schedule and completion.
- Morning weigh-in status.
- Night weigh-in status.
- Upcoming reminders.

### Quick actions

Provide direct actions to:

- Start today's workout.
- Log water intake.
- Mark a habit complete.
- Mark a supplement taken.
- Record morning weight.
- Record night weight.

### Progress indicators

Show:

- Daily completion percentage.
- Water target progress.
- Workout status.
- Habits completed versus due.
- Supplements taken versus scheduled.

The dashboard must update immediately after the user records an activity.

# 6. Habit Tracker

## 6.1 Default Habits

Preconfigure these habits:

- No sugar.
- No fast food.

Users must be able to create additional habits without changing the application code.

Examples include meditation, walking, or other personal discipline habits.

## 6.2 Habit Configuration

Each habit must support:

- Name.
- Optional description.
- Active or archived status.
- Schedule and applicable days.
- Optional reminder time.
- Optional reminder notification.
- Creation and modification dates.

## 6.3 Daily Habit Status

Each scheduled habit must support these states:

- **Completed:** The user followed the habit.
- **Missed:** The user did not follow or complete it.
- **Skipped:** The user intentionally skipped it.

Users must be able to correct a status after recording it.

A habit that remains unrecorded until the configured day ends should be treated as missed in the daily history, while remaining editable.

## 6.4 Habit History

The application must provide:

- Daily habit checklist.
- Calendar or date-based history.
- Completion streaks.
- Missed and skipped history.
- Habit-specific completion percentages.
- Weekly and monthly consistency summaries.

Archived habits must remain in historical reports.

# 7. Water Tracker

The water tracker must combine a configurable daily target with scheduled reminders.

## 7.1 Water Configuration

The user must be able to configure:

- Daily water target.
- Preferred intake unit, such as millilitres or litres.
- Typical waking hours.
- Reminder schedule.
- Fixed reminder interval, such as every 10, 30, or 60 minutes.
- Reminder start and end times.
- Notifications enabled or disabled.

## 7.2 Water Logging

The user must be able to:

- Log a quantity of water with a single action.
- Select from configurable quick-add quantities.
- Enter a custom quantity.
- View total intake for the day.
- Correct or delete an incorrect entry.

Store each intake record with its quantity and timestamp.

## 7.3 Reminder Scheduling

Support two reminder modes:

**Target-based reminders:** Schedule prompts throughout the user's configured waking hours according to the daily target and intake already recorded.

**Fixed-interval reminders:** Prompt at the configured interval, including every 10 minutes if selected.

The target-based mode should be the default.

Reminder behaviour:

- Stop or reduce reminders when the daily target has been reached.
- Respect configured quiet hours.
- Allow snoozing and dismissing reminders.
- Avoid treating an unrecorded notification as confirmed water consumption.
- Recalculate reminders when water intake is logged or the schedule changes.

Water targets must be user-configurable, not hardcoded.

# 8. Supplement Tracker

## 8.1 Supplement Configuration

The user must be able to add supplements such as creatine and vitamin D.

Each supplement should support:

- Supplement name.
- Dose and unit.
- Scheduled time.
- Applicable days.
- Optional instructions.
- Reminder enabled or disabled.
- Active or paused status.

The application records the user's configured supplement schedule; it does not independently prescribe doses.

## 8.2 Supplement Logging

Each scheduled occurrence must support:

- Taken.
- Skipped.
- Missed.

Record the scheduled time, actual completion time when applicable, and the associated supplement.

Users must be able to correct records.

## 8.3 Supplement History and Reminders

Provide:

- Daily supplement checklist.
- Configurable reminders.
- Supplement-specific completion history.
- Weekly and monthly adherence statistics.
- Ability to pause or edit schedules without deleting previous records.

# 9. Body Weight Tracker

The user wants two weigh-ins daily: one in the morning and one at night.

## 9.1 Weigh-in Schedule

Provide separate configurable reminder times for:

- Morning weight.
- Night weight.

Each reminder can be enabled or disabled independently.

## 9.2 Weight Recording

Each entry must contain:

- Weight in kilograms.
- Date and time.
- Measurement period: morning or night.
- Optional note.

The user must be able to edit or delete incorrect entries.

## 9.3 Weight History

Provide:

- Morning and evening weight shown separately.
- Daily record view.
- Calendar history.
- Weekly averages.
- Monthly averages.
- Weight trend charts.
- Comparison with prior weeks and months.

Do not combine morning and evening readings into one daily measurement. Both series must remain distinguishable in analytics.

Missing one weigh-in must not delete or invalidate the other.

# 10. Workout Program

The application must include the following initial weekly training schedule.

| Day | Program |
|---|---|
| Day 1 | Pull — Maximum Lat Width |
| Day 2 | Push — Shoulder Caps & Upper Chest |
| Day 3 | Legs |
| Day 4 | Pull — Maximum Lat Width |
| Day 5 | Push — Shoulder Caps & Upper Chest |
| Day 6 | V-Taper Amplifier |
| Day 7 | Rest / recovery |

Days 4 and 5 repeat Days 1 and 2, respectively.

The program must support editing exercises, sets, rep ranges, and execution notes without rewriting historical sessions.

## 10.1 Day 1 and Day 4: Pull — Maximum Lat Width

| Exercise | Sets | Target reps | Execution focus |
|---|---:|---:|---|
| Single-Arm Kneeling Cable Pulldown | 4 | 8–12 | Drive the elbow toward the hip. |
| Chest-Supported Machine Row | 4 | 8–10 | Flared elbows to emphasize upper back and rear delts. |
| Neutral Grip Cable Pulldown | 3 | 10–12 | Use a V-bar or MAG grip and stretch fully at the top. |
| Single-Arm Cable Curls (Facing Away) | 3 | 10–12 | Maintain tension through the biceps stretch. |
| Lat Pulldown Cable Crunch (Face-Away) | 4 | 12–15 | Bring the ribs toward the pelvis with a controlled crunch. |
| Reverse Crunch With Ab Mat | 4 | 15–20 | Bring knees toward the chest and lift the glutes off the mat. |

## 10.2 Day 2 and Day 5: Push — Shoulder Caps & Upper Chest

| Exercise | Sets | Target reps | Execution focus |
|---|---:|---:|---|
| Low-Incline Dumbbell Press (30°) | 4 | 8–10 | Emphasize the upper chest. |
| Seated Dumbbell Shoulder Press | 4 | 8–10 | Compound shoulder exercise. |
| Cable Lateral Raises (Behind Back) | 4 | 12–15 | Maintain constant tension on the side deltoid. |
| Pec Deck Fly Machine | 3 | 10–12 | Control the stretch and contraction. |
| Cross-Body Cable Tricep Extensions | 4 | 12–15 | Pull across the body with controlled movement. |

## 10.3 Day 3: Legs

| Exercise | Sets | Target reps | Execution focus |
|---|---:|---:|---|
| Hack Squat | 4 | 8–12 | Use a controlled, comfortable range of motion. |
| Leg Extensions | 3 | 12–15 | Hold the contraction at the top for one second. |
| Seated Leg Curls | 4 | 10–12 | Lean forward to emphasize the hamstring stretch, where comfortable. |
| Seated Calf Raises | 4 | 15–20 | Pause at the bottom stretch for two seconds. |
| Lat Pulldown Cable Crunch (Face-Away) | 4 | 12–15 | Focus on controlled spinal flexion rather than pulling with the arms. |
| Reverse Crunch With Ab Mat | 4 | 15–20 | Control the lowering phase. |

## 10.4 Day 6: V-Taper Amplifier

| Exercise | Sets | Target reps | Execution focus |
|---|---:|---:|---|
| Dumbbell Lateral Raises (Heavy) | 5 | 10–15 | Controlled lowering phase. |
| Wide Grip Lat Pulldowns | 4 | 10–12 | Pull toward the upper chest with controlled movement. |
| Cable Face Pulls | 3 | 15 | Emphasize rear delts with controlled form. |
| Lat Pulldown Cable Crunch (Face-Away) | 4 | To failure | Use a load and range of motion that can be controlled. |
| Reverse Crunch With Ab Mat | 4 | To failure | Control the movement and contract the lower abs. |

For exercises prescribed to failure, the interface should display “To failure” rather than inventing a fixed rep target.

## 10.5 Exercise Information

Each exercise must support:

- Exercise name.
- Assigned workout days.
- Prescribed sets.
- Minimum and maximum rep targets, where applicable.
- Execution instructions.
- Video tutorial URL.
- Optional exercise notes.
- Active or archived status.

Video links must be editable so that tutorial URLs can be added or replaced.

# 11. Interactive Workout Tracker

This is a core feature of the application.

## 11.1 Starting a Workout

When the user presses **Start Workout**, the application must:

1. Load the scheduled workout.
2. Display its complete exercise list in the configured order.
3. Show planned sets and rep ranges.
4. Show the previous performance for each exercise when history exists.
5. Allow the user to open any exercise and begin recording sets.
6. Save an active workout so it can be resumed if interrupted.

The user must be able to start a workout manually, including a workout on a different day.

## 11.2 Exercise Screen

When an exercise is opened, show:

- Exercise name and instructions.
- Tutorial video link.
- Planned sets and reps.
- Previous session date.
- Previous set-by-set performance.
- Suggested starting weight, where enough history exists.
- Current session sets and completion status.

Previous performance should be visible before the user begins the next set, not hidden in a separate analytics screen.

## 11.3 Set Logging

For each planned set, allow the user to record:

- Actual weight.
- Actual reps.
- RPE or difficulty.
- Set status.
- Optional note.

The interface should distinguish planned values from actual values.

When a set is completed, save its actual information. For example:

| Set | Weight | Reps | Difficulty | Status |
|---|---:|---:|---|---|
| 1 | 30 kg | 12 | Moderate | Completed |
| 2 | 40 kg | 12 | Hard | Completed |
| 3 | 50 kg | 10 | Very hard | Completed |
| 4 | 50 kg | 5 | Very hard | Completed |

This example illustrates the required logging format, not a prescribed training progression.

A set that falls short of the target must still be recordable. The app must not discard actual performance because the user missed the prescribed rep range.

## 11.4 Set Completion Actions

Each set should provide a clear **Complete Set** action.

When pressed, allow the user to:

1. Enter or confirm actual weight.
2. Enter actual reps.
3. Select difficulty or RPE.
4. Save the set as completed.
5. Receive a suggestion for the next set when applicable.

Users must be able to edit an entry if they make a mistake.

Support completed, failed, and skipped statuses. Actual weight and reps should be retained when a set is completed despite falling short of its target.

## 11.5 Normal Sets and Rest

Only normal working sets are required.

Do not implement drop-set modes or drop-set-specific workflows.

After a set:

- Start the configured rest timer.
- Allow the user to stop, pause, resume, or skip the timer.
- After resting, allow the user to proceed to the next set.
- If the load was too heavy, allow the user to reduce the weight for the next normal set.

The application should recommend a suitable adjustment when the recorded performance indicates that the weight was too heavy, but the user makes the final decision.

## 11.6 Workout Completion

When the user finishes the session:

- Save the workout's completion time and date.
- Preserve all exercise and set data.
- Display a summary of exercises and sets completed.
- Show any skipped or incomplete sets.
- Update workout calendar and analytics.
- Update personal records and progression data when applicable.

If the user leaves without finishing, the workout must remain resumable rather than being silently discarded.

# 12. Adaptive Weight and Rep Suggestions

The app must suggest weights based on actual performance, target reps, and recorded difficulty.

Suggestions must never force a weight, automatically change the user's logged performance, or prevent manual input.

## 12.1 Difficulty Input

Allow the user to record difficulty using a simple control, an RPE scale from 1 to 10, or both.

The interface should make the scale understandable, including the difference between a comfortable set and a set taken close to failure.

RPE 10 represents maximum effort; lower values represent progressively easier effort.

## 12.2 Next-Set Suggestions

After a set is logged, consider:

- Prescribed rep range.
- Actual weight.
- Actual reps.
- Recorded RPE or difficulty.
- Previous sets in the current workout.
- Relevant historical performance.

Suggested behaviour:

- If the user achieves the target with manageable difficulty, recommend maintaining the load unless there is evidence to progress.
- If the user falls substantially below the minimum rep target or reports maximal difficulty, suggest a conservative reduction for the next set after rest.
- If performance is unexpectedly easy, suggest maintaining the current load or a small increase where appropriate.
- If data is insufficient, present the previous load or target as a starting point instead of inventing a precise recommendation.

For example, if the target is 8–12 reps but the user manages only 5 reps at 40 kg and reports that the set was too difficult, the app may suggest reducing the load for the next normal set.

## 12.3 Next-Workout Progression

At the next session for an exercise:

- Compare performance with the previous comparable workout.
- Consider completed reps across working sets.
- Consider RPE or recorded difficulty.
- Suggest a load increase when the user repeatedly completes the top of the target range with manageable effort.
- Suggest maintaining or reducing the load when performance indicates that the current load is too difficult.
- Avoid large jumps in suggested weight.
- Round suggestions to configurable load increments, where available.

Suggestions must be presented as optional recommendations.

The application must not claim that an increase is mandatory or guaranteed to produce better results.

## 12.4 Transparency

Show a short explanation for recommendations, such as:

- “Suggested because you reached the top of the rep range last session.”
- “Suggested reduction because you fell below the minimum rep target.”
- “Maintaining the load because difficulty was high.”

The user must be able to accept, change, or ignore the recommendation.

# 13. Rest Timer

The rest timer must support:

- Configurable default rest duration.
- Exercise-specific rest duration.
- Start, pause, resume, and skip.
- Visible remaining time.
- End-of-rest notification or sound, subject to device permissions.
- Automatic start after completing a set when enabled.

The timer must not prevent the user from beginning the next set early or resting longer.

# 14. Workout Calendar and History

Provide a calendar or date-based view containing workout records.

Users must be able to:

- See completed workouts by date.
- See scheduled rest days.
- Open any historical session.
- Review exercise order and all recorded sets.
- Compare performance across sessions.
- View missed or incomplete sessions.
- Resume interrupted sessions.
- Identify personal records.

Changing a workout template must not rewrite previous workout records.

## 14.1 Personal Records

Track relevant records using saved data, including:

- Highest recorded weight for an exercise.
- Highest reps at a given weight.
- Best completed performance by exercise.

Records should be based on actual saved sets rather than suggested weights.

# 15. Weekly and Monthly Analytics

The app must provide both weekly and monthly reporting.

## 15.1 Habit Analytics

Display:

- Completion percentage.
- Completed, missed, and skipped counts.
- Habit-specific history.
- Current and best streaks.

The calculation must exclude unscheduled days.

## 15.2 Hydration Analytics

Display:

- Daily intake.
- Daily target attainment.
- Weekly average intake.
- Monthly trend.
- Number of days the target was reached.

## 15.3 Supplement Analytics

Display:

- Scheduled doses.
- Doses recorded as taken.
- Missed and skipped occurrences.
- Completion percentage by supplement.

## 15.4 Weight Analytics

Display:

- Morning weight trend.
- Night weight trend.
- Weekly averages.
- Monthly averages.
- Comparison with previous periods.

Morning and night readings must not be mixed when calculating separate trend lines.

## 15.5 Workout Analytics

Display:

- Workouts planned and completed.
- Workout frequency.
- Exercise performance history.
- Progression in weight and reps.
- Completed sets.
- Total repetitions.
- Training volume, calculated from actual weight and repetitions where meaningful.
- Personal records.
- Weekly and monthly comparisons.

Use recorded values only. Missing data must not be silently interpreted as zero performance.

# 16. Notifications and Reminders

The app must support reminders for:

- Water intake.
- Supplements.
- Scheduled habits.
- Morning weigh-in.
- Night weigh-in.
- Scheduled workouts.
- Rest timer completion.

## 16.1 Reminder Controls

The user must be able to:

- Enable or disable each reminder type.
- Change reminder time or frequency.
- Snooze or dismiss a reminder.
- Configure waking hours and quiet hours.
- Change reminder settings without losing historical logs.

A reminder notification is not evidence that the activity was completed. Completion must be recorded separately.

The implementation must handle notification permissions and device limitations gracefully. Where background or system notifications are unavailable, the app must communicate this clearly and continue to show the due activity in the dashboard.

# 17. Settings

Include configuration for:

- Daily water target.
- Water units and quick-add amounts.
- Water reminder mode and interval.
- Waking hours and quiet hours.
- Morning and night weigh-in times.
- Supplement schedules.
- Habit schedules.
- Workout-day schedule.
- Default and exercise-specific rest times.
- Weight increments used for exercise suggestions.
- Notification preferences.

The user must be able to edit habits, supplements, and workout templates without deleting their history.

# 18. Data Model

Use relational tables in Supabase. The following entities form the initial proposed schema.

## 18.1 Habits

Store habit definitions:

- `id`
- `name`
- `description`
- `schedule_config`
- `reminder_config`
- `is_active`
- `created_at`
- `updated_at`

## 18.2 Habit Logs

Store daily habit status:

- `id`
- `habit_id`
- `date`
- `status`
- `completed_at`
- `notes`

Add a uniqueness constraint for the relevant habit and scheduled date so duplicate daily logs cannot be created.

## 18.3 Hydration Entries

Store individual water intake records:

- `id`
- `quantity_ml`
- `logged_at`
- `notes`
- `created_at`

## 18.4 Supplements

Store supplement definitions:

- `id`
- `name`
- `dose_value`
- `dose_unit`
- `schedule_config`
- `instructions`
- `reminder_config`
- `is_active`
- `created_at`
- `updated_at`

## 18.5 Supplement Logs

Store scheduled supplement outcomes:

- `id`
- `supplement_id`
- `scheduled_at`
- `status`
- `taken_at`
- `notes`

## 18.6 Weigh-Ins

Store morning and night measurements:

- `id`
- `weight_kg`
- `measurement_period`
- `measured_at`
- `notes`
- `created_at`
- `updated_at`

## 18.7 Workout Days

Store workout templates:

- `id`
- `day_number`
- `name`
- `workout_type`
- `is_rest_day`
- `created_at`
- `updated_at`

## 18.8 Exercises

Store reusable exercise definitions:

- `id`
- `name`
- `instructions`
- `video_url`
- `default_rest_seconds`
- `is_active`
- `created_at`
- `updated_at`

## 18.9 Workout Exercise Assignments

Store exercises assigned to each workout template:

- `id`
- `workout_day_id`
- `exercise_id`
- `sort_order`
- `planned_sets`
- `minimum_reps`
- `maximum_reps`
- `target_type`
- `execution_focus`
- `created_at`
- `updated_at`

`target_type` must support fixed rep ranges and “to failure” targets.

## 18.10 Workout Sessions

Store each occurrence of a workout:

- `id`
- `workout_day_id`
- `workout_date`
- `started_at`
- `finished_at`
- `status`
- `notes`
- `created_at`
- `updated_at`

## 18.11 Workout Sets

Store actual set performance:

- `id`
- `workout_session_id`
- `exercise_id`
- `set_number`
- `planned_weight`
- `actual_weight`
- `actual_reps`
- `rpe`
- `difficulty`
- `status`
- `notes`
- `completed_at`
- `created_at`
- `updated_at`

Suggestions must be generated from actual history and must not overwrite these records.

## 18.12 Application Settings

Store preferences such as:

- Daily water target.
- Water reminder mode and interval.
- Waking hours and quiet hours.
- Morning and night weighing schedules.
- Default rest time.
- Notification preferences.
- Load increment preferences.

## 18.13 Data Integrity

- Use foreign keys for related records.
- Store measured weight and water quantities in consistent units.
- Validate rep counts, weights, and timestamps.
- Preserve completed workout data if an exercise template is renamed or archived.
- Use soft archival for historical definitions where appropriate.
- Use database transactions where a multi-record update must succeed or fail together.

Weekly and monthly analytics should be derived from persisted records instead of storing manually maintained aggregate numbers that can become inconsistent.

# 19. Core User Journeys

## Journey A: Start and Complete a Workout

1. Open the dashboard.
2. Select **Start Workout**.
3. View the scheduled exercise list.
4. Open an exercise.
5. Review last-session performance.
6. Review the suggested starting weight.
7. Perform a set and enter actual weight, reps, and difficulty.
8. Complete the set and review the next-set suggestion.
9. Rest using the timer.
10. Continue until all planned exercises are completed or skipped.
11. Finish the workout.
12. Review the session summary and updated history.

## Journey B: Log Water

1. Open the dashboard or receive a water reminder.
2. Select a quick-add quantity or enter a custom amount.
3. Save the intake.
4. See the updated daily total and target progress.
5. The reminder schedule adjusts to the recorded intake and configured settings.

## Journey C: Record Weight

1. Open the dashboard or receive the morning weigh-in reminder.
2. Enter the measured weight.
3. Save the entry as a morning measurement.
4. Repeat separately at night.
5. Review both records in weight history and analytics.

## Journey D: Track a Habit

1. Open the dashboard or habit screen.
2. Select the habit.
3. Mark it completed, missed, or skipped.
4. See the updated daily completion status.
5. Review historical consistency in analytics.

## Journey E: Track Supplements

1. Open the dashboard or receive a supplement reminder.
2. View the due supplement and configured dose.
3. Mark it taken or skipped.
4. Save the record.
5. Review supplement adherence later.

# 20. Non-Functional Requirements

## Performance

- Dashboard should load quickly under normal network conditions.
- Workout set logging should require minimal waiting.
- Historical exercise performance should be accessible without navigating away from the current exercise.
- Use appropriate indexes for date-based and exercise-history queries.

## Reliability

- Persist a workout session and its completed sets promptly.
- Avoid duplicate records caused by repeated taps or retried requests.
- Preserve interrupted workouts.
- Handle temporary network failures without losing unsynchronized user input.
- Clearly distinguish a saved record from one that has not yet reached Supabase.

## Accessibility and Usability

- Touch targets must be suitable for mobile use.
- Numeric controls must be easy to operate between sets.
- Important status labels must not rely on color alone.
- Provide confirmation for deleting records.
- Keep routine actions consistent across screens.

## Security and Privacy

- No login or signup screens.
- No multi-user features.
- Do not ship Supabase service-role credentials to the client.
- Avoid unrestricted public database operations.
- Restrict deployment at the infrastructure level when no application authentication is used.
- Do not store unnecessary personal information.

# 21. Acceptance Criteria

The initial release is complete when all of the following are true:

### Dashboard and habits

- [ ] The dashboard shows today's workout, habits, hydration, supplements, and weigh-in status.
- [ ] No sugar and no fast food are available as initial habits.
- [ ] The user can create custom habits.
- [ ] Completed, missed, and skipped statuses are retained in history.
- [ ] Weekly and monthly habit summaries work.

### Hydration and supplements

- [ ] Water intake can be logged by quantity.
- [ ] The daily water target is configurable.
- [ ] Fixed-interval and target-based reminder modes are available.
- [ ] Supplement definitions and schedules are editable.
- [ ] Supplement completion and adherence are recorded.

### Body weight

- [ ] Separate morning and night weigh-in reminders are available.
- [ ] Weight entries include a timestamp and measurement period.
- [ ] Both measurement series are visible in history and analytics.

### Workout tracker

- [ ] The six-day program is configured as specified.
- [ ] The rest day is represented correctly.
- [ ] Each exercise supports an editable video link and execution instructions.
- [ ] The user can start, interrupt, resume, and finish a workout.
- [ ] Previous exercise performance is shown before recording new sets.
- [ ] Actual weight, reps, and difficulty can be saved for every set.
- [ ] Sets that fall short of target reps can still be recorded.
- [ ] The app suggests next-set and next-workout weights when sufficient data exists.
- [ ] Suggestions remain optional.
- [ ] Normal sets and a rest timer are supported.
- [ ] No drop-set workflow is present.
- [ ] Historical sessions survive template edits.

### Progress and infrastructure

- [ ] Workout calendar and session history work.
- [ ] Weekly and monthly analytics use recorded data.
- [ ] Personal records are based on actual performance.
- [ ] Supabase stores all important records.
- [ ] Data export and the configured backup/recovery process are verified.
- [ ] The application does not require user authentication.
- [ ] The deployment does not expose unrestricted database access.

# 22. Recommended Implementation Order

## Phase 1 — Foundation

- Mobile-first layout and navigation.
- Supabase schema and migrations.
- Application settings.
- Dashboard structure.
- Seed the six-day workout program.

## Phase 2 — Workout Tracking

- Workout calendar and sessions.
- Exercise details and video links.
- Set logging and history.
- Rest timer.
- Resume interrupted workouts.

## Phase 3 — Progression

- Previous-session comparison.
- RPE and difficulty input.
- Next-set suggestions.
- Next-workout progression suggestions.
- Personal records and workout analytics.

## Phase 4 — Daily Tracking

- Habit tracker.
- Water tracker.
- Supplement tracker.
- Morning and night weight tracker.
- Notification scheduling and preferences.

## Phase 5 — Analytics and Release

- Weekly and monthly reports.
- Calendar history.
- Data export.
- Backup and recovery verification.
- Mobile usability testing.
- Error handling and data-integrity testing.

---

# Final Product Definition

The application is a **single-user, mobile-first fitness and habit tracker powered by Supabase**. It combines a configurable six-day workout program, fast set logging, historical exercise comparisons, optional adaptive weight suggestions, a rest timer, habit tracking, water reminders, supplement schedules, morning and night weigh-ins, workout history, and weekly/monthly analytics.

The central requirement is that **all important user activity is recorded accurately, prior performance is easy to access, and suggestions assist the user without ever forcing a training decision**.