import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTimerStore } from '../../stores/timerStore';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../ui/Icon';
import { ProgressRing } from '../ui/ProgressRing';
export const RestTimerWidget: React.FC = () => {
  const {
    isActive,
    isPaused,
    totalSeconds,
    remainingSeconds,
    currentExerciseName,
    pauseTimer,
    resumeTimer,
    skipTimer,
    addSeconds,
  } = useTimerStore();

  if (!isActive && remainingSeconds === 0) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;

  return (
    <View style={styles.floatingCard}>
      <View style={styles.leftCol}>
        <ProgressRing
          progress={progress}
          size={48}
          strokeWidth={4}
          color={colors.brand.primary}
          backgroundColor={colors.background.elevated}
        >
          <Icon name="Timer" size={18} color={colors.brand.primary} weight="bold" />
        </ProgressRing>
      </View>

      <View style={styles.midCol}>
        <Text style={[typography.headline, styles.timerText]}>{timeFormatted}</Text>
        <Text style={[typography.caption2, styles.exerciseText]} numberOfLines={1}>
          {currentExerciseName ? `Rest: ${currentExerciseName}` : 'Rest Timer'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => addSeconds(30)}
          style={styles.pillButton}
        >
          <Text style={[typography.caption1, styles.pillText]}>+30s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={isPaused ? resumeTimer : pauseTimer}
          style={styles.circleButton}
        >
          <Icon
            name={isPaused ? 'Play' : 'Pause'}
            size="sm"
            color={colors.text.primary}
            weight="fill"
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={skipTimer}
          style={styles.circleButton}
        >
          <Icon name="SkipForward" size="sm" color={colors.text.secondary} weight="bold" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingCard: {
    backgroundColor: 'rgba(28, 28, 30, 0.94)',
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.35)',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  leftCol: {
    marginRight: spacing.md,
  },
  midCol: {
    flex: 1,
  },
  timerText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: -0.2,
  },
  exerciseText: {
    color: colors.text.secondary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pillButton: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radii.pill,
    marginRight: 4,
  },
  pillText: {
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
