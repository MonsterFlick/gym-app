import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NoiseBackground } from '../../components/ui/NoiseBackground';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Icon } from '../../components/ui/Icon';
import { useWorkoutStore } from '../../stores/workoutStore';

export default function WorkoutScreen() {
  const router = useRouter();
  const {
    activeSession,
    activeExercises,
    workoutDays,
    assignments,
    exercises,
    startWorkout,
    finishWorkout,
    abandonWorkout,
  } = useWorkoutStore();

  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  const handleOpenExercise = (exerciseId: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    router.push(`/exercise/${exerciseId}` as any);
  };

  const handleFinishWorkout = () => {
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish and save today’s workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          style: 'default',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            await finishWorkout();
          },
        },
      ]
    );
  };

  const handleAbandonWorkout = () => {
    Alert.alert(
      'Abandon Workout',
      'This will cancel the active session. Logged sets will still be archived.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Abandon',
          style: 'destructive',
          onPress: async () => {
            await abandonWorkout();
          },
        },
      ]
    );
  };

  // -------------------------------------------------------------
  // ACTIVE WORKOUT VIEW
  // -------------------------------------------------------------
  if (activeSession) {
    const totalExercises = activeExercises.length;
    const completedExercisesCount = activeExercises.filter((ae) =>
      ae.sets.length > 0 && ae.sets.every((s) => s.status === 'completed' || s.status === 'skipped')
    ).length;

    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <NoiseBackground style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.tagRow}>
                <View style={styles.activeDot} />
                <Text style={styles.activeTagText}>SESSION ACTIVE</Text>
              </View>
              <TouchableOpacity onPress={handleAbandonWorkout} activeOpacity={0.7}>
                <Text style={styles.abandonText}>Abandon</Text>
              </TouchableOpacity>
            </View>

            <Text style={[typography.title1, styles.sessionTitle]}>
              {activeSession.workout_day?.name}
            </Text>

            <Text style={styles.progressSub}>
              {completedExercisesCount} of {totalExercises} exercises completed
            </Text>
          </View>


          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* List of exercises to perform */}
            <View style={styles.exerciseList}>
              {activeExercises.map((ae, idx) => {
                const { exercise, assignment, sets } = ae;
                const completedSets = sets.filter((s) => s.status === 'completed').length;
                const isAllDone = completedSets === sets.length;

                return (
                  <TouchableOpacity
                    key={exercise.id}
                    activeOpacity={0.7}
                    onPress={() => handleOpenExercise(exercise.id)}
                    style={[styles.exerciseRow, isAllDone && styles.exerciseRowDone]}
                  >
                    <View style={[styles.numberCircle, isAllDone && styles.numberCircleDone]}>
                      {isAllDone ? (
                        <Icon name="Check" size={14} color="#FFFFFF" weight="bold" />
                      ) : (
                        <Text style={styles.numberText}>{idx + 1}</Text>
                      )}
                    </View>

                    <View style={styles.infoCol}>
                      <Text style={[styles.exerciseName, isAllDone && styles.exerciseNameDone]}>
                        {exercise.name}
                      </Text>
                      <Text style={styles.exerciseSpecs}>
                        {assignment.target_type === 'to_failure'
                          ? 'To failure'
                          : `${assignment.planned_sets} sets • ${assignment.minimum_reps}–${assignment.maximum_reps} reps`}
                      </Text>
                    </View>

                    <View style={styles.statusCol}>
                      <Text style={[styles.statusText, isAllDone && styles.statusTextDone]}>
                        {completedSets}/{sets.length}
                      </Text>
                      <Icon name="CaretRight" size="sm" color={colors.text.tertiary} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Finish Workout CTA */}
            <View style={styles.finishContainer}>
              <Button
                label="Finish Workout"
                variant="primary"
                size="lg"
                icon="CheckCircle"
                onPress={handleFinishWorkout}
              />
            </View>
          </ScrollView>
        </NoiseBackground>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // IDLE PROGRAM BROWSER VIEW
  // -------------------------------------------------------------
  const selectedDay =
    workoutDays.find((d) => d.day_number === selectedDayNumber) || workoutDays[0];

  const dayAssignments = assignments
    .filter((a) => a.workout_day_id === selectedDay.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <NoiseBackground style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.programSubtitle}>TRAINING PROGRAM</Text>
          <Text style={[typography.largeTitle, styles.headerTitle]}>Workouts</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Day Pills (1 to 7) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayPillScroll}
          >
            {workoutDays.map((d) => {
              const isSelected = d.day_number === selectedDayNumber;
              return (
                <TouchableOpacity
                  key={d.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedDayNumber(d.day_number)}
                  style={[styles.dayPill, isSelected && styles.dayPillActive]}
                >
                  <Text
                    style={[
                      styles.dayPillSub,
                      isSelected && styles.dayPillSubActive,
                    ]}
                  >
                    DAY {d.day_number}
                  </Text>
                  <Text
                    style={[
                      styles.dayPillTitle,
                      isSelected && styles.dayPillTitleActive,
                    ]}
                  >
                    {d.workout_type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Program Overview Card */}
          <Card variant="secondary" style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewDayTag}>
                DAY {selectedDay.day_number} • {selectedDay.workout_type.toUpperCase()}
              </Text>
              <Text style={[typography.title1, styles.previewTitle]}>
                {selectedDay.name}
              </Text>
            </View>

            {selectedDay.is_rest_day ? (
              <View style={styles.restDayInfo}>
                <Text style={styles.restDayText}>
                  Rest & recovery day. Focus on hydration, quality sleep, and light walking.
                </Text>
              </View>
            ) : (
              <View style={styles.previewList}>
                {dayAssignments.map((assignment, idx) => {
                  const ex = exercises.find((e) => e.id === assignment.exercise_id);
                  return (
                    <View
                      key={assignment.id}
                      style={[
                        styles.previewRow,
                        idx < dayAssignments.length - 1 && styles.previewRowBorder,
                      ]}
                    >
                      <Text style={styles.previewNumber}>{idx + 1}</Text>
                      <View style={styles.previewInfo}>
                        <Text style={styles.previewExName}>{ex?.name}</Text>
                        <Text style={styles.previewExTarget}>
                          {assignment.target_type === 'to_failure'
                            ? '4 sets • To failure'
                            : `${assignment.planned_sets} sets • ${assignment.minimum_reps}–${assignment.maximum_reps} reps`}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {!selectedDay.is_rest_day && (
              <View style={styles.startBtnContainer}>
                <Button
                  label={`Start Day ${selectedDay.day_number} Workout`}
                  variant="primary"
                  size="lg"
                  icon="Play"
                  onPress={async () => {
                    await startWorkout(selectedDay.day_number);
                  }}
                />
              </View>
            )}
          </Card>
        </ScrollView>
      </NoiseBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.primary,
  },
  activeTagText: {
    color: colors.brand.primary,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  abandonText: {
    color: colors.text.tertiary,
    fontWeight: '600',
    fontSize: 13,
  },
  sessionTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
    marginBottom: 4,
  },
  progressSub: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  programSubtitle: {
    color: colors.brand.primary,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    gap: spacing.lg,
  },
  exerciseList: {
    gap: spacing.md,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161618',
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  exerciseRowDone: {
    borderColor: 'rgba(48, 209, 88, 0.25)',
  },
  numberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  numberCircleDone: {
    backgroundColor: colors.status.success,
  },
  numberText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  infoCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  exerciseNameDone: {
    color: colors.text.secondary,
  },
  exerciseSpecs: {
    color: colors.text.tertiary,
    fontSize: 13,
    fontWeight: '500',
  },
  statusCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 13,
  },
  statusTextDone: {
    color: colors.status.success,
  },
  finishContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  dayPillScroll: {
    gap: spacing.sm,
  },
  dayPill: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#161618',
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    minWidth: 84,
  },
  dayPillActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  dayPillSub: {
    color: colors.text.tertiary,
    fontWeight: '700',
    fontSize: 10,
    marginBottom: 2,
  },
  dayPillSubActive: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
    fontSize: 10,
    marginBottom: 2,
  },
  dayPillTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  dayPillTitleActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  previewCard: {
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: '#161618',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  previewHeader: {
    marginBottom: spacing.lg,
  },
  previewDayTag: {
    color: colors.brand.primary,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  previewTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  previewList: {
    marginBottom: spacing.xl,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  previewRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  previewNumber: {
    color: colors.text.tertiary,
    fontWeight: '800',
    fontSize: 15,
    width: 28,
  },
  previewInfo: {
    flex: 1,
  },
  previewExName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  previewExTarget: {
    color: colors.text.tertiary,
    fontSize: 13,
  },
  restDayInfo: {
    paddingVertical: spacing.xl,
  },
  restDayText: {
    color: colors.text.secondary,
    lineHeight: 22,
    fontSize: 15,
  },
  startBtnContainer: {
    marginTop: spacing.xs,
  },
});
