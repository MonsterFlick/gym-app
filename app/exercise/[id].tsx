import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { calculateNextSetSuggestion, SuggestionResult } from '../../services/suggestions';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NoiseBackground } from '../../components/ui/NoiseBackground';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Icon } from '../../components/ui/Icon';
import { NumericStepper } from '../../components/ui/NumericStepper';
import { RestTimerWidget } from '../../components/workout/RestTimerWidget';
import { SetDifficulty } from '../../types/database';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { activeExercises, logSet } = useWorkoutStore();
  const { weight_increment_kg } = useSettingsStore();

  const exerciseIdx = activeExercises.findIndex((ae) => ae.exercise.id === id);
  const exerciseData = activeExercises[exerciseIdx];

  if (!exerciseData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <NoiseBackground style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="ArrowLeft" size="sm" color={colors.text.primary} weight="bold" />
              <Text style={styles.backBtnText}>Workout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={[typography.body, { color: colors.text.secondary }]}>
              Exercise not found or session finished.
            </Text>
          </View>
        </NoiseBackground>
      </SafeAreaView>
    );
  }

  const { exercise, assignment, sets, previousSets } = exerciseData;

  const firstPendingSet = sets.find((s) => s.status === 'pending') || sets[0];
  const [selectedSetNumber, setSelectedSetNumber] = useState<number>(firstPendingSet.set_number);

  const currentSet = sets.find((s) => s.set_number === selectedSetNumber) || sets[0];

  // Weight and Reps inputs
  const [weightInput, setWeightInput] = useState<number>(() => {
    if (currentSet.actual_weight !== null) return currentSet.actual_weight;
    // Auto-fill from prior completed set in this session if exists
    const priorCompleted = sets.filter((s) => s.status === 'completed' && s.actual_weight !== null).slice(-1)[0];
    if (priorCompleted && priorCompleted.actual_weight !== null) return priorCompleted.actual_weight;
    return currentSet.planned_weight || 0;
  });

  const [repsInput, setRepsInput] = useState<number>(() => {
    if (currentSet.actual_reps !== null) return currentSet.actual_reps;
    return 0; // Starts at 0 so user explicitly confirms/enters reps
  });

  const [difficultyInput, setDifficultyInput] = useState<SetDifficulty>(
    currentSet.difficulty || 'moderate'
  );
  const [setNote, setSetNote] = useState<string>(currentSet.notes || '');
  const [isNoteExpanded, setIsNoteExpanded] = useState<boolean>(!!currentSet.notes);
  const [suggestion, setSuggestion] = useState<SuggestionResult | null>(null);

  // When switching between Set pills, populate inputs
  useEffect(() => {
    const targetSet = sets.find((s) => s.set_number === selectedSetNumber) || sets[0];

    // Priority: target set actual values -> prior completed set in session -> planned weight
    const priorCompleted = sets.filter((s) => s.status === 'completed' && s.actual_weight !== null).slice(-1)[0];

    const initW = targetSet.actual_weight !== null
      ? targetSet.actual_weight
      : priorCompleted && priorCompleted.actual_weight !== null
      ? priorCompleted.actual_weight
      : targetSet.planned_weight || 0;

    const initR = targetSet.actual_reps !== null
      ? targetSet.actual_reps
      : 0;

    setWeightInput(initW);
    setRepsInput(initR);
    setDifficultyInput(targetSet.difficulty || 'moderate');
    setSetNote(targetSet.notes || '');
    setIsNoteExpanded(!!targetSet.notes);

    // Calculate suggestion based on most recently completed set
    const lastDone = sets.filter((s) => s.status === 'completed').slice(-1)[0];
    if (lastDone && lastDone.actual_weight && lastDone.actual_reps) {
      const sug = calculateNextSetSuggestion({
        currentWeight: lastDone.actual_weight,
        actualReps: lastDone.actual_reps,
        minReps: assignment.minimum_reps,
        maxReps: assignment.maximum_reps,
        rpe: lastDone.rpe,
        difficulty: lastDone.difficulty,
        incrementKg: weight_increment_kg,
      });
      setSuggestion(sug);
    } else {
      setSuggestion(null);
    }
  }, [selectedSetNumber]);

  // VALIDATION: Cannot complete set without reps and weight
  const isSetValid = repsInput > 0 && weightInput >= 0;

  const handleSaveSet = async (status: 'completed' | 'skipped' | 'failed') => {
    if (status === 'completed' && !isSetValid) {
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    await logSet({
      exerciseId: exercise.id,
      setNumber: selectedSetNumber,
      weight: weightInput,
      reps: repsInput,
      difficulty: difficultyInput,
      status,
      notes: setNote.trim() ? setNote.trim() : undefined,
    });

    // Advance to next set if available
    const nextSet = sets.find((s) => s.set_number === selectedSetNumber + 1);
    if (nextSet) {
      setSelectedSetNumber(nextSet.set_number);
    }
  };

  const handleNextExercise = () => {
    const nextExerciseData = activeExercises[exerciseIdx + 1];
    if (nextExerciseData) {
      router.replace(`/exercise/${nextExerciseData.exercise.id}` as any);
    } else {
      router.back();
    }
  };

  const completedSetsCount = sets.filter((s) => s.status === 'completed').length;
  const isAllSetsDone = completedSetsCount === sets.length;

  // Quick Chips for Reps
  const minTarget = assignment.minimum_reps || 8;
  const maxTarget = assignment.maximum_reps || 12;
  const repChips = [
    { label: `${minTarget}`, value: minTarget },
    { label: `${Math.round((minTarget + maxTarget) / 2)}`, value: Math.round((minTarget + maxTarget) / 2) },
    { label: `${maxTarget}`, value: maxTarget },
    { label: `${maxTarget + 2}`, value: maxTarget + 2 },
  ];

  // Quick Delta Chips for Weight
  const weightChips = [
    { label: `-${weight_increment_kg * 2}kg`, value: -(weight_increment_kg * 2), isDelta: true },
    { label: `-${weight_increment_kg}kg`, value: -weight_increment_kg, isDelta: true },
    { label: `+${weight_increment_kg}kg`, value: weight_increment_kg, isDelta: true },
    { label: `+${weight_increment_kg * 2}kg`, value: weight_increment_kg * 2, isDelta: true },
  ];

  // Most recent completed set in this exercise for quick reference
  const previousSetInSession = sets
    .filter((s) => s.set_number < selectedSetNumber && s.status === 'completed')
    .slice(-1)[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <NoiseBackground style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Icon name="ArrowLeft" size="sm" color={colors.text.primary} weight="bold" />
            <Text style={styles.backBtnText}>Workout</Text>
          </TouchableOpacity>

          <Text style={styles.orderBadge}>
            EXERCISE {exerciseIdx + 1} OF {activeExercises.length}
          </Text>

          {exercise.video_url ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => exercise.video_url && Linking.openURL(exercise.video_url)}
              style={styles.videoBtn}
            >
              <Icon name="Play" size="xs" color={colors.brand.primary} weight="fill" />
              <Text style={styles.videoBtnText}>Demo</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>

        {/* Floating Rest Timer */}
        <RestTimerWidget />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.exerciseTitle}>{exercise.name}</Text>
            {assignment.execution_focus && (
              <Text style={styles.focusText}>{assignment.execution_focus}</Text>
            )}
            <View style={styles.specsRow}>
              <Badge
                label={
                  assignment.target_type === 'to_failure'
                    ? 'Target: To failure'
                    : `Target: ${assignment.planned_sets} sets • ${assignment.minimum_reps}–${assignment.maximum_reps} reps`
                }
                variant="primary"
                size="sm"
              />
              <Text style={styles.completedCountText}>
                {completedSetsCount} / {sets.length} sets completed
              </Text>
            </View>
          </View>

          {/* Previous Session Performance */}
          {previousSets && previousSets.length > 0 && (
            <Card variant="secondary" style={styles.prevPerfCard}>
              <View style={styles.prevPerfHeader}>
                <Icon name="ArrowClockwise" size="xs" color={colors.text.secondary} />
                <Text style={styles.prevPerfLabel}>Last Session Performance</Text>
              </View>
              <Text style={styles.prevPerfSets}>
                {previousSets
                  .filter((ps) => ps.status === 'completed')
                  .map((ps) => `${ps.actual_weight}kg × ${ps.actual_reps}`)
                  .join('   •   ') || 'No completed sets'}
              </Text>
            </Card>
          )}

          {/* Set Selector Pills */}
          <View style={styles.setSelectorRow}>
            {sets.map((s) => {
              const isSelected = s.set_number === selectedSetNumber;
              const isDone = s.status === 'completed';
              const isSkip = s.status === 'skipped';
              const isFail = s.status === 'failed';

              return (
                <TouchableOpacity
                  key={s.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedSetNumber(s.set_number)}
                  style={[
                    styles.setPill,
                    isSelected && styles.setPillSelected,
                    isDone && !isSelected && styles.setPillDone,
                    isFail && !isSelected && styles.setPillFail,
                  ]}
                >
                  <Text
                    style={[
                      styles.setPillText,
                      isSelected && styles.setPillTextSelected,
                      isDone && !isSelected && styles.setPillTextDone,
                    ]}
                  >
                    Set {s.set_number}
                  </Text>
                  {isDone ? (
                    <View style={styles.pillCheck}>
                      <Icon
                        name="Check"
                        size={12}
                        color={isSelected ? '#FFFFFF' : colors.status.success}
                        weight="bold"
                      />
                    </View>
                  ) : isFail ? (
                    <View style={styles.pillCheck}>
                      <Icon name="X" size={12} color={colors.status.error} weight="bold" />
                    </View>
                  ) : isSkip ? (
                    <View style={styles.pillCheck}>
                      <Icon name="Minus" size={12} color={colors.text.tertiary} weight="bold" />
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* QoL Helper: Prior set in current session */}
          {previousSetInSession && (
            <View style={styles.priorSetHelper}>
              <Text style={styles.priorSetText}>
                Set {previousSetInSession.set_number} was:{' '}
                <Text style={styles.priorSetHighlight}>
                  {previousSetInSession.actual_weight} kg × {previousSetInSession.actual_reps} reps
                </Text>
              </Text>
            </View>
          )}

          {/* Suggestion Chip */}
          {suggestion && (
            <View
              style={[
                styles.suggestionChip,
                suggestion.direction === 'increase'
                  ? styles.sugIncrease
                  : suggestion.direction === 'decrease'
                  ? styles.sugDecrease
                  : styles.sugMaintain,
              ]}
            >
              <View style={styles.sugHeader}>
                <Icon
                  name={
                    suggestion.direction === 'increase'
                      ? 'ArrowUp'
                      : suggestion.direction === 'decrease'
                      ? 'ArrowDown'
                      : 'Target'
                  }
                  size="xs"
                  color={
                    suggestion.direction === 'increase'
                      ? colors.status.success
                      : suggestion.direction === 'decrease'
                      ? colors.brand.primary
                      : colors.status.info
                  }
                  weight="bold"
                />
                <Text style={styles.sugWeightText}>
                  Suggested: {suggestion.suggestedWeight} kg
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setWeightInput(suggestion.suggestedWeight)}
                  style={styles.sugApplyBtn}
                >
                  <Text style={styles.sugApplyText}>Apply</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sugReason}>{suggestion.reason}</Text>
            </View>
          )}

          {/* Steppers with Quick Chips */}
          <View style={styles.steppersContainer}>
            <NumericStepper
              label="Weight (kg)"
              value={weightInput}
              step={weight_increment_kg}
              min={0}
              unit="kg"
              onChange={setWeightInput}
              quickChips={weightChips}
            />

            <NumericStepper
              label="Reps Completed"
              value={repsInput}
              step={1}
              min={0}
              unit="reps"
              onChange={setRepsInput}
              quickChips={repChips}
              allowZero={false}
            />
          </View>

          {/* Effort / Difficulty Selector */}
          <View style={styles.diffSection}>
            <Text style={styles.diffLabel}>EFFORT LEVEL</Text>
            <View style={styles.diffPillsRow}>
              {(['easy', 'moderate', 'hard', 'very_hard', 'maximum'] as SetDifficulty[]).map(
                (diff) => (
                  <TouchableOpacity
                    key={diff}
                    activeOpacity={0.7}
                    onPress={() => setDifficultyInput(diff)}
                    style={[
                      styles.diffPill,
                      difficultyInput === diff && styles.diffPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.diffPillText,
                        difficultyInput === diff && styles.diffPillTextActive,
                      ]}
                    >
                      {diff.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* QoL: Optional Set Notes */}
          <View style={styles.noteSection}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsNoteExpanded(!isNoteExpanded)}
              style={styles.noteToggleRow}
            >
              <Icon name="PencilSimple" size="xs" color={colors.text.tertiary} />
              <Text style={styles.noteToggleText}>
                {isNoteExpanded ? 'Hide Note' : setNote ? 'Edit Note' : 'Add Note (Optional)'}
              </Text>
            </TouchableOpacity>

            {isNoteExpanded && (
              <TextInput
                value={setNote}
                onChangeText={setSetNote}
                placeholder="e.g. Good form, pause at stretch..."
                placeholderTextColor={colors.text.muted}
                style={styles.noteInput}
              />
            )}
          </View>

          {/* Set Actions & Validation */}
          <View style={styles.actionsContainer}>
            {/* Complete Set Button (Grayed out & disabled if reps <= 0) */}
            <TouchableOpacity
              activeOpacity={isSetValid ? 0.75 : 1}
              onPress={() => isSetValid && handleSaveSet('completed')}
              disabled={!isSetValid}
              style={[
                styles.completeButton,
                !isSetValid && styles.completeButtonDisabled,
              ]}
            >
              <Icon
                name="Check"
                size="sm"
                color={isSetValid ? '#FFFFFF' : colors.text.muted}
                weight="bold"
              />
              <Text
                style={[
                  styles.completeButtonText,
                  !isSetValid && styles.completeButtonTextDisabled,
                ]}
              >
                {!isSetValid
                  ? repsInput <= 0
                    ? 'Enter Reps to Complete'
                    : 'Enter Weight to Complete'
                  : `Complete Set ${selectedSetNumber}`}
              </Text>
            </TouchableOpacity>

            <View style={styles.subActionsRow}>
              <Button
                label="Failed Set"
                variant="ghost"
                size="sm"
                onPress={() => handleSaveSet('failed')}
                style={styles.subBtn}
              />
              <Button
                label="Skip Set"
                variant="secondary"
                size="sm"
                onPress={() => handleSaveSet('skipped')}
                style={styles.subBtn}
              />
            </View>
          </View>

          {/* Next Exercise Navigation */}
          {isAllSetsDone && (
            <View style={styles.nextExerciseSection}>
              <Button
                label={
                  exerciseIdx < activeExercises.length - 1
                    ? 'Next Exercise →'
                    : 'Workout Complete • View Summary'
                }
                variant="secondary"
                size="lg"
                onPress={handleNextExercise}
              />
            </View>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: spacing.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orderBadge: {
    color: colors.text.tertiary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  videoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    gap: 4,
  },
  videoBtnText: {
    color: colors.brand.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: spacing.massive,
    gap: spacing.lg,
  },
  titleSection: {
    marginBottom: spacing.xs,
  },
  exerciseTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  focusText: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedCountText: {
    color: colors.text.tertiary,
    fontSize: 13,
    fontWeight: '600',
  },
  prevPerfCard: {
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: '#161618',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  prevPerfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  prevPerfLabel: {
    color: colors.text.tertiary,
    fontSize: 12,
    fontWeight: '600',
  },
  prevPerfSets: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  setSelectorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  setPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#161618',
    borderRadius: radii.md,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  setPillSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  setPillDone: {
    borderColor: 'rgba(48, 209, 88, 0.3)',
    backgroundColor: 'rgba(48, 209, 88, 0.08)',
  },
  setPillFail: {
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  setPillText: {
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 13,
  },
  setPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  setPillTextDone: {
    color: colors.text.primary,
  },
  pillCheck: {
    marginLeft: 2,
  },
  priorSetHelper: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
  },
  priorSetText: {
    color: colors.text.tertiary,
    fontSize: 12,
  },
  priorSetHighlight: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  suggestionChip: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  sugIncrease: {
    backgroundColor: 'rgba(48, 209, 88, 0.1)',
    borderColor: 'rgba(48, 209, 88, 0.3)',
  },
  sugDecrease: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  sugMaintain: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  sugHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sugWeightText: {
    color: '#FFFFFF',
    fontWeight: '700',
    flex: 1,
  },
  sugApplyBtn: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  sugApplyText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  sugReason: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  steppersContainer: {
    gap: spacing.md,
  },
  diffSection: {
    marginTop: spacing.xs,
  },
  diffLabel: {
    color: colors.text.tertiary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  diffPillsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  diffPill: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: '#161618',
    borderRadius: radii.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  diffPillActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  diffPillText: {
    color: colors.text.secondary,
    textTransform: 'capitalize',
    fontSize: 10,
    fontWeight: '600',
  },
  diffPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noteSection: {
    marginTop: spacing.xs,
  },
  noteToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteToggleText: {
    color: colors.text.tertiary,
    fontSize: 13,
    fontWeight: '500',
  },
  noteInput: {
    marginTop: spacing.sm,
    height: 44,
    backgroundColor: '#161618',
    borderRadius: radii.md,
    color: '#FFFFFF',
    paddingHorizontal: spacing.md,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  actionsContainer: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  completeButton: {
    height: 52,
    backgroundColor: colors.brand.primary,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  completeButtonDisabled: {
    backgroundColor: '#1F1F24',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  completeButtonTextDisabled: {
    color: '#636366',
    fontWeight: '600',
    fontSize: 15,
  },
  subActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  subBtn: {
    flex: 1,
  },
  nextExerciseSection: {
    marginTop: spacing.md,
  },
});
